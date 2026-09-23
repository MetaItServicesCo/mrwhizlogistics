from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_admin, get_db
from app.models.faq import FAQ, FAQCategory
from app.schemas.faq import (
    FAQCategoryCreate,
    FAQCategoryListResponse,
    FAQCategoryOut,
    FAQCategoryUpdate,
    FAQCreate,
    FAQListResponse,
    FAQOut,
    FAQUpdate,
    PublicFAQCategory,
    PublicFAQItem,
)

# Sab kuch is ek hi `router` me hai (routes/__init__.py isi ko include karta hai).
# Admin endpoints protected (get_current_admin), public endpoint open.
router = APIRouter(tags=["FAQs"])


# ---------------- helpers ----------------

def _get_category_or_404(db: Session, category_id: int) -> FAQCategory:
    category = db.query(FAQCategory).filter(FAQCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="FAQ category not found")
    return category


def _get_faq_or_404(db: Session, faq_id: int) -> FAQ:
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


# ==========================================================================
# CATEGORY endpoints (admin) — tabs: Hot Shot / Box Truck / Semi-Truck / General
# ==========================================================================

@router.get("/faq-categories", response_model=FAQCategoryListResponse)
def list_faq_categories(
    search: Optional[str] = Query(None, description="Search by name"),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    query = db.query(FAQCategory)
    if search:
        query = query.filter(FAQCategory.name.ilike(f"%{search.strip()}%"))
    if is_active is not None:
        query = query.filter(FAQCategory.is_active.is_(is_active))

    total = query.count()
    items = (
        query.order_by(FAQCategory.display_order.asc(), FAQCategory.id.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    # faq_count ek hi extra query me (no N+1)
    ids = [c.id for c in items]
    counts = {}
    if ids:
        rows = (
            db.query(FAQ.category_id, func.count(FAQ.id))
            .filter(FAQ.category_id.in_(ids))
            .group_by(FAQ.category_id)
            .all()
        )
        counts = {cid: n for cid, n in rows}
    for c in items:
        c.faq_count = counts.get(c.id, 0)

    return {"items": items, "total": total, "page": page, "size": size}


@router.post(
    "/faq-categories",
    response_model=FAQCategoryOut,
    status_code=status.HTTP_201_CREATED,
)
def create_faq_category(
    payload: FAQCategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = FAQCategory(
        name=payload.name.strip(),
        icon=payload.icon.strip() if payload.icon else None,
        description=payload.description.strip() if payload.description else None,
        display_order=payload.display_order,
        is_active=payload.is_active,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    category.faq_count = 0
    return category


@router.get("/faq-categories/{category_id}", response_model=FAQCategoryOut)
def get_faq_category(
    category_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = _get_category_or_404(db, category_id)
    category.faq_count = len(category.faqs)
    return category


@router.put("/faq-categories/{category_id}", response_model=FAQCategoryOut)
def update_faq_category(
    category_id: int,
    payload: FAQCategoryUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = _get_category_or_404(db, category_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        if isinstance(value, str):
            value = value.strip()
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    category.faq_count = len(category.faqs)
    return category


@router.delete(
    "/faq-categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_faq_category(
    category_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = _get_category_or_404(db, category_id)
    db.delete(category)  # cascade -> is category ki saari FAQs bhi delete
    db.commit()
    return None


# ==========================================================================
# FAQ item endpoints (admin)
# ==========================================================================

@router.get("/faqs", response_model=FAQListResponse)
def list_faqs(
    search: Optional[str] = Query(None, description="Search question/answer"),
    category_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    query = db.query(FAQ)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(FAQ.question.ilike(term), FAQ.answer.ilike(term)))
    if category_id is not None:
        query = query.filter(FAQ.category_id == category_id)
    if is_active is not None:
        query = query.filter(FAQ.is_active.is_(is_active))

    total = query.count()
    items = (
        query.order_by(FAQ.category_id.asc(), FAQ.display_order.asc(), FAQ.id.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "size": size}


@router.post("/faqs", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    _get_category_or_404(db, payload.category_id)  # category valid honi chahiye
    faq = FAQ(
        category_id=payload.category_id,
        question=payload.question.strip(),
        answer=payload.answer.strip(),
        display_order=payload.display_order,
        is_active=payload.is_active,
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.get("/faqs/{faq_id}", response_model=FAQOut)
def get_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return _get_faq_or_404(db, faq_id)


@router.put("/faqs/{faq_id}", response_model=FAQOut)
def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    faq = _get_faq_or_404(db, faq_id)
    data = payload.model_dump(exclude_unset=True)
    if data.get("category_id") is not None:
        _get_category_or_404(db, data["category_id"])
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(faq, key, value)
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/faqs/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    faq = _get_faq_or_404(db, faq_id)
    db.delete(faq)
    db.commit()
    return None


# ==========================================================================
# NOTE: the public FAQ endpoint (GET /api/public/faqs) lives in
# app/routes/public.py alongside the other public website endpoints.
# An identical copy used to be declared here, registering the same path twice.
# ==========================================================================
