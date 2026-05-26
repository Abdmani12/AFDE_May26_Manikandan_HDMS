from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BookBase(BaseModel):
    title: str
    author: str
    category: str
    isbn: str
    availability_status: str = "Available"


class BookCreate(BookBase):
    pass


class BookUpdate(BookBase):
    pass


class Book(BookBase):
    book_id: int

    class Config:
        from_attributes = True


class BorrowerBase(BaseModel):
    borrower_name: str
    email: str
    phone: str


class BorrowerCreate(BorrowerBase):
    pass


class BorrowerUpdate(BorrowerBase):
    pass


class Borrower(BorrowerBase):
    borrower_id: int

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    book_id: int
    borrower_id: int


class ReturnBook(BaseModel):
    transaction_id: int


class Transaction(BaseModel):
    transaction_id: int
    book_id: int
    borrower_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionDetail(BaseModel):
    transaction_id: int
    book_id: int
    borrower_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    borrower_name: Optional[str] = None
    borrower_email: Optional[str] = None

    class Config:
        from_attributes = True


# ── Analytics Schemas ─────────────────────────────────────────────

class PopularBookItem(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    borrow_count: int

    class Config:
        from_attributes = True


class PopularBooksResponse(BaseModel):
    items: List[PopularBookItem]
    total: int


class MonthlyTrendItem(BaseModel):
    year: int
    month: int
    period_label: str
    total_borrows: int
    total_returns: int

    class Config:
        from_attributes = True


class MonthlyTrendsResponse(BaseModel):
    items: List[MonthlyTrendItem]


class CategoryStatsItem(BaseModel):
    category: str
    total_books: int
    total_borrows: int
    currently_borrowed: int

    class Config:
        from_attributes = True


class CategoryStatsResponse(BaseModel):
    items: List[CategoryStatsItem]


class OverdueItem(BaseModel):
    transaction_id: int
    book_id: int
    book_title: str
    book_author: str
    borrower_id: int
    borrower_name: str
    borrower_email: str
    borrow_date: datetime
    days_overdue: int

    class Config:
        from_attributes = True


class OverdueResponse(BaseModel):
    items: List[OverdueItem]
    total_overdue: int


class AnalyticsSummary(BaseModel):
    total_books: int
    total_borrowers: int
    total_transactions: int
    active_loans: int
    overdue_loans: int
    most_popular_category: str
    top_book_title: str
    top_book_borrow_count: int


class ETLRunResponse(BaseModel):
    success: bool
    books_processed: int
    borrowers_processed: int
    transactions_inserted: int
    analytics_refreshed: bool
    elapsed_seconds: float
    message: str
