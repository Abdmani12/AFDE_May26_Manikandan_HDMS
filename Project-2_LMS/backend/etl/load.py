"""
ETL Stage 3 — Load
Upserts clean DataFrames into the main DB and recomputes analytics summary tables.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, text
import models
from database import SessionLocal


def _get_or_create_book(db: Session, row: pd.Series) -> models.Book:
    existing = db.query(models.Book).filter(models.Book.isbn == row["isbn"]).first()
    if existing:
        existing.title = row["title"]
        existing.author = row["author"]
        existing.category = row["category"]
        existing.availability_status = row["availability_status"]
        return existing
    book = models.Book(
        title=row["title"],
        author=row["author"],
        category=row["category"],
        isbn=row["isbn"],
        availability_status=row["availability_status"],
    )
    db.add(book)
    db.flush()
    return book


def _get_or_create_borrower(db: Session, row: pd.Series) -> models.Borrower:
    existing = db.query(models.Borrower).filter(models.Borrower.email == row["email"]).first()
    if existing:
        existing.borrower_name = row["borrower_name"]
        existing.phone = row["phone"]
        return existing
    borrower = models.Borrower(
        borrower_name=row["borrower_name"],
        email=row["email"],
        phone=row["phone"],
    )
    db.add(borrower)
    db.flush()
    return borrower


def load_books(books_df: pd.DataFrame, db: Session) -> dict:
    isbn_to_id = {}
    for _, row in books_df.iterrows():
        book = _get_or_create_book(db, row)
        isbn_to_id[row["isbn"]] = book.book_id
    db.commit()
    return isbn_to_id


def load_borrowers(borrowers_df: pd.DataFrame, db: Session) -> dict:
    email_to_id = {}
    for _, row in borrowers_df.iterrows():
        borrower = _get_or_create_borrower(db, row)
        email_to_id[row["email"]] = borrower.borrower_id
    db.commit()
    return email_to_id


def load_transactions(
    transactions_df: pd.DataFrame,
    isbn_to_id: dict,
    email_to_id: dict,
    db: Session,
) -> int:
    inserted = 0
    for _, row in transactions_df.iterrows():
        book_id = isbn_to_id.get(row["book_isbn"])
        borrower_id = email_to_id.get(row["borrower_email"])
        if book_id is None or borrower_id is None:
            continue
        existing = db.query(models.Transaction).filter(
            models.Transaction.book_id == book_id,
            models.Transaction.borrower_id == borrower_id,
            models.Transaction.borrow_date == row["borrow_date"],
        ).first()
        if existing:
            continue
        return_date = row["return_date"]
        if pd.isna(return_date):
            return_date = None
        txn = models.Transaction(
            book_id=book_id,
            borrower_id=borrower_id,
            borrow_date=row["borrow_date"],
            return_date=return_date,
        )
        db.add(txn)
        inserted += 1
    db.commit()
    return inserted


def _clear_analytics_tables(db: Session) -> None:
    db.query(models.AnalyticsBookPopularity).delete()
    db.query(models.AnalyticsMonthlyTrend).delete()
    db.query(models.AnalyticsCategoryStats).delete()
    db.commit()


def compute_book_popularity(db: Session) -> None:
    rows = (
        db.query(
            models.Book.book_id,
            models.Book.title,
            models.Book.author,
            models.Book.category,
            func.count(models.Transaction.transaction_id).label("borrow_count"),
        )
        .outerjoin(models.Transaction, models.Book.book_id == models.Transaction.book_id)
        .group_by(models.Book.book_id)
        .order_by(func.count(models.Transaction.transaction_id).desc())
        .all()
    )
    for r in rows:
        db.add(models.AnalyticsBookPopularity(
            book_id=r.book_id,
            title=r.title,
            author=r.author,
            category=r.category,
            borrow_count=r.borrow_count,
        ))
    db.commit()


def compute_monthly_trends(db: Session) -> None:
    rows = db.execute(text("""
        SELECT
            strftime('%Y', borrow_date) AS year,
            strftime('%m', borrow_date) AS month,
            COUNT(*) AS total_borrows,
            SUM(CASE WHEN return_date IS NOT NULL THEN 1 ELSE 0 END) AS total_returns
        FROM transactions
        GROUP BY year, month
        ORDER BY year, month
    """)).fetchall()
    for r in rows:
        db.add(models.AnalyticsMonthlyTrend(
            year=int(r.year),
            month=int(r.month),
            period_label=f"{r.year}-{r.month}",
            total_borrows=r.total_borrows,
            total_returns=int(r.total_returns or 0),
        ))
    db.commit()


def compute_category_stats(db: Session) -> None:
    rows = db.execute(text("""
        SELECT
            b.category,
            COUNT(DISTINCT b.book_id)  AS total_books,
            COUNT(t.transaction_id)    AS total_borrows,
            SUM(CASE WHEN b.availability_status = 'Borrowed' THEN 1 ELSE 0 END) AS currently_borrowed
        FROM books b
        LEFT JOIN transactions t ON b.book_id = t.book_id
        GROUP BY b.category
        ORDER BY total_borrows DESC
    """)).fetchall()
    for r in rows:
        db.add(models.AnalyticsCategoryStats(
            category=r.category,
            total_books=r.total_books,
            total_borrows=r.total_borrows,
            currently_borrowed=int(r.currently_borrowed or 0),
        ))
    db.commit()


def recompute_all_analytics(db: Session) -> None:
    _clear_analytics_tables(db)
    compute_book_popularity(db)
    compute_monthly_trends(db)
    compute_category_stats(db)
