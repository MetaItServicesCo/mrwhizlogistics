"""Dashboard -> Recently deleted: list, restore and permanently delete (7 days)."""

import json
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.recycle_bin import RETENTION_DAYS, DeletedItem, RestoreError, TYPE_LABELS, purge_expired, restore
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/recycle-bin", tags=["Recently deleted"], dependencies=[Depends(get_current_user)])


class DeletedItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity: str
    type_label: str
    title: Optional[str] = None
    item_count: int
    deleted_by: Optional[str] = None
    deleted_at: str
    expires_at: str
    included: list[str]


class RestoreResult(BaseModel):
    restored: int
    message: str


def _read(item: DeletedItem) -> DeletedItemRead:
    rows = json.loads(item.payload)
    # What else comes back with it, e.g. "3 Blog comments".
    counts: dict[str, int] = {}
    for r in rows[1:]:
        counts[r["table"]] = counts.get(r["table"], 0) + 1
    included = [f"{n} {TYPE_LABELS.get(t, t)}{'s' if n != 1 else ''}" for t, n in counts.items()]
    return DeletedItemRead(
        id=item.id,
        entity=item.entity,
        type_label=item.type_label,
        title=item.title,
        item_count=item.item_count,
        deleted_by=item.deleted_by,
        deleted_at=item.deleted_at.isoformat(),
        expires_at=(item.deleted_at + timedelta(days=RETENTION_DAYS)).isoformat(),
        included=included,
    )


@router.get("", response_model=list[DeletedItemRead])
def list_deleted(type: Optional[str] = Query(None, max_length=80), db: Session = Depends(get_db)):
    purge_expired(db)
    query = db.query(DeletedItem)
    if type:
        query = query.filter(DeletedItem.entity == type)
    return [_read(i) for i in query.order_by(DeletedItem.deleted_at.desc()).limit(500).all()]


@router.post("/{item_id}/restore", response_model=RestoreResult)
def restore_item(item_id: int, db: Session = Depends(get_db)):
    purge_expired(db)
    item = db.get(DeletedItem, item_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This item is no longer in Recently deleted.")
    label, title = item.type_label, item.title
    try:
        count = restore(db, item)
    except RestoreError as exc:
        raise HTTPException(exc.status, str(exc)) from exc
    extra = f" (with {count - 1} related item{'s' if count != 2 else ''})" if count > 1 else ""
    return RestoreResult(restored=count, message=f'{label} "{title}" restored{extra}.')


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_forever(item_id: int, db: Session = Depends(get_db)):
    item = db.get(DeletedItem, item_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This item is no longer in Recently deleted.")
    db.info["recycle_bin_disabled"] = True  # removing a snapshot isn't itself recoverable
    db.delete(item)
    db.commit()
