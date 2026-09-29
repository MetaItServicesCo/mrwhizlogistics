from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.html import sanitize_html
from app.models.seo import SEO
from app.core.security import get_current_user
from app.database import get_db
from app.models.page import Page
from app.schemas.page import PageCreate, PageRead, PageUpdate

router = APIRouter(prefix="/pages", tags=["Pages"])


def _save_seo(db: Session, page: Page, seo: dict | None) -> None:
    """Create or update the page's SEO row from the nested payload."""
    if seo is None:
        return
    row = page.seo or SEO(page_id=page.id)
    for key in ("meta_title", "meta_description"):
        if key in seo:
            value = (seo[key] or "").strip()
            setattr(row, key, value or None)
    if page.seo is None:
        db.add(row)


@router.get("", response_model=list[PageRead])
def list_pages(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Page).order_by(Page.sort_order, Page.id).all()


@router.post("", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def create_page(
    payload: PageCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    data = payload.model_dump()
    seo = data.pop("seo", None)
    data["content"] = sanitize_html(data.get("content"))
    page = Page(**data)
    db.add(page)
    db.flush()
    _save_seo(db, page, seo)
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
    data = payload.model_dump(exclude_unset=True)
    seo = data.pop("seo", None)
    if "content" in data:
        # Rich text from the dashboard editor; the public site renders it as HTML.
        data["content"] = sanitize_html(data["content"])
    apply_updates(page, data)
    _save_seo(db, page, seo)
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
