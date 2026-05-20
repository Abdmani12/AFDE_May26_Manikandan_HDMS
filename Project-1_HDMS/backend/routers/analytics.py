from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from database import get_db
from models import Ticket, HistoricalTicket
from schemas import (
    AnalyticsOverview, CategoryCount, PriorityCount,
    DepartmentCount, MonthlyTrend, HistoricalTicketResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _avg_resolution(db: Session, model) -> Optional[float]:
    result = db.query(func.avg(model.resolution_time_days)).filter(
        model.resolution_time_days.isnot(None)
    ).scalar()
    return round(float(result), 2) if result else None


@router.get("/overview", response_model=AnalyticsOverview)
def get_overview(db: Session = Depends(get_db)):
    """Combined metrics from live tickets + count of historical records."""
    def count_status(model, status_val):
        return db.query(func.count(model.ticket_id if hasattr(model, "ticket_id") else model.id)).filter(
            model.status == status_val
        ).scalar() or 0

    total = db.query(func.count(Ticket.ticket_id)).scalar() or 0
    open_t = count_status(Ticket, "Open")
    inprog = count_status(Ticket, "In Progress")
    resolved = count_status(Ticket, "Resolved")
    closed = count_status(Ticket, "Closed")
    pending = count_status(Ticket, "Pending")
    hist_count = db.query(func.count(HistoricalTicket.id)).scalar() or 0
    avg_days = _avg_resolution(db, HistoricalTicket)

    return AnalyticsOverview(
        total_tickets=total,
        open_tickets=open_t,
        in_progress_tickets=inprog,
        resolved_tickets=resolved,
        closed_tickets=closed,
        pending_tickets=pending,
        avg_resolution_days=avg_days,
        historical_records=hist_count,
    )


@router.get("/category-distribution", response_model=List[CategoryCount])
def get_category_distribution(source: str = "historical", db: Session = Depends(get_db)):
    """Ticket counts grouped by issue category, sorted descending."""
    model = HistoricalTicket if source == "historical" else Ticket
    col = model.issue_category
    id_col = model.id if hasattr(model, "id") else model.ticket_id

    rows = (
        db.query(col, func.count(id_col).label("cnt"))
        .group_by(col)
        .order_by(func.count(id_col).desc())
        .all()
    )
    return [CategoryCount(category=r[0], count=r[1]) for r in rows]


@router.get("/priority-distribution", response_model=List[PriorityCount])
def get_priority_distribution(source: str = "historical", db: Session = Depends(get_db)):
    """Ticket counts grouped by priority."""
    model = HistoricalTicket if source == "historical" else Ticket
    col = model.priority
    id_col = model.id if hasattr(model, "id") else model.ticket_id

    rows = (
        db.query(col, func.count(id_col).label("cnt"))
        .group_by(col)
        .order_by(func.count(id_col).desc())
        .all()
    )
    return [PriorityCount(priority=r[0], count=r[1]) for r in rows]


@router.get("/department-summary", response_model=List[DepartmentCount])
def get_department_summary(source: str = "historical", db: Session = Depends(get_db)):
    """Ticket counts grouped by department."""
    model = HistoricalTicket if source == "historical" else Ticket
    col = model.department
    id_col = model.id if hasattr(model, "id") else model.ticket_id

    rows = (
        db.query(col, func.count(id_col).label("cnt"))
        .group_by(col)
        .order_by(func.count(id_col).desc())
        .all()
    )
    return [DepartmentCount(department=r[0], count=r[1]) for r in rows]


@router.get("/resolution-trends", response_model=List[MonthlyTrend])
def get_resolution_trends(db: Session = Depends(get_db)):
    """Monthly ticket volume and average resolution time from historical data."""
    rows = (
        db.query(
            func.strftime("%Y-%m", HistoricalTicket.created_at).label("month"),
            func.count(HistoricalTicket.id).label("total"),
            func.sum(
                case((HistoricalTicket.status.in_(["Resolved", "Closed"]), 1), else_=0)
            ).label("resolved"),
            func.avg(HistoricalTicket.resolution_time_days).label("avg_days"),
        )
        .group_by(func.strftime("%Y-%m", HistoricalTicket.created_at))
        .order_by(func.strftime("%Y-%m", HistoricalTicket.created_at))
        .all()
    )
    return [
        MonthlyTrend(
            month=r.month,
            total_tickets=r.total,
            resolved_tickets=r.resolved or 0,
            avg_resolution_days=round(float(r.avg_days), 2) if r.avg_days else None,
        )
        for r in rows
    ]


@router.get("/historical-tickets", response_model=List[HistoricalTicketResponse])
def get_historical_tickets(
    limit: int = 50,
    offset: int = 0,
    department: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Paginated list of historical tickets with optional filters."""
    q = db.query(HistoricalTicket)
    if department:
        q = q.filter(HistoricalTicket.department.ilike(f"%{department}%"))
    if category:
        q = q.filter(HistoricalTicket.issue_category.ilike(f"%{category}%"))
    if priority:
        q = q.filter(HistoricalTicket.priority == priority)
    if status:
        q = q.filter(HistoricalTicket.status == status)
    return q.order_by(HistoricalTicket.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/historical-tickets/count")
def count_historical_tickets(db: Session = Depends(get_db)):
    count = db.query(func.count(HistoricalTicket.id)).scalar() or 0
    return {"count": count}
