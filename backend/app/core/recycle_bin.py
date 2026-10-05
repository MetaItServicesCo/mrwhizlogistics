"""
Recently deleted: anything deleted in the dashboard can be restored for 7 days.

A session hook (before_flush) snapshots every deleted row, together with the
children deleted with it by ORM cascades (a post's comments, a page's SEO and
sections, a category's FAQs, a campaign's deliveries), into `deleted_items`.
Restoring re-inserts those rows with their original IDs, parents first. The
snapshot is written in the same transaction as the delete, so a delete that
fails leaves nothing behind. Snapshots older than RETENTION_DAYS are purged.

Routes don't need to do anything: every `db.delete(row)` is covered.
"""

import json
import logging
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, DateTime, Integer, String, Text, event, inspect
from sqlalchemy.orm import Session

from app.database import Base

log = logging.getLogger(__name__)

RETENTION_DAYS = 7

# Tables never kept in the bin (bookkeeping, not content).
UNTRACKED_TABLES = {"deleted_items", "seed_runs"}

# How each table is named in the dashboard.
TYPE_LABELS = {
    "blogs": "Blog post",
    "blog_comments": "Blog comment",
    "box_trucks": "Box truck service",
    "hotshot_cards": "Hot shot service",
    "semi_truck_cards": "Semi truck service",
    "contact_us": "Contact message",
    "content_blocks": "Content block",
    "faq_categories": "FAQ category",
    "faqs": "FAQ",
    "newsletter_campaigns": "Newsletter campaign",
    "newsletter_deliveries": "Newsletter delivery",
    "pages": "Page",
    "page_sections": "Page section",
    "quote_requests": "Quote request",
    "rental_items": "Rental item",
    "rental_quotes": "Rental request",
    "seo": "SEO entry",
    "services": "Service",
    "service_options": "Quote form option",
    "site_settings": "Setting",
    "subscribers": "Newsletter subscriber",
    "team_members": "Team member",
    "testimonials": "Testimonial",
    "truck_types": "Truck type",
    "users": "Admin user",
}
_TITLE_FIELDS = ("title", "name", "subject", "question", "full_name", "client_name", "key", "label", "email", "slug", "username")


class DeletedItem(Base):
    __tablename__ = "deleted_items"

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String(80), nullable=False, index=True)  # table of the deleted row
    entity_id = Column(String(64))
    type_label = Column(String(80), nullable=False)
    title = Column(String(300))
    # JSON list of {"table", "data"}: the row and everything deleted with it.
    payload = Column(Text, nullable=False)
    item_count = Column(Integer, nullable=False, default=1)
    deleted_by_id = Column(Integer, nullable=True)
    deleted_by = Column(String(255), nullable=True)
    deleted_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)


# --------------------------------------------------------------------------- (de)serialising


def _encode(value):
    if isinstance(value, datetime):
        return {"__t": "dt", "v": value.isoformat()}
    if isinstance(value, date):
        return {"__t": "d", "v": value.isoformat()}
    if isinstance(value, time):
        return {"__t": "tm", "v": value.isoformat()}
    if isinstance(value, Decimal):
        return {"__t": "dec", "v": str(value)}
    if isinstance(value, Enum):
        return value.value
    return value


def _decode(value):
    if isinstance(value, dict) and set(value) == {"__t", "v"}:
        kind, raw = value["__t"], value["v"]
        return {
            "dt": datetime.fromisoformat,
            "d": date.fromisoformat,
            "tm": time.fromisoformat,
            "dec": Decimal,
        }[kind](raw)
    return value


def _row_data(obj) -> dict:
    mapper = inspect(obj).mapper
    return {attr.key: _encode(getattr(obj, attr.key)) for attr in mapper.column_attrs}


def _title_of(obj) -> str:
    for field in _TITLE_FIELDS:
        value = getattr(obj, field, None)
        if isinstance(value, str) and value.strip():
            return value.strip()[:300]
    pk = inspect(obj).identity
    return f"#{pk[0]}" if pk else "(untitled)"


def _tracked(obj) -> bool:
    return getattr(obj, "__tablename__", None) not in UNTRACKED_TABLES


def _cascade_children(obj) -> list:
    mapper = inspect(obj).mapper
    return [child for child, _m, _s, _p in mapper.cascade_iterator("delete", inspect(obj))]


# --------------------------------------------------------------------------- capture


