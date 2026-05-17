from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])


@router.get("/pending", response_model=List[schemas.ArticleListOut])
def get_pending_articles(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.require_reviewer_or_admin)
):
    articles = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    ).filter(models.Article.status == models.ArticleStatus.pending).order_by(models.Article.updated_at.asc()).all()

    result = []
    for a in articles:
        result.append({
            **a.__dict__,
            "author": a.author,
            "category": a.category,
            "tags": [at.tag for at in a.tags],
            "avg_rating": None,
            "comment_count": 0,
        })
    return result


@router.post("/{article_id}/review")
def review_article(
    article_id: int,
    payload: schemas.ApprovalAction,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.require_reviewer_or_admin)
):
    if payload.action not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Action must be 'approved' or 'rejected'")

    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.status != models.ArticleStatus.pending:
        raise HTTPException(status_code=400, detail="Article is not in pending state")

    article.status = models.ArticleStatus[payload.action]
    article.updated_at = datetime.utcnow()

    history = models.ApprovalHistory(
        article_id=article_id,
        reviewer_id=current_user.id,
        action=payload.action,
        comment=payload.comment,
    )
    db.add(history)
    db.commit()
    return {"message": f"Article {payload.action}"}


@router.get("/{article_id}/history", response_model=List[schemas.ApprovalHistoryOut])
def get_approval_history(
    article_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user)
):
    history = db.query(models.ApprovalHistory).options(
        joinedload(models.ApprovalHistory.reviewer)
    ).filter(models.ApprovalHistory.article_id == article_id).order_by(
        models.ApprovalHistory.created_at.desc()
    ).all()
    return history
