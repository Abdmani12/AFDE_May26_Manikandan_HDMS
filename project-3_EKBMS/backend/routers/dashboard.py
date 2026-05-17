from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    total_articles = db.query(func.count(models.Article.id)).scalar()
    approved = db.query(func.count(models.Article.id)).filter(
        models.Article.status == models.ArticleStatus.approved
    ).scalar()
    pending = db.query(func.count(models.Article.id)).filter(
        models.Article.status == models.ArticleStatus.pending
    ).scalar()
    total_users = db.query(func.count(models.User.id)).scalar()
    total_cats = db.query(func.count(models.Category.id)).scalar()
    total_views = db.query(func.sum(models.Article.views)).scalar() or 0

    def make_list(articles):
        result = []
        for a in articles:
            avg = db.query(func.avg(models.Rating.rating)).filter(models.Rating.article_id == a.id).scalar()
            count = db.query(func.count(models.Comment.id)).filter(models.Comment.article_id == a.id).scalar()
            result.append({
                **a.__dict__,
                "author": a.author,
                "category": a.category,
                "tags": [at.tag for at in a.tags],
                "avg_rating": round(avg, 2) if avg else None,
                "comment_count": count or 0,
            })
        return result

    recent_qs = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    ).filter(models.Article.status == models.ArticleStatus.approved).order_by(
        models.Article.created_at.desc()
    ).limit(5).all()

    most_viewed_qs = db.query(models.Article).options(
        joinedload(models.Article.author),
        joinedload(models.Article.category),
        joinedload(models.Article.tags).joinedload(models.ArticleTag.tag),
    ).filter(models.Article.status == models.ArticleStatus.approved).order_by(
        models.Article.views.desc()
    ).limit(5).all()

    popular_cats = db.query(
        models.Category.id,
        models.Category.name,
        func.count(models.Article.id).label("article_count")
    ).join(models.Article, models.Article.category_id == models.Category.id).group_by(
        models.Category.id, models.Category.name
    ).order_by(func.count(models.Article.id).desc()).limit(5).all()

    return {
        "total_articles": total_articles,
        "approved_articles": approved,
        "pending_approvals": pending,
        "total_users": total_users,
        "total_categories": total_cats,
        "total_views": total_views,
        "recent_articles": make_list(recent_qs),
        "most_viewed": make_list(most_viewed_qs),
        "popular_categories": [{"id": c.id, "name": c.name, "article_count": c.article_count} for c in popular_cats],
    }


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.require_admin)
):
    status_counts = db.query(
        models.Article.status, func.count(models.Article.id)
    ).group_by(models.Article.status).all()

    role_counts = db.query(
        models.User.role, func.count(models.User.id)
    ).group_by(models.User.role).all()

    top_authors = db.query(
        models.User.id, models.User.name,
        func.count(models.Article.id).label("article_count")
    ).join(models.Article, models.Article.author_id == models.User.id).group_by(
        models.User.id, models.User.name
    ).order_by(func.count(models.Article.id).desc()).limit(5).all()

    top_rated = db.query(
        models.Article.id, models.Article.title,
        func.avg(models.Rating.rating).label("avg_rating"),
        func.count(models.Rating.id).label("rating_count")
    ).join(models.Rating).group_by(models.Article.id, models.Article.title).order_by(
        func.avg(models.Rating.rating).desc()
    ).limit(5).all()

    return {
        "status_distribution": [{"status": s, "count": c} for s, c in status_counts],
        "user_roles": [{"role": r, "count": c} for r, c in role_counts],
        "top_authors": [{"id": a.id, "name": a.name, "article_count": a.article_count} for a in top_authors],
        "top_rated_articles": [
            {"id": a.id, "title": a.title, "avg_rating": round(float(a.avg_rating), 2), "rating_count": a.rating_count}
            for a in top_rated
        ],
    }
