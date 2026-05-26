"""
ETL Orchestrator — runs Extract → Transform → Load → Analytics in sequence.
Run from backend/ directory:
    python -m etl.pipeline
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import time
from database import SessionLocal
from etl.extract import extract_all
from etl.transform import transform_books, transform_borrowers, transform_transactions
from etl.load import (
    load_books, load_borrowers, load_transactions,
    recompute_all_analytics,
)


def run_pipeline() -> dict:
    start = time.time()

    # Stage 1: Extract
    raw_books, raw_borrowers, raw_transactions = extract_all()

    # Stage 2: Transform
    clean_books = transform_books(raw_books)
    clean_borrowers = transform_borrowers(raw_borrowers)
    clean_transactions = transform_transactions(raw_transactions)

    # Stage 3: Load
    db = SessionLocal()
    try:
        isbn_to_id = load_books(clean_books, db)
        email_to_id = load_borrowers(clean_borrowers, db)
        txn_count = load_transactions(clean_transactions, isbn_to_id, email_to_id, db)

        # Stage 4: Recompute analytics
        recompute_all_analytics(db)
    finally:
        db.close()

    return {
        "books_processed": len(clean_books),
        "borrowers_processed": len(clean_borrowers),
        "transactions_inserted": txn_count,
        "analytics_refreshed": True,
        "elapsed_seconds": round(time.time() - start, 2),
    }


if __name__ == "__main__":
    result = run_pipeline()
    print("ETL complete:", result)
