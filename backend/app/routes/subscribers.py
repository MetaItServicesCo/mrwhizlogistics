from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.subscriber import Subscriber
from app.schemas.leads import SubscriberRead, SubscriberUpdate

router = APIRouter(prefix="/subscribers", tags=["Mailing List"])


@router.get("", response_model=list[SubscriberRead])
def list_subscribers(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Subscriber).order_by(Subscriber.created_at.desc()).all()


@router.get("/{item_id}", response_model=SubscriberRead)
def get_subscriber(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, Subscriber, item_id)


@router.patch("/{item_id}", response_model=SubscriberRead)
def update_subscriber(
    item_id: int,
    payload: SubscriberUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, Subscriber, item_id)
    apply_updates(row, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscriber(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, Subscriber, item_id)
    db.delete(row)
    db.commit()
