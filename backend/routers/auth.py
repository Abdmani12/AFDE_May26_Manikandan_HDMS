from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserRegister, UserLogin, UserResponse, EmailCheckRequest, EmailCheckResponse
import crud

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/check-email", response_model=EmailCheckResponse)
def check_email(body: EmailCheckRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, body.email)
    return {"exists": user is not None}


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, data)


@router.post("/login", response_model=UserResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user
