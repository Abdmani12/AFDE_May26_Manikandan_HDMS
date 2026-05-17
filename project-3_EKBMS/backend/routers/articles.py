from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/articles", tags=["Articles"])


def _enrich(article: models.Article, db: Session, current_user: Optional[models.User] = None) -> dict:
    avg = db.query(func.avg(models.Rating.rating)).filter(models.Rating.article_id == article.id).scalar()
    count = db.query(func.count(models.Comment.id)).filter(models.Comment.article_id == article.id).scalar()
    bookmarked = False
    if current_user:
        bookmarked = db.query(models.Bookmark).filter(
            models.Bookmark.article_id == article.id,
            models.Bookmark.user_id == current_user.id
        ).first() is not None

    data = {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "description": article.description,
        "category_id": article.category_id,
        "author_id": article.author_id,
        "status": article.status,
        "views": article.views,
        "created_at": article.created_at,
        "updated_at": article.updated_at,
        "author": article.author,
        "category": article.category,
        "tags": [at.tag for at in article.tags],
        "attachments": article.attachments,
        "avg_rating": round(avg, 2) if avg else None,
        "comment_count": count or 0,
        "is_bookmarked": bookmarked,
    }
    return data


@router.get("/", response_model=schemas.PaginatedArticles)
def list_articles(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    status: Optional[models.ArticleStatus] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    q = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    )

    # Non-admin employees only see approved articles
    if current_user.role == models.RoleEnum.employee:
        q = q.filter(models.Article.status == models.ArticleStatus.approved)
    elif status:
        q = q.filter(models.Article.status == status)

    if category_id:
        q = q.filter(models.Article.category_id == category_id)

    total = q.count()
    articles = q.order_by(models.Article.updated_at.desc()).offset((page - 1) * size).limit(size).all()

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

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size,
    }


@router.get("/my", response_model=schemas.PaginatedArticles)
def my_articles(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    q = db.query(models.Article).filter(models.Article.author_id == current_user.id).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    )
    total = q.count()
    articles = q.order_by(models.Article.updated_at.desc()).offset((page - 1) * size).limit(size).all()

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


@router.get("/{article_id}", response_model=schemas.ArticleOut)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
        joinedload(models.Article.attachments),
    ).filter(models.Article.id == article_id).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Access control: employees can only read approved articles
    if current_user.role == models.RoleEnum.employee and article.status != models.ArticleStatus.approved:
        raise HTTPException(status_code=403, detail="Access denied")

    # Authors can only see their own non-approved articles
    if current_user.role == models.RoleEnum.author:
        if article.status not in (models.ArticleStatus.approved,) and article.author_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Increment view count
    article.views += 1
    db.commit()

    return _enrich(article, db, current_user)


@router.post("/", response_model=schemas.ArticleOut, status_code=201)
def create_article(
    payload: schemas.ArticleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.require_author_or_admin)
):
    article = models.Article(
        title=payload.title,
        content=payload.content,
        description=payload.description,
        category_id=payload.category_id,
        author_id=current_user.id,
        status=payload.status,
    )
    db.add(article)
    db.flush()

    for tag_id in (payload.tag_ids or []):
        tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
        if tag:
            db.add(models.ArticleTag(article_id=article.id, tag_id=tag_id))

    db.commit()
    db.refresh(article)

    # Reload with relationships
    article = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
        joinedload(models.Article.attachments),
    ).filter(models.Article.id == article.id).first()

    return _enrich(article, db, current_user)


@router.put("/{article_id}", response_model=schemas.ArticleOut)
def update_article(
    article_id: int,
    payload: schemas.ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Only author/admin can edit
    if current_user.role not in (models.RoleEnum.admin,) and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Once approved, only admin can edit
    if article.status == models.ArticleStatus.approved and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Cannot edit an approved article")

    if payload.title is not None:
        article.title = payload.title
    if payload.content is not None:
        article.content = payload.content
    if payload.description is not None:
        article.description = payload.description
    if payload.category_id is not None:
        article.category_id = payload.category_id
    if payload.status is not None:
        article.status = payload.status
    article.updated_at = datetime.utcnow()

    if payload.tag_ids is not None:
        db.query(models.ArticleTag).filter(models.ArticleTag.article_id == article_id).delete()
        for tag_id in payload.tag_ids:
            tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
            if tag:
                db.add(models.ArticleTag(article_id=article.id, tag_id=tag_id))

    db.commit()

    article = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
        joinedload(models.Article.attachments),
    ).filter(models.Article.id == article_id).first()

    return _enrich(article, db, current_user)


@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if current_user.role != models.RoleEnum.admin and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(article)
    db.commit()
    return {"message": "Article deleted"}


@router.post("/{article_id}/submit")
def submit_for_review(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.author_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    if article.status not in (models.ArticleStatus.draft, models.ArticleStatus.rejected):
        raise HTTPException(status_code=400, detail="Only draft or rejected articles can be submitted")

    article.status = models.ArticleStatus.pending
    article.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Article submitted for review"}


@router.post("/{article_id}/archive")
def archive_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if current_user.role != models.RoleEnum.admin and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    article.status = models.ArticleStatus.archived
    article.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Article archived"}
