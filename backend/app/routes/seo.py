from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.seo import SEO
from app.schemas.seo import SEOCreate, SEORead, SEOUpdate

router = APIRouter(prefix="/seo", tags=["SEO"])


@router.get("", response_model=list[SEORead])
def list_seo(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(SEO).order_by(SEO.id).all()


@router.post("", response_model=SEORead, status_code=status.HTTP_201_CREATED)
def create_seo(
    payload: SEOCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = SEO(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{seo_id}", response_model=SEORead)
def get_seo(seo_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return get_or_404(db, SEO, seo_id)


@router.patch("/{seo_id}", response_model=SEORead)
def update_seo(
    seo_id: int,
    payload: SEOUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, SEO, seo_id)
    apply_updates(row, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{seo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seo(
    seo_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, SEO, seo_id)
    db.delete(row)
    db.commit()
