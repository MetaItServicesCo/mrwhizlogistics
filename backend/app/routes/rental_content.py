import json
from copy import deepcopy
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.rental_content import DEFAULTS, PAGE_KEY, apply_item, item_view
from app.core.security import get_current_admin
from app.database import get_db
from app.models.rental import RentalItem
from app.models.site_setting import SiteSetting
from app.schemas.rental_content import RentalContentItem, image_url

router = APIRouter(prefix="/rental-content", tags=["Rental website content"])
admin = [Depends(get_current_admin)]


def merge_page(value, template=None, path="page"):
    """Only known fields/types; preserve explicit blank strings and empty lists."""
    template = DEFAULTS["page"] if template is None else template
    if isinstance(template, dict):
        if not isinstance(value, dict) or set(value) - set(template):
            raise HTTPException(422, f"Invalid fields in {path}")
        return {k: merge_page(value[k], v, f"{path}.{k}") if k in value else deepcopy(v) for k, v in template.items()}
    if isinstance(template, list):
        if not isinstance(value, list) or len(value) > 30:
            raise HTTPException(422, f"{path} must contain at most 30 items")
        return [merge_page(v, template[0], path) for v in value]
    if type(value) is not type(template) or (isinstance(value, str) and len(value) > 20000):
        raise HTTPException(422, f"Invalid value for {path}")
    if path == "page.hero.image":
        try:
            image_url(value)
        except ValueError as exc:
            raise HTTPException(422, str(exc))
    return value


@router.get("/page")
def get_page(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    row = db.query(SiteSetting).filter_by(key=PAGE_KEY).first()
    return merge_page(json.loads(row.value)) if row else deepcopy(DEFAULTS["page"])


@router.put("/page", dependencies=admin)
def save_page(payload: dict, db: Session = Depends(get_db)):
    content = merge_page(payload)
    row = db.query(SiteSetting).filter_by(key=PAGE_KEY).first()
    if row is None:
        row = SiteSetting(key=PAGE_KEY, label="Rental page content")
        db.add(row)
    row.value = json.dumps(content)
    db.commit()
    return content


@router.get("/items/all", dependencies=admin)
def admin_items(db: Session = Depends(get_db)):
    return [item_view(r) for r in db.query(RentalItem).order_by(RentalItem.sort_order, RentalItem.id)]


@router.get("/items")
def public_items(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return [item_view(r) for r in db.query(RentalItem).filter(RentalItem.is_active.is_(True)).order_by(RentalItem.sort_order, RentalItem.id)]


@router.get("/items/{slug}")
def public_item(slug: str, response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    row = db.query(RentalItem).filter_by(slug=slug, is_active=True).first()
    if row is None:
        raise HTTPException(404, "Rental equipment not found")
    return item_view(row)


def persist(db, row, payload):
    data = payload.model_dump()
    if data["is_active"] and (not data["images"] or not data["desc"].strip()):
        raise HTTPException(422, "Published equipment needs a description and at least one image.")
    clash = db.query(RentalItem).filter(RentalItem.slug == data["slug"], RentalItem.id != (row.id or 0)).first()
    if clash:
        raise HTTPException(409, "Another rental already uses this address.")
    apply_item(row, data)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Another rental already uses this address.")
    db.refresh(row)
    return item_view(row)


@router.post("/items", status_code=201, dependencies=admin)
def create_item(payload: RentalContentItem, db: Session = Depends(get_db)):
    return persist(db, RentalItem(), payload)


@router.put("/items/{item_id}", dependencies=admin)
def update_item(item_id: int, payload: RentalContentItem, db: Session = Depends(get_db)):
    row = db.get(RentalItem, item_id)
    if row is None:
        raise HTTPException(404, "Rental equipment not found")
    return persist(db, row, payload)


@router.delete("/items/{item_id}", status_code=204, dependencies=admin)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    row = db.get(RentalItem, item_id)
    if row is None:
        raise HTTPException(404, "Rental equipment not found")
    # Quotes store slug/name snapshots, not a foreign key: history is retained.
    db.delete(row)
    db.commit()
