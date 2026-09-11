from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session


def get_or_404(db: Session, model: type, item_id: int):
    obj = db.get(model, item_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{model.__name__} not found",
        )
    return obj


def apply_updates(obj: Any, data: dict) -> Any:
    for key, value in data.items():
        setattr(obj, key, value)
    return obj
