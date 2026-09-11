from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.page import Page
from app.schemas.page import PageCreate, PageRead, PageUpdate

router = APIRouter(prefix="/pages", tags=["Pages"])


@router.get("", response_model=list[PageRead])
def list_pages(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Page).order_by(Page.sort_order, Page.id).all()


@router.post("", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def create_page(
    payload: PageCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    page = Page(**payload.model_dump())
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.get("/{page_id}", response_model=PageRead)
def get_page(page_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return get_or_404(db, Page, page_id)


@router.patch("/{page_id}", response_model=PageRead)
def update_page(
    page_id: int,
    payload: PageUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    page = get_or_404(db, Page, page_id)
    apply_updates(page, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(page)
    return page


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    page = get_or_404(db, Page, page_id)
    db.delete(page)
    db.commit()
