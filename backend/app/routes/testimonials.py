from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.testimonial import Testimonial
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialListResponse,
    TestimonialRead,
    TestimonialUpdate,
)

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


def _get_or_404(db: Session, testimonial_id: int) -> Testimonial:
    row = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return row


@router.get("", response_model=TestimonialListResponse)
def list_testimonials(
    search: Optional[str] = Query(None, description="Search name/role/quote"),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    query = db.query(Testimonial)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Testimonial.name.ilike(term),
                Testimonial.role.ilike(term),
                Testimonial.quote.ilike(term),
            )
        )
    if is_active is not None:
        query = query.filter(Testimonial.is_active.is_(is_active))

    total = query.count()
    items = (
        query.order_by(Testimonial.sort_order.asc(), Testimonial.id.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=TestimonialRead, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    payload: TestimonialCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    row = Testimonial(
        quote=payload.quote.strip(),
        name=payload.name.strip(),
        role=payload.role.strip() if payload.role else None,
        rating=payload.rating,
        initials=payload.initials.strip() if payload.initials else None,
        accent=payload.accent.strip() if payload.accent else None,
        image=payload.image.strip() if payload.image else None,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{testimonial_id}", response_model=TestimonialRead)
def get_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return _get_or_404(db, testimonial_id)


@router.put("/{testimonial_id}", response_model=TestimonialRead)
def update_testimonial(
    testimonial_id: int,
    payload: TestimonialUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    row = _get_or_404(db, testimonial_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        if isinstance(value, str):
            value = value.strip()
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    row = _get_or_404(db, testimonial_id)
    db.delete(row)
    db.commit()
    return None