from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from html import unescape
import re

from app.core.crud import apply_updates, get_or_404
from app.core.html import sanitize_html
from app.core.standard_pages import CONTENT_PAGE_TYPES, LEGAL_SLUGS, slug_problem
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


def _bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def _is_standard(page: Page) -> bool:
    """The legal pages the site ships with: their addresses are fixed."""
    return page.slug in LEGAL_SLUGS and page.page_type in CONTENT_PAGE_TYPES


def _check_content_page(db: Session, data: dict, page_id: int | None = None) -> None:
    """Validate the title and address of a content page (served at /<slug>)."""
    if "title" in data:
        data["title"] = (data["title"] or "").strip()
        if not data["title"]:
            raise _bad_request("Enter a page title.")
    if "slug" in data:
        data["slug"] = (data["slug"] or "").strip().strip("/").lower()
        problem = slug_problem(data["slug"])
        if problem:
            raise _bad_request(problem)
        clash = db.query(Page.id).filter(Page.slug == data["slug"])
        if page_id is not None:
            clash = clash.filter(Page.id != page_id)
        if clash.first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f'Another page already uses "/{data["slug"]}". Choose another address.',
            )


def _check_publish(data: dict, page: Page | None = None) -> None:
    active = data.get("is_active", page.is_active if page else True)
    content = data.get("content", page.content if page else None)
    text_content = unescape(re.sub(r"<[^>]*>", " ", content or "")).strip()
    if active and not text_content:
        raise _bad_request("A published page needs some content. Add text or save it as a draft.")


def _persist_page(db: Session, page: Page, seo: dict | None) -> None:
    """Translate a concurrent slug collision into a useful error, not a 500."""
    slug, page_id = page.slug, page.id
    try:
        db.flush()
        _save_seo(db, page, seo)
        db.commit()
    except IntegrityError:
        db.rollback()
        clash = db.query(Page.id).filter(Page.slug == slug)
        if page_id is not None:
            clash = clash.filter(Page.id != page_id)
        if clash.first():
            raise HTTPException(status_code=409, detail="Another page already uses this address. Choose another address.")
        raise
    db.refresh(page)


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
    if data.get("page_type") in CONTENT_PAGE_TYPES:
        _check_content_page(db, data)
    data["content"] = sanitize_html(data.get("content"))
    if data.get("page_type") in CONTENT_PAGE_TYPES:
        _check_publish(data)
    page = Page(**data)
    db.add(page)
    _persist_page(db, page, seo)
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
    content_page = data.get("page_type", page.page_type) in CONTENT_PAGE_TYPES
    if page.page_type in CONTENT_PAGE_TYPES:
        if data.get("page_type", page.page_type) != page.page_type:
            raise _bad_request("A content page's type can't be changed.")
        if _is_standard(page) and data.get("slug", page.slug) != page.slug:
            raise _bad_request(f'The address of "{page.title}" is fixed at /{page.slug}.')
        if data.get("slug") == page.slug:
            data.pop("slug")
    if content_page:
        # Validate resulting fields when converting an older non-content page.
        data.setdefault("slug", page.slug)
        data.setdefault("title", page.title)
        _check_content_page(db, data, page.id)
    if "content" in data:
        # Rich text from the dashboard editor; the public site renders it as HTML.
        data["content"] = sanitize_html(data["content"])
    if content_page:
        _check_publish(data, page)
    apply_updates(page, data)
    _persist_page(db, page, seo)
    return page


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    page = get_or_404(db, Page, page_id)
    if _is_standard(page):
        raise _bad_request(f'"{page.title}" is a standard page and cannot be deleted. Unpublish it instead.')
    db.delete(page)
    db.commit()
