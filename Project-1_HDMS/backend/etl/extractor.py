import pandas as pd
import os
from typing import Tuple


def extract_from_csv(file_path: str) -> Tuple[pd.DataFrame, int]:
    """Read CSV file and return raw DataFrame with row count."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    df = pd.read_csv(file_path, dtype=str)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    required = {"employee_name", "department", "issue_category", "description", "priority", "status", "created_at"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    raw_count = len(df)
    return df, raw_count
