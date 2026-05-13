from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TicketCreate(BaseModel):
    employee_name: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)
    issue_category: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="Medium")
    status: str = Field(default="Open")
    resolution_notes: Optional[str] = None


class TicketUpdate(BaseModel):
    employee_name: Optional[str] = None
    department: Optional[str] = None
    issue_category: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    resolution_notes: Optional[str] = None


class TicketResponse(BaseModel):
    ticket_id: int
    employee_name: str
    department: str
    issue_category: str
    description: str
    priority: str
    status: str
    resolution_notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Auth / User schemas ──────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6)
    department: str = Field(default="IT", max_length=100)
    role: str = Field(default="Employee", max_length=50)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    department: str
    role: str

    class Config:
        from_attributes = True


class EmailCheckRequest(BaseModel):
    email: str


class EmailCheckResponse(BaseModel):
    exists: bool
