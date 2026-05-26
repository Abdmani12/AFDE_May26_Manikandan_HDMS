"""
Analytics router — all endpoints under /analytics prefix.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from datetime import datetime, timedelta
import models
import schemas
from database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

OVERDUE_DAYS = 14


# ── GET /analytics/popular-books ─────────────────────────────────

@router.get("/popular-books", response_model=schemas.PopularBooksResponse)
def get_popular_books(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.AnalyticsBookPopularity)
        .order_by(models.AnalyticsBookPopularity.borrow_count.desc())
        .limit(limit)
        .all()
    )
    if not rows:
        live = (
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
            .limit(limit)
            .all()
        )
        items = [
            schemas.PopularBookItem(
                book_id=r.book_id,
                title=r.title,
                author=r.author,
                category=r.category,
                borrow_count=r.borrow_count,
            )
            for r in live
        ]
        return schemas.PopularBooksResponse(items=items, total=len(items))

    items = [schemas.PopularBookItem.model_validate(r) for r in rows]
    return schemas.PopularBooksResponse(items=items, total=len(items))


# ── GET /analytics/category-stats ────────────────────────────────

@router.get("/category-stats", response_model=schemas.CategoryStatsResponse)
def get_category_stats(db: Session = Depends(get_db)):
    rows = (
        db.query(models.AnalyticsCategoryStats)
        .order_by(models.AnalyticsCategoryStats.total_borrows.desc())
        .all()
    )
    if not rows:
        live = db.execute(text("""
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
        items = [
            schemas.CategoryStatsItem(
                category=r.category,
                total_books=r.total_books,
                total_borrows=r.total_borrows,
                currently_borrowed=int(r.currently_borrowed or 0),
            )
            for r in live
        ]
        return schemas.CategoryStatsResponse(items=items)

    items = [schemas.CategoryStatsItem.model_validate(r) for r in rows]
    return schemas.CategoryStatsResponse(items=items)


# ── GET /analytics/monthly-trends ────────────────────────────────

@router.get("/monthly-trends", response_model=schemas.MonthlyTrendsResponse)
def get_monthly_trends(db: Session = Depends(get_db)):
    rows = (
        db.query(models.AnalyticsMonthlyTrend)
        .order_by(
            models.AnalyticsMonthlyTrend.year,
            models.AnalyticsMonthlyTrend.month,
        )
        .all()
    )
    if not rows:
        live = db.execute(text("""
            SELECT
                strftime('%Y', borrow_date) AS year,
                strftime('%m', borrow_date) AS month,
                COUNT(*) AS total_borrows,
                SUM(CASE WHEN return_date IS NOT NULL THEN 1 ELSE 0 END) AS total_returns
            FROM transactions
            GROUP BY year, month
            ORDER BY year, month
        """)).fetchall()
        items = [
            schemas.MonthlyTrendItem(
                year=int(r.year),
                month=int(r.month),
                period_label=f"{r.year}-{r.month}",
                total_borrows=r.total_borrows,
                total_returns=int(r.total_returns or 0),
            )
            for r in live
        ]
        return schemas.MonthlyTrendsResponse(items=items)

    items = [schemas.MonthlyTrendItem.model_validate(r) for r in rows]
    return schemas.MonthlyTrendsResponse(items=items)


# ── GET /analytics/overdue ────────────────────────────────────────

@router.get("/overdue", response_model=schemas.OverdueResponse)
def get_overdue(db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=OVERDUE_DAYS)
    txns = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.return_date == None,
            models.Transaction.borrow_date <= cutoff,
        )
        .order_by(models.Transaction.borrow_date.asc())
        .all()
    )
    now = datetime.utcnow()
    items = []
    for t in txns:
        days_overdue = max((now - t.borrow_date).days - OVERDUE_DAYS, 1)
        items.append(schemas.OverdueItem(
            transaction_id=t.transaction_id,
            book_id=t.book_id,
            book_title=t.book.title if t.book else f"Book #{t.book_id}",
            book_author=t.book.author if t.book else "Unknown",
            borrower_id=t.borrower_id,
            borrower_name=t.borrower.borrower_name if t.borrower else f"Borrower #{t.borrower_id}",
            borrower_email=t.borrower.email if t.borrower else "",
            borrow_date=t.borrow_date,
            days_overdue=days_overdue,
        ))
    return schemas.OverdueResponse(items=items, total_overdue=len(items))


# ── GET /analytics/summary ────────────────────────────────────────

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=OVERDUE_DAYS)

    total_books = db.query(func.count(models.Book.book_id)).scalar() or 0
    total_borrowers = db.query(func.count(models.Borrower.borrower_id)).scalar() or 0
    total_transactions = db.query(func.count(models.Transaction.transaction_id)).scalar() or 0
    active_loans = (
        db.query(func.count(models.Transaction.transaction_id))
        .filter(models.Transaction.return_date == None)
        .scalar() or 0
    )
    overdue_loans = (
        db.query(func.count(models.Transaction.transaction_id))
        .filter(
            models.Transaction.return_date == None,
            models.Transaction.borrow_date <= cutoff,
        )
        .scalar() or 0
    )

    top_category_row = (
        db.query(models.AnalyticsCategoryStats)
        .order_by(models.AnalyticsCategoryStats.total_borrows.desc())
        .first()
    )
    most_popular_category = top_category_row.category if top_category_row else "N/A"

    top_book_row = (
        db.query(models.AnalyticsBookPopularity)
        .order_by(models.AnalyticsBookPopularity.borrow_count.desc())
        .first()
    )
    top_book_title = top_book_row.title if top_book_row else "N/A"
    top_book_borrow_count = top_book_row.borrow_count if top_book_row else 0

    return schemas.AnalyticsSummary(
        total_books=total_books,
        total_borrowers=total_borrowers,
        total_transactions=total_transactions,
        active_loans=active_loans,
        overdue_loans=overdue_loans,
        most_popular_category=most_popular_category,
        top_book_title=top_book_title,
        top_book_borrow_count=top_book_borrow_count,
    )


# ── POST /analytics/run-etl ───────────────────────────────────────

@router.post("/run-etl", response_model=schemas.ETLRunResponse)
def run_etl_pipeline():
    try:
        from etl.pipeline import run_pipeline
        result = run_pipeline()
        return schemas.ETLRunResponse(
            success=True,
            message="ETL pipeline completed successfully.",
            **result,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"CSV file not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETL pipeline failed: {str(e)}")
