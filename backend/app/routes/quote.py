from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.quote import QuoteRequest
from app.models.service_option import ServiceOption
from app.schemas.quote import (
    PublicServiceOption,
    QuoteCreate,
    QuoteRead,
    QuoteUpdate,
    ServiceOptionCreate,
    ServiceOptionListResponse,
    ServiceOptionRead,
    ServiceOptionUpdate,
)

# Admin: quote submissions
router = APIRouter(prefix="/quotes", tags=["Quote Requests"])
# Admin: service-option dropdown CRUD
service_option_router = APIRouter(prefix="/service-options", tags=["Service Options"])
# Public: form submit + dropdown (frontend)
public_router = APIRouter(prefix="/public", tags=["Public (quote form)"])


# ==========================================================================
# ADMIN — Quote submissions (dashboard)
# ==========================================================================

@router.get("", response_model=list[QuoteRead])
def list_quotes(
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(QuoteRequest)
    if status_filter:
        q = q.filter(QuoteRequest.status == status_filter)
    return q.order_by(QuoteRequest.created_at.desc()).all()


@router.get("/{item_id}", response_model=QuoteRead)
def get_quote(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, QuoteRequest, item_id)


@router.patch("/{item_id}", response_model=QuoteRead)
def update_quote(
    item_id: int,
    payload: QuoteUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, QuoteRequest, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        data["status"] = data["status"].value if hasattr(data["status"], "value") else data["status"]
    apply_updates(row, data)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, QuoteRequest, item_id)
    db.delete(row)
    db.commit()


# ==========================================================================
# ADMIN — Service Options (dropdown CRUD)
# ==========================================================================

@service_option_router.get("", response_model=ServiceOptionListResponse)
def list_service_options(
    search: Optional[str] = Query(None, description="Search by name"),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(ServiceOption)
    if search:
        q = q.filter(ServiceOption.name.ilike(f"%{search.strip()}%"))
    if is_active is not None:
        q = q.filter(ServiceOption.is_active.is_(is_active))

    total = q.count()
    items = (
        q.order_by(ServiceOption.sort_order.asc(), ServiceOption.id.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "size": size}


@service_option_router.post("", response_model=ServiceOptionRead, status_code=status.HTTP_201_CREATED)
def create_service_option(
    payload: ServiceOptionCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = ServiceOption(
        name=payload.name.strip(),
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@service_option_router.get("/{item_id}", response_model=ServiceOptionRead)
def get_service_option(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, ServiceOption, item_id)


@service_option_router.put("/{item_id}", response_model=ServiceOptionRead)
def update_service_option(
    item_id: int,
    payload: ServiceOptionUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, ServiceOption, item_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@service_option_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_option(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, ServiceOption, item_id)
    db.delete(row)
    db.commit()


# ==========================================================================
# PUBLIC — frontend quote form (submit + dropdown)
# ==========================================================================

@public_router.post("/quotes", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def submit_quote(payload: QuoteCreate, db: Session = Depends(get_db)):
    row = QuoteRequest(**payload.model_dump(), status="new")
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@public_router.get("/service-options", response_model=list[PublicServiceOption])
def public_service_options(db: Session = Depends(get_db)):
    """Active 'Select Service' dropdown options, ordered."""
    return (
        db.query(ServiceOption)
        .filter(ServiceOption.is_active.is_(True))
        .order_by(ServiceOption.sort_order.asc(), ServiceOption.id.asc())
        .all()
    )