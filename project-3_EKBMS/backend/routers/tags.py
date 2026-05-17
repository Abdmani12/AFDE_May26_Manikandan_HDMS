from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/tags", tags=["Tags"])


@router.get("/", response_model=List[schemas.TagOut])
def list_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()


@router.post("/", response_model=schemas.TagOut, status_code=201)
def create_tag(
    payload: schemas.TagCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.require_author_or_admin)
):
    existing = db.query(models.Tag).filter(models.Tag.name == payload.name).first()
    if existing:
        return existing
    tag = models.Tag(name=payload.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.require_admin)
):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted"}
