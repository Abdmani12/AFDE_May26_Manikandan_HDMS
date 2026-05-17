from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/articles", tags=["Comments"])


@router.get("/{article_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(
    article_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user)
):
    return db.query(models.Comment).options(
        joinedload(models.Comment.user)
    ).filter(models.Comment.article_id == article_id).order_by(models.Comment.created_at.asc()).all()


@router.post("/{article_id}/comments", response_model=schemas.CommentOut, status_code=201)
def add_comment(
    article_id: int,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.status != models.ArticleStatus.approved and current_user.role not in (
        models.RoleEnum.admin, models.RoleEnum.reviewer
    ):
        raise HTTPException(status_code=403, detail="Can only comment on approved articles")

    comment = models.Comment(article_id=article_id, user_id=current_user.id, text=payload.text)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    comment = db.query(models.Comment).options(joinedload(models.Comment.user)).filter(
        models.Comment.id == comment.id
    ).first()
    return comment


@router.put("/{article_id}/comments/{comment_id}", response_model=schemas.CommentOut)
def update_comment(
    article_id: int,
    comment_id: int,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id,
        models.Comment.article_id == article_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.text = payload.text
    db.commit()
    db.refresh(comment)
    comment = db.query(models.Comment).options(joinedload(models.Comment.user)).filter(
        models.Comment.id == comment_id
    ).first()
    return comment


@router.delete("/{article_id}/comments/{comment_id}")
def delete_comment(
    article_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id,
        models.Comment.article_id == article_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


@router.post("/{article_id}/rate", response_model=schemas.RatingOut)
def rate_article(
    article_id: int,
    payload: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    existing = db.query(models.Rating).filter(
        models.Rating.article_id == article_id,
        models.Rating.user_id == current_user.id
    ).first()

    if existing:
        existing.rating = payload.rating
        db.commit()
        db.refresh(existing)
        return existing

    rating = models.Rating(article_id=article_id, user_id=current_user.id, rating=payload.rating)
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


@router.post("/{article_id}/bookmark")
def toggle_bookmark(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    existing = db.query(models.Bookmark).filter(
        models.Bookmark.article_id == article_id,
        models.Bookmark.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "message": "Bookmark removed"}

    bookmark = models.Bookmark(article_id=article_id, user_id=current_user.id)
    db.add(bookmark)
    db.commit()
    return {"bookmarked": True, "message": "Article bookmarked"}


@router.get("/{article_id}/bookmarks/status")
def bookmark_status(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    exists = db.query(models.Bookmark).filter(
        models.Bookmark.article_id == article_id,
        models.Bookmark.user_id == current_user.id
    ).first()
    return {"bookmarked": exists is not None}
