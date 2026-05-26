"""
ETL Stage 2 — Transform
Cleans and normalises the three raw DataFrames.
"""
import pandas as pd
from datetime import datetime
from dateutil import parser as dateutil_parser

VALID_CATEGORIES = {
    "Fiction", "Fantasy", "Horror", "Mystery", "Non-Fiction",
    "Science", "History", "Technology", "Arts", "Other",
}

VALID_STATUSES = {"Available", "Borrowed"}


def transform_books(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
    df = df[df["title"].notna() & (df["title"] != "") & (df["title"] != "nan")]
    df = df[df["isbn"].notna() & (df["isbn"] != "") & (df["isbn"] != "nan")]
    df["category"] = df["category"].str.title()
    df.loc[~df["category"].isin(VALID_CATEGORIES), "category"] = "Other"
    df["availability_status"] = df["availability_status"].fillna("Available")
    df.loc[~df["availability_status"].isin(VALID_STATUSES), "availability_status"] = "Available"
    df = df.drop_duplicates(subset=["isbn"], keep="first")
    return df.reset_index(drop=True)


def transform_borrowers(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
    df = df[df["borrower_name"].notna() & (df["borrower_name"] != "") & (df["borrower_name"] != "nan")]
    df = df[df["email"].notna() & (df["email"] != "") & (df["email"] != "nan")]
    df["email"] = df["email"].str.lower()
    df["phone"] = df["phone"].str.replace(r"[^\d]", "", regex=True)
    df.loc[df["phone"].str.len() < 7, "phone"] = "0000000000"
    df = df.drop_duplicates(subset=["email"], keep="first")
    return df.reset_index(drop=True)


def _parse_date(val: str):
    if not val or str(val).strip() in ("", "nan", "NaT", "None"):
        return None
    try:
        return dateutil_parser.parse(val.strip())
    except (ValueError, TypeError):
        return None


def transform_transactions(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
    df = df[df["book_isbn"].notna() & (df["book_isbn"] != "") & (df["book_isbn"] != "nan")]
    df = df[df["borrower_email"].notna() & (df["borrower_email"] != "") & (df["borrower_email"] != "nan")]
    df["borrower_email"] = df["borrower_email"].str.lower()
    df["borrow_date"] = df["borrow_date"].apply(_parse_date)
    df["return_date"] = df["return_date"].apply(_parse_date)
    df["return_date"] = df["return_date"].where(df["return_date"].notna(), other=None)
    df = df[df["borrow_date"].notna()]
    invalid_return = df["return_date"].notna() & (df["return_date"] < df["borrow_date"])
    df = df[~invalid_return]
    df = df.drop_duplicates(subset=["book_isbn", "borrower_email", "borrow_date"], keep="first")
    return df.reset_index(drop=True)
