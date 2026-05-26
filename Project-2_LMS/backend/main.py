from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine
import models
from routers import books, borrowers, transactions, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    _auto_seed_if_empty()
    yield


def _auto_seed_if_empty():
    """Seed the database with Indian library data if it is empty."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.Book).count() == 0:
            try:
                from seed_indian_library import seed
                print("Database is empty — running initial seed...")
                seed()
            except Exception as e:
                print(f"Auto-seed failed (run seed_indian_library.py manually): {e}")
    finally:
        db.close()


app = FastAPI(
    title="Library Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(borrowers.router)
app.include_router(transactions.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "Library Management System API", "docs": "/docs"}
