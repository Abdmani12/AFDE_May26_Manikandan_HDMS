from pydantic import BaseModel
from typing import Optional
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
