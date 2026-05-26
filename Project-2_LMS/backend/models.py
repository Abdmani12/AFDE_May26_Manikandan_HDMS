from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    isbn = Column(String, unique=True, nullable=False)
    availability_status = Column(String, default="Available")

    transactions = relationship("Transaction", back_populates="book")


class Borrower(Base):
    __tablename__ = "borrowers"

    borrower_id = Column(Integer, primary_key=True, index=True)
    borrower_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)

    transactions = relationship("Transaction", back_populates="borrower")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("borrowers.borrower_id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)

    book = relationship("Book", back_populates="transactions")
    borrower = relationship("Borrower", back_populates="transactions")


# ── Analytics Tables ──────────────────────────────────────────────

class AnalyticsBookPopularity(Base):
    __tablename__ = "analytics_book_popularity"

    id           = Column(Integer, primary_key=True, index=True)
    book_id      = Column(Integer, nullable=False)
    title        = Column(String, nullable=False)
    author       = Column(String, nullable=False)
    category     = Column(String, nullable=False)
    borrow_count = Column(Integer, default=0)


class AnalyticsMonthlyTrend(Base):
    __tablename__ = "analytics_monthly_trend"

    id            = Column(Integer, primary_key=True, index=True)
    year          = Column(Integer, nullable=False)
    month         = Column(Integer, nullable=False)
    period_label  = Column(String, nullable=False)
    total_borrows = Column(Integer, default=0)
    total_returns = Column(Integer, default=0)


class AnalyticsCategoryStats(Base):
    __tablename__ = "analytics_category_stats"

    id                 = Column(Integer, primary_key=True, index=True)
    category           = Column(String, nullable=False)
    total_books        = Column(Integer, default=0)
    total_borrows      = Column(Integer, default=0)
    currently_borrowed = Column(Integer, default=0)
