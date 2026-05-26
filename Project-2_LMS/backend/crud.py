from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import models
import schemas

MAX_ACTIVE_BORROWS_PER_MEMBER = 5  # library policy: max books at one time


# ── Books ──────────────────────────────────────────────
def get_books(db: Session):
    return db.query(models.Book).all()


def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.book_id == book_id).first()


def get_book_by_isbn(db: Session, isbn: str):
    return db.query(models.Book).filter(models.Book.isbn == isbn).first()


def create_book(db: Session, book: schemas.BookCreate):
    if get_book_by_isbn(db, book.isbn):
        raise ValueError(f"A book with ISBN '{book.isbn}' already exists.")
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_book(db: Session, book_id: int, book: schemas.BookUpdate):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    # Prevent changing ISBN to one already used by another book
    if book.isbn != db_book.isbn and get_book_by_isbn(db, book.isbn):
        raise ValueError(f"ISBN '{book.isbn}' is already used by another book.")
    # Prevent manually setting availability inconsistent with open transactions
    has_open_txn = db.query(models.Transaction).filter(
        models.Transaction.book_id == book_id,
        models.Transaction.return_date == None,
    ).first()
    update_data = book.model_dump()
    if has_open_txn:
        # Keep status as Borrowed — only /return can flip it back
        update_data["availability_status"] = "Borrowed"
    else:
        # No open loan — status must be Available
        update_data["availability_status"] = "Available"
    for field, value in update_data.items():
        setattr(db_book, field, value)
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if not db_book:
        return None, "Book not found"
    # Guard: cannot delete a book that is currently borrowed
    open_txn = db.query(models.Transaction).filter(
        models.Transaction.book_id == book_id,
        models.Transaction.return_date == None,
    ).first()
    if open_txn:
        return None, "Cannot delete a book that is currently borrowed. Return it first."
    db.delete(db_book)
    db.commit()
    return db_book, None


# ── Borrowers ──────────────────────────────────────────
def get_borrowers(db: Session):
    return db.query(models.Borrower).all()


def get_borrower(db: Session, borrower_id: int):
    return db.query(models.Borrower).filter(models.Borrower.borrower_id == borrower_id).first()


def get_borrower_by_email(db: Session, email: str):
    return db.query(models.Borrower).filter(models.Borrower.email == email).first()


def create_borrower(db: Session, borrower: schemas.BorrowerCreate):
    if get_borrower_by_email(db, borrower.email):
        raise ValueError(f"A member with email '{borrower.email}' is already registered.")
    db_borrower = models.Borrower(**borrower.model_dump())
    db.add(db_borrower)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def update_borrower(db: Session, borrower_id: int, borrower: schemas.BorrowerUpdate):
    db_borrower = get_borrower(db, borrower_id)
    if not db_borrower:
        return None
    # Prevent changing email to one already used by another member
    if borrower.email != db_borrower.email and get_borrower_by_email(db, borrower.email):
        raise ValueError(f"Email '{borrower.email}' is already used by another member.")
    for field, value in borrower.model_dump().items():
        setattr(db_borrower, field, value)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def delete_borrower(db: Session, borrower_id: int):
    db_borrower = get_borrower(db, borrower_id)
    if not db_borrower:
        return None, "Borrower not found"
    open_txn = db.query(models.Transaction).filter(
        models.Transaction.borrower_id == borrower_id,
        models.Transaction.return_date == None,
    ).first()
    if open_txn:
        return None, "Cannot remove a member who has unreturned books."
    db.delete(db_borrower)
    db.commit()
    return db_borrower, None


# ── Transactions ───────────────────────────────────────
def get_transactions(db: Session):
    txns = db.query(models.Transaction).order_by(models.Transaction.borrow_date.desc()).all()
    result = []
    for t in txns:
        result.append(schemas.TransactionDetail(
            transaction_id=t.transaction_id,
            book_id=t.book_id,
            borrower_id=t.borrower_id,
            borrow_date=t.borrow_date,
            return_date=t.return_date,
            book_title=t.book.title if t.book else None,
            book_author=t.book.author if t.book else None,
            borrower_name=t.borrower.borrower_name if t.borrower else None,
            borrower_email=t.borrower.email if t.borrower else None,
        ))
    return result


def borrow_book(db: Session, data: schemas.TransactionCreate):
    book = get_book(db, data.book_id)
    if not book:
        return None, "Book not found"
    if book.availability_status != "Available":
        return None, "Book is not available for borrowing"

    borrower = get_borrower(db, data.borrower_id)
    if not borrower:
        return None, "Member not found"

    # Enforce per-member borrow limit
    active_count = db.query(models.Transaction).filter(
        models.Transaction.borrower_id == data.borrower_id,
        models.Transaction.return_date == None,
    ).count()
    if active_count >= MAX_ACTIVE_BORROWS_PER_MEMBER:
        return None, (
            f"Member already has {active_count} book(s) borrowed. "
            f"Maximum allowed is {MAX_ACTIVE_BORROWS_PER_MEMBER}."
        )

    txn = models.Transaction(
        book_id=data.book_id,
        borrower_id=data.borrower_id,
        borrow_date=datetime.utcnow(),
    )
    book.availability_status = "Borrowed"
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn, None


def return_book(db: Session, data: schemas.ReturnBook):
    txn = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == data.transaction_id
    ).first()
    if not txn:
        return None, "Transaction not found"
    if txn.return_date is not None:
        return None, "Book has already been returned"

    txn.return_date = datetime.utcnow()
    book = get_book(db, txn.book_id)
    if book:
        book.availability_status = "Available"
    db.commit()
    db.refresh(txn)
    return txn, None


# ── Search ─────────────────────────────────────────────
def search_books(db: Session, query: str):
    query = query.strip()
    if not query:
        return []
    q = f"%{query}%"
    return db.query(models.Book).filter(
        or_(
            models.Book.title.ilike(q),
            models.Book.author.ilike(q),
            models.Book.category.ilike(q),
            models.Book.isbn.ilike(q),
        )
    ).all()
