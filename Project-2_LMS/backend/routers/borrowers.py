from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/borrowers", tags=["Borrowers"])


@router.get("/", response_model=List[schemas.Borrower])
def get_borrowers(db: Session = Depends(get_db)):
    return crud.get_borrowers(db)


@router.get("/{borrower_id}", response_model=schemas.Borrower)
def get_borrower(borrower_id: int, db: Session = Depends(get_db)):
    borrower = crud.get_borrower(db, borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Member not found")
    return borrower


@router.post("/", response_model=schemas.Borrower, status_code=201)
def create_borrower(borrower: schemas.BorrowerCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_borrower(db, borrower)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{borrower_id}", response_model=schemas.Borrower)
def update_borrower(borrower_id: int, borrower: schemas.BorrowerUpdate, db: Session = Depends(get_db)):
    try:
        updated = crud.update_borrower(db, borrower_id, borrower)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return updated


@router.delete("/{borrower_id}")
def delete_borrower(borrower_id: int, db: Session = Depends(get_db)):
    deleted, error = crud.delete_borrower(db, borrower_id)
    if error == "Borrower not found":
        raise HTTPException(status_code=404, detail=error)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Member removed successfully"}
