"""One-time import of the current rental website, without overwriting CMS edits."""
import json
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.schema_upgrade import ADVISORY_LOCK_KEY
from app.models.rental import RentalItem
from app.models.seed_run import SeedRun
from app.models.site_setting import SiteSetting

DEFAULTS = json.loads((Path(__file__).resolve().parents[1] / "data/rental_defaults.json").read_text(encoding="utf-8"))
PAGE_KEY = "rentals_page_content"
SEED_KEY = "rental-content-v1"
CORE_KEYS = {"slug", "title", "desc", "priceHint", "images", "id", "is_active", "sort_order", "updated_at"}


def item_view(row: RentalItem) -> dict:
    images = row.gallery_images or ([row.main_image] if row.main_image else [])
    return {**(row.details or {}), "id": row.id, "slug": row.slug, "title": row.title,
            "desc": row.description or "", "priceHint": row.hourly_rate or "", "images": images,
            "is_active": row.is_active, "sort_order": row.sort_order,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None}


def apply_item(row: RentalItem, data: dict) -> None:
    row.slug, row.title = data["slug"], data["title"]
    row.description, row.hourly_rate = data["desc"], data.get("priceHint", "")
    row.gallery_images = data["images"]
    row.main_image = data["images"][0] if data["images"] else None
    row.is_active, row.sort_order = data["is_active"], data["sort_order"]
    row.details = {k: v for k, v in data.items() if k not in CORE_KEYS}


def ensure_rental_content(db: Session) -> None:
    if db.bind.dialect.name == "postgresql":
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": ADVISORY_LOCK_KEY})
    if db.get(SeedRun, SEED_KEY):
        db.commit()
        return
    if not db.query(SiteSetting).filter_by(key=PAGE_KEY).first():
        db.add(SiteSetting(key=PAGE_KEY, value=json.dumps(DEFAULTS["page"]), label="Rental page content"))
    for index, data in enumerate(DEFAULTS["items"]):
        row = db.query(RentalItem).filter_by(slug=data["slug"]).first()
        if row is None:
            row = RentalItem()
            apply_item(row, {**data, "is_active": True, "sort_order": index * 10})
            db.add(row)
        else:
            # Preserve existing API-managed title, copy, pricing, images and
            # publication status; fill only the new optional detail fields.
            row.details = {**{k: v for k, v in data.items() if k not in CORE_KEYS}, **(row.details or {})}
    db.add(SeedRun(key=SEED_KEY))
    db.commit()
