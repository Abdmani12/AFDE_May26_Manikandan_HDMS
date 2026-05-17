from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from typing import Optional, List
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("/", response_model=schemas.PaginatedArticles)
def search_articles(
    q: Optional[str] = Query(None, description="Search keyword"),
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    author_id: Optional[int] = None,
    sort: str = Query("latest", enum=["latest", "popular", "rating"]),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    query = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    )

    # Only approved articles for employees, all for others
    if current_user.role == models.RoleEnum.employee:
        query = query.filter(models.Article.status == models.ArticleStatus.approved)
    else:
        query = query.filter(models.Article.status == models.ArticleStatus.approved)

    if q:
        keyword = f"%{q}%"
        query = query.filter(
            or_(
                models.Article.title.ilike(keyword),
                models.Article.content.ilike(keyword),
                models.Article.description.ilike(keyword),
            )
        )

    if category_id:
        query = query.filter(models.Article.category_id == category_id)

    if author_id:
        query = query.filter(models.Article.author_id == author_id)

    if tag_id:
        query = query.join(models.ArticleTag).filter(models.ArticleTag.tag_id == tag_id)

    if sort == "popular":
        query = query.order_by(models.Article.views.desc())
    elif sort == "rating":
        query = query.outerjoin(models.Rating).group_by(models.Article.id).order_by(
            func.avg(models.Rating.rating).desc().nullslast()
        )
    else:
        query = query.order_by(models.Article.updated_at.desc())

    total = query.count()
    articles = query.offset((page - 1) * size).limit(size).all()

    items = []
    for a in articles:
        avg = db.query(func.avg(models.Rating.rating)).filter(models.Rating.article_id == a.id).scalar()
        count = db.query(func.count(models.Comment.id)).filter(models.Comment.article_id == a.id).scalar()
        items.append({
            **a.__dict__,
            "author": a.author,
            "category": a.category,
            "tags": [at.tag for at in a.tags],
            "avg_rating": round(avg, 2) if avg else None,
            "comment_count": count or 0,
        })

    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@router.get("/suggestions")
def search_suggestions(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user)
):
    keyword = f"%{q}%"
    articles = db.query(models.Article.id, models.Article.title).filter(
        models.Article.status == models.ArticleStatus.approved,
        models.Article.title.ilike(keyword)
    ).limit(8).all()
    return [{"id": a.id, "title": a.title} for a in articles]


@router.get("/bookmarks", response_model=schemas.PaginatedArticles)
def my_bookmarks(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    bookmarks = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == current_user.id
    ).order_by(models.Bookmark.created_at.desc()).all()

    article_ids = [b.article_id for b in bookmarks]
    q = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    ).filter(models.Article.id.in_(article_ids))

    total = q.count()
    articles = q.offset((page - 1) * size).limit(size).all()

    items = []
    for a in articles:
        avg = db.query(func.avg(models.Rating.rating)).filter(models.Rating.article_id == a.id).scalar()
        count = db.query(func.count(models.Comment.id)).filter(models.Comment.article_id == a.id).scalar()
        items.append({
            **a.__dict__,
            "author": a.author,
            "category": a.category,
            "tags": [at.tag for at in a.tags],
            "avg_rating": round(avg, 2) if avg else None,
            "comment_count": count or 0,
        })

    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}
