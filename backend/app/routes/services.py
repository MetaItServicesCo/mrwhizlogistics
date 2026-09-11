from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["Services / Fleet"])


@router.get("", response_model=list[ServiceRead])
def list_services(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(Service)
    if category:
        q = q.filter(Service.category == category)
    return q.order_by(Service.sort_order, Service.id).all()


@router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = Service(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{service_id}", response_model=ServiceRead)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, Service, service_id)


@router.patch("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, Service, service_id)
    apply_updates(row, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, Service, service_id)
    db.delete(row)
    db.commit()
