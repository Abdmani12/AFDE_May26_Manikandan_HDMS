import pandas as pd
from typing import Tuple

PRIORITY_MAP = {
    "critical": "Critical", "crit": "Critical", "urgent": "Critical",
    "high": "High", "hi": "High",
    "medium": "Medium", "med": "Medium", "normal": "Medium",
    "low": "Low", "lo": "Low", "minor": "Low",
}

STATUS_MAP = {
    "open": "Open", "new": "Open",
    "in progress": "In Progress", "in_progress": "In Progress", "inprogress": "In Progress", "wip": "In Progress",
    "pending": "Pending", "on hold": "Pending", "on_hold": "Pending",
    "resolved": "Resolved", "fixed": "Resolved", "done": "Resolved",
    "closed": "Closed", "complete": "Closed", "completed": "Closed",
}

CATEGORY_MAP = {
    "vpn": "VPN Issue", "vpn issue": "VPN Issue", "vpn problem": "VPN Issue",
    "password": "Password Reset", "password reset": "Password Reset", "pwd reset": "Password Reset",
    "software": "Software Installation", "software installation": "Software Installation", "install": "Software Installation",
    "laptop": "Laptop Issue", "laptop issue": "Laptop Issue", "computer": "Laptop Issue",
    "email": "Email Access", "email access": "Email Access", "mail": "Email Access",
    "network": "Network Connectivity", "network connectivity": "Network Connectivity", "wifi": "Network Connectivity",
    "hardware": "Hardware Request", "hardware request": "Hardware Request",
    "printer": "Printer Issue", "printer issue": "Printer Issue", "printing": "Printer Issue",
    "account": "Account Access", "account access": "Account Access", "access": "Account Access",
    "data recovery": "Data Recovery", "recovery": "Data Recovery", "backup": "Data Recovery",
    "av": "Meeting Room AV", "meeting room av": "Meeting Room AV", "projector": "Meeting Room AV", "conference": "Meeting Room AV",
    "mobile": "Mobile Device", "mobile device": "Mobile Device", "phone": "Mobile Device",
    "server": "Server Access", "server access": "Server Access",
    "database": "Database Error", "database error": "Database Error", "db": "Database Error",
    "application": "Application Crash", "application crash": "Application Crash", "app crash": "Application Crash", "crash": "Application Crash",
}

VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES = {"Open", "In Progress", "Pending", "Resolved", "Closed"}


def _normalize_priority(val: str) -> str:
    v = str(val).strip().lower()
    return PRIORITY_MAP.get(v, "Medium")


def _normalize_status(val: str) -> str:
    v = str(val).strip().lower()
    return STATUS_MAP.get(v, "Open")


def _normalize_category(val: str) -> str:
    v = str(val).strip().lower()
    return CATEGORY_MAP.get(v, str(val).strip().title())


def transform_tickets(df: pd.DataFrame, source_file: str) -> Tuple[pd.DataFrame, int]:
    """Clean, deduplicate, normalize, and enrich ticket records."""
    df = df.copy()

    # Drop rows missing critical fields
    df.dropna(subset=["employee_name", "department", "issue_category", "description", "created_at"], inplace=True)
    df = df[df["employee_name"].str.strip() != ""]
    df = df[df["description"].str.strip() != ""]

    # Normalize text fields
    df["employee_name"] = df["employee_name"].str.strip().str.title()
    df["department"] = df["department"].str.strip()
    df["priority"] = df["priority"].apply(_normalize_priority)
    df["status"] = df["status"].apply(_normalize_status)
    df["issue_category"] = df["issue_category"].apply(_normalize_category)
    df["description"] = df["description"].str.strip()

    # Parse dates
    df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
    df.dropna(subset=["created_at"], inplace=True)

    if "resolved_at" in df.columns:
        df["resolved_at"] = pd.to_datetime(df["resolved_at"], errors="coerce")
    else:
        df["resolved_at"] = pd.NaT

    # Calculate resolution time in days
    df["resolution_time_days"] = None
    resolved_mask = df["resolved_at"].notna() & df["created_at"].notna()
    df.loc[resolved_mask, "resolution_time_days"] = (
        (df.loc[resolved_mask, "resolved_at"] - df.loc[resolved_mask, "created_at"])
        .dt.total_seconds() / 86400
    ).round(2)

    # Remove duplicates: same employee + category + created_at date
    df["_dedup_key"] = (
        df["employee_name"].str.lower() + "|" +
        df["issue_category"].str.lower() + "|" +
        df["created_at"].dt.date.astype(str)
    )
    before_dedup = len(df)
    df.drop_duplicates(subset="_dedup_key", keep="first", inplace=True)
    duplicates_removed = before_dedup - len(df)
    df.drop(columns=["_dedup_key"], inplace=True)

    df["source_file"] = source_file

    return df.reset_index(drop=True), duplicates_removed
