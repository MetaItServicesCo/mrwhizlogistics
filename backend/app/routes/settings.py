from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.site_setting import SiteSetting
from app.schemas.cms import SiteSettingCreate, SiteSettingRead, SiteSettingUpdate

router = APIRouter(prefix="/settings", tags=["Site Settings"])


@router.get("", response_model=list[SiteSettingRead])
def list_settings(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(SiteSetting).order_by(SiteSetting.id).all()


@router.post("", response_model=SiteSettingRead, status_code=status.HTTP_201_CREATED)
def create_setting(
    payload: SiteSettingCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = SiteSetting(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{item_id}", response_model=SiteSettingRead)
def get_setting(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, SiteSetting, item_id)


@router.patch("/{item_id}", response_model=SiteSettingRead)
def update_setting(
    item_id: int,
    payload: SiteSettingUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, SiteSetting, item_id)
    apply_updates(row, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_setting(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, SiteSetting, item_id)
    db.delete(row)
    db.commit()
