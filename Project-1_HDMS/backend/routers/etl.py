import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import ETLRun
from schemas import ETLRunResponse, ETLRunRequest
from etl import extract_from_csv, transform_tickets, load_to_db, clear_historical_data
from etl.loader import finalize_etl_run
import tempfile

router = APIRouter(prefix="/etl", tags=["ETL"])

DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "..", "data", "historical_tickets.csv")


def _run_etl_pipeline(file_path: str, source_name: str, clear_existing: bool, db: Session) -> ETLRun:
    etl_run = ETLRun(source_file=source_name, status="running")
    db.add(etl_run)
    db.commit()
    db.refresh(etl_run)

    extracted = 0
    transformed = 0
    loaded = 0
    duplicates = 0

    try:
        df_raw, extracted = extract_from_csv(file_path)
        df_clean, duplicates = transform_tickets(df_raw, source_name)
        transformed = len(df_clean)

        if clear_existing:
            clear_historical_data(db)

        loaded = load_to_db(df_clean, db, etl_run.id)
        return finalize_etl_run(db, etl_run.id, "success", extracted, transformed, loaded, duplicates)

    except Exception as exc:
        return finalize_etl_run(db, etl_run.id, "failed", extracted, transformed, loaded, duplicates, str(exc))


@router.post("/run", response_model=ETLRunResponse)
def run_etl(payload: ETLRunRequest = ETLRunRequest(), db: Session = Depends(get_db)):
    """Trigger ETL pipeline on the built-in historical_tickets.csv dataset."""
    csv_path = os.path.abspath(DEFAULT_CSV)
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="Default CSV dataset not found")
    result = _run_etl_pipeline(csv_path, "historical_tickets.csv", payload.clear_existing, db)
    if result.status == "failed":
        raise HTTPException(status_code=500, detail=result.error_message)
    return result


@router.post("/upload", response_model=ETLRunResponse)
async def upload_and_run_etl(
    file: UploadFile = File(...),
    clear_existing: bool = True,
    db: Session = Depends(get_db),
):
    """Upload a CSV file and run the ETL pipeline on it."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv", mode="wb") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = _run_etl_pipeline(tmp_path, file.filename, clear_existing, db)
    finally:
        os.unlink(tmp_path)

    if result.status == "failed":
        raise HTTPException(status_code=500, detail=result.error_message)
    return result


@router.get("/status", response_model=ETLRunResponse)
def get_etl_status(db: Session = Depends(get_db)):
    """Return the most recent ETL run."""
    run = db.query(ETLRun).order_by(ETLRun.id.desc()).first()
    if not run:
        raise HTTPException(status_code=404, detail="No ETL runs found. Run /etl/run first.")
    return run


@router.get("/runs", response_model=List[ETLRunResponse])
def list_etl_runs(limit: int = 20, db: Session = Depends(get_db)):
    """List recent ETL run history."""
    return db.query(ETLRun).order_by(ETLRun.id.desc()).limit(limit).all()