@event.listens_for(Session, "before_flush")
def _capture_deletes(session: Session, flush_context, instances) -> None:
    if session.info.get("recycle_bin_disabled"):
        return
    deleted = [obj for obj in session.deleted if _tracked(obj)]
    if not deleted:
        return
    # Rows reachable through another deleted row's cascade belong to that
    # row's snapshot (e.g. comments of a deleted post).
    children_of: dict[int, list] = {}
    reachable: set[int] = set()
    for obj in deleted:
        kids = [k for k in _cascade_children(obj) if _tracked(k)]
        children_of[id(obj)] = kids
        reachable.update(id(k) for k in kids)
    user_id = session.info.get("user_id")
    user_name = session.info.get("user_name")
    for obj in deleted:
        if id(obj) in reachable:
            continue
        rows = [obj, *children_of[id(obj)]]
        payload = [{"table": o.__tablename__, "data": _row_data(o)} for o in rows]
        identity = inspect(obj).identity
        session.add(
            DeletedItem(
                entity=obj.__tablename__,
                entity_id=str(identity[0]) if identity else None,
                type_label=TYPE_LABELS.get(obj.__tablename__, obj.__tablename__.replace("_", " ").capitalize()),
                title=_title_of(obj),
                payload=json.dumps(payload, default=str),
                item_count=len(rows),
                deleted_by_id=user_id,
                deleted_by=user_name,
            )
        )


# --------------------------------------------------------------------------- restore


class RestoreError(Exception):
    def __init__(self, message: str, status: int = 409) -> None:
        super().__init__(message)
        self.status = status


def _model_for(table: str):
    for mapper in Base.registry.mappers:
        if mapper.local_table is not None and mapper.local_table.name == table:
            return mapper.class_
    raise RestoreError(f"This kind of item ({table}) can no longer be restored.", 410)


def _ordered(rows: list[dict]) -> list[dict]:
    """Parents before children: a row is inserted after any row it references."""
    key = lambda r: (r["table"], str(r["data"].get("id")))  # noqa: E731
    present = {key(r) for r in rows}
    deps: dict[tuple, set] = {}
    for r in rows:
        table = _model_for(r["table"]).__table__
        needs = set()
        for col in table.columns:
            for fk in col.foreign_keys:
                value = r["data"].get(col.key)
                target = (fk.column.table.name, str(value))
                if value is not None and target in present and target != key(r):
                    needs.add(target)
        deps[key(r)] = needs
    ordered, done = [], set()
    while len(ordered) < len(rows):
        progress = False
        for r in rows:
            k = key(r)
            if k not in done and deps[k] <= done:
                ordered.append(r)
                done.add(k)
                progress = True
        if not progress:  # cycle (shouldn't happen): keep the original order
            ordered.extend(r for r in rows if key(r) not in done)
            break
    return ordered


def _missing_parent(db: Session, row: dict, batch: set) -> str | None:
    """Describe a referenced row that no longer exists (deleted separately)."""
    table = _model_for(row["table"]).__table__
    for col in table.columns:
        for fk in col.foreign_keys:
            value = row["data"].get(col.key)
            if value is None or (fk.column.table.name, str(value)) in batch:
                continue
            exists = db.execute(
                fk.column.table.select().where(fk.column == value).limit(1)
            ).first()
            if exists:
                continue
            label = TYPE_LABELS.get(fk.column.table.name, fk.column.table.name)
            trashed = (
                db.query(DeletedItem)
                .filter(DeletedItem.entity == fk.column.table.name, DeletedItem.entity_id == str(value))
                .first()
            )
            if trashed:
                return f'It belongs to the {label.lower()} "{trashed.title}", which was also deleted. Restore that first.'
            return f"It belonged to a {label.lower()} that no longer exists, so it can't be restored."
    return None


def restore(db: Session, item: DeletedItem) -> int:
    """Re-insert the snapshot. Returns the number of rows restored; commits."""
    rows = _ordered(json.loads(item.payload))
    batch = {(r["table"], str(r["data"].get("id"))) for r in rows}
    root_problem = _missing_parent(db, rows[0], batch) if rows else None
    if root_problem:
        raise RestoreError(root_problem)
    for r in rows:
        model = _model_for(r["table"])
        data = {k: _decode(v) for k, v in r["data"].items()}
        pk_cols = [c.key for c in model.__table__.primary_key.columns]
        pk = tuple(data.get(c) for c in pk_cols)
        existing = db.get(model, pk if len(pk) > 1 else pk[0]) if all(v is not None for v in pk) else None
        if existing is not None:
            if _row_data(existing) == r["data"]:
                continue  # already back exactly as it was
            raise RestoreError(
                "Something created since then uses the same address, name or email. "
                "Rename or delete that item, then restore this one."
            )
        db.add(model(**data))
    db.delete(item)
    try:
        db.flush()
    except Exception as exc:  # unique conflicts (a slug/email reused meanwhile)
        db.rollback()
        text = str(getattr(exc, "orig", exc)).lower()
        if "unique" in text or "duplicate" in text:
            raise RestoreError(
                "Something created since then uses the same address, name or email. "
                "Rename or delete that item, then restore this one."
            ) from exc
        raise RestoreError(f"This item couldn't be restored: {str(getattr(exc, 'orig', exc))[:200]}") from exc
    db.commit()
    return len(rows)


def purge_expired(db: Session) -> int:
    cutoff = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
    count = db.query(DeletedItem).filter(DeletedItem.deleted_at < cutoff).delete(synchronize_session=False)
    if count:
        db.commit()
    return count
