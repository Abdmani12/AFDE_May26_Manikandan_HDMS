import pandas as pd
from sqlalchemy.orm import Session
from models import HistoricalTicket, ETLRun
from datetime import datetime, timezone


def clear_historical_data(db: Session) -> None:
    db.query(HistoricalTicket).delete()
    db.commit()


def load_to_db(df: pd.DataFrame, db: Session, etl_run_id: int) -> int:
    """Bulk insert transformed DataFrame rows into historical_tickets table."""
    records = []
    for _, row in df.iterrows():
        resolved_at = row.get("resolved_at")
        if pd.isna(resolved_at):
            resolved_at = None

        resolution_days = row.get("resolution_time_days")
        if pd.isna(resolution_days):
            resolution_days = None

        records.append(HistoricalTicket(
            employee_name=row["employee_name"],
            department=row["department"],
            issue_category=row["issue_category"],
            description=row["description"],
            priority=row["priority"],
            status=row["status"],
            created_at=row["created_at"].to_pydatetime() if hasattr(row["created_at"], "to_pydatetime") else row["created_at"],
            resolved_at=resolved_at.to_pydatetime() if resolved_at and hasattr(resolved_at, "to_pydatetime") else resolved_at,
            resolution_time_days=float(resolution_days) if resolution_days is not None else None,
            source_file=row.get("source_file", ""),
            etl_run_id=etl_run_id,
        ))

    db.bulk_save_objects(records)
    db.commit()
    return len(records)


def finalize_etl_run(db: Session, run_id: int, status: str, extracted: int,
                     transformed: int, loaded: int, duplicates: int,
                     error: str = None) -> ETLRun:
    run = db.query(ETLRun).filter(ETLRun.id == run_id).first()
    if run:
        run.status = status
        run.records_extracted = extracted
        run.records_transformed = transformed
        run.records_loaded = loaded
        run.duplicates_removed = duplicates
        run.error_message = error
        run.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(run)
    return run
