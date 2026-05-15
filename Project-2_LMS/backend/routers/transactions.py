from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(tags=["Transactions"])


@router.get("/transactions", response_model=List[schemas.TransactionDetail])
def get_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)


@router.post("/borrow", status_code=201)
def borrow_book(data: schemas.TransactionCreate, db: Session = Depends(get_db)):
    txn, error = crud.borrow_book(db, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Book borrowed successfully", "transaction_id": txn.transaction_id}


@router.post("/return")
def return_book(data: schemas.ReturnBook, db: Session = Depends(get_db)):
    txn, error = crud.return_book(db, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Book returned successfully"}


@router.get("/search")
def search_books(q: str, db: Session = Depends(get_db)):
    return crud.search_books(db, q)
