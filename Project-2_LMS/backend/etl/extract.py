"""
ETL Stage 1 — Extract
Reads the three CSV files from backend/data/ and returns raw DataFrames.
"""
import os
import pandas as pd
from typing import Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def extract_books() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "books.csv")
    return pd.read_csv(path, dtype=str)


def extract_borrowers() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "borrowers.csv")
    return pd.read_csv(path, dtype=str)


def extract_transactions() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "transactions.csv")
    return pd.read_csv(path, dtype=str)


def extract_all() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    return extract_books(), extract_borrowers(), extract_transactions()
