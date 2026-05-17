from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, ArticleStatus


# ── Users ─────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.employee

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Categories ────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    parent_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}

class CategoryWithChildren(CategoryOut):
    children: List["CategoryOut"] = []


# ── Tags ──────────────────────────────────────────────────────────────────────

class TagCreate(BaseModel):
    name: str

class TagOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


# ── Attachments ───────────────────────────────────────────────────────────────

class AttachmentOut(BaseModel):
    id: int
    article_id: int
    filename: str
    original_filename: str
    file_size: Optional[int]
    file_type: Optional[str]
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ── Comments ──────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    text: str

class CommentOut(BaseModel):
    id: int
    article_id: int
    user_id: int
    text: str
    created_at: datetime
    updated_at: datetime
    user: UserOut

    model_config = {"from_attributes": True}


# ── Ratings ───────────────────────────────────────────────────────────────────

class RatingCreate(BaseModel):
    rating: float

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if not (1.0 <= v <= 5.0):
            raise ValueError("Rating must be between 1 and 5")
        return v

class RatingOut(BaseModel):
    id: int
    article_id: int
    user_id: int
    rating: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Articles ──────────────────────────────────────────────────────────────────

class ArticleCreate(BaseModel):
    title: str
    content: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []
    status: Optional[ArticleStatus] = ArticleStatus.draft

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    status: Optional[ArticleStatus] = None

class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    description: Optional[str]
    category_id: Optional[int]
    author_id: int
    status: ArticleStatus
    views: int
    created_at: datetime
    updated_at: datetime
    author: UserOut
    category: Optional[CategoryOut]
    tags: List[TagOut] = []
    attachments: List[AttachmentOut] = []
    avg_rating: Optional[float] = None
    comment_count: int = 0
    is_bookmarked: bool = False

    model_config = {"from_attributes": True}

class ArticleListOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category_id: Optional[int]
    author_id: int
    status: ArticleStatus
    views: int
    created_at: datetime
    updated_at: datetime
    author: UserOut
    category: Optional[CategoryOut]
    tags: List[TagOut] = []
    avg_rating: Optional[float] = None
    comment_count: int = 0

    model_config = {"from_attributes": True}


# ── Approval ──────────────────────────────────────────────────────────────────

class ApprovalAction(BaseModel):
    action: str  # "approved" or "rejected"
    comment: Optional[str] = None

class ApprovalHistoryOut(BaseModel):
    id: int
    article_id: int
    reviewer_id: int
    action: str
    comment: Optional[str]
    created_at: datetime
    reviewer: UserOut

    model_config = {"from_attributes": True}


# ── Search ────────────────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    articles: List[ArticleListOut]
    total: int


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_articles: int
    approved_articles: int
    pending_approvals: int
    total_users: int
    total_categories: int
    total_views: int
    recent_articles: List[ArticleListOut]
    most_viewed: List[ArticleListOut]
    popular_categories: List[dict]


# ── Bookmark ──────────────────────────────────────────────────────────────────

class BookmarkOut(BaseModel):
    id: int
    article_id: int
    user_id: int
    created_at: datetime
    article: ArticleListOut

    model_config = {"from_attributes": True}


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginatedArticles(BaseModel):
    items: List[ArticleListOut]
    total: int
    page: int
    size: int
    pages: int
