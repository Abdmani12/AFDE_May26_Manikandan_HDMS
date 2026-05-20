from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.sql import func
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    issue_category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")
    status = Column(String(20), nullable=False, default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    department = Column(String(100), nullable=False, default="IT")
    role = Column(String(50), nullable=False, default="Employee")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HistoricalTicket(Base):
    __tablename__ = "historical_tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name = Column(String(100), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    issue_category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, index=True)
    status = Column(String(20), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_time_days = Column(Float, nullable=True)
    source_file = Column(String(255), nullable=True)
    etl_run_id = Column(Integer, nullable=True)
    loaded_at = Column(DateTime(timezone=True), server_default=func.now())


class ETLRun(Base):
    __tablename__ = "etl_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_file = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="running")
    records_extracted = Column(Integer, nullable=True)
    records_transformed = Column(Integer, nullable=True)
    records_loaded = Column(Integer, nullable=True)
    duplicates_removed = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
