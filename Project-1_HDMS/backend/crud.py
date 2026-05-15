import hashlib
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Ticket, User
from schemas import TicketCreate, TicketUpdate, UserRegister


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{hashed}"


def _verify_password(plain: str, stored: str) -> bool:
    try:
        salt, hash_val = stored.split(":", 1)
        return hashlib.sha256(f"{salt}{plain}".encode()).hexdigest() == hash_val
    except Exception:
        return False


def get_all_tickets(db: Session):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()


def get_ticket_by_id(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def create_ticket(db: Session, ticket: TicketCreate):
    db_ticket = Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket: TicketUpdate):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return None
    update_data = ticket.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return None
    db.delete(db_ticket)
    db.commit()
    return db_ticket


# ── User / Auth CRUD ────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.lower().strip()).first()


def create_user(db: Session, data: UserRegister):
    user = User(
        full_name=data.full_name.strip(),
        email=data.email.lower().strip(),
        password_hash=_hash_password(data.password),
        department=data.department,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not _verify_password(password, user.password_hash):
        return None
    return user


# ── Ticket CRUD ──────────────────────────────────────────────────────────────

def search_tickets(db: Session, keyword: str = None, category: str = None, status: str = None, priority: str = None):
    query = db.query(Ticket)
    if keyword:
        query = query.filter(
            or_(
                Ticket.description.ilike(f"%{keyword}%"),
                Ticket.employee_name.ilike(f"%{keyword}%"),
                Ticket.issue_category.ilike(f"%{keyword}%"),
            )
        )
    if category:
        query = query.filter(Ticket.issue_category == category)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    return query.order_by(Ticket.created_at.desc()).all()
