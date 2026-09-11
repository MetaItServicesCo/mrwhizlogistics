from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.core.security import get_current_user
from app.database import get_db
from app.models.content_block import ContentBlock
from app.schemas.cms import ContentBlockCreate, ContentBlockRead, ContentBlockUpdate

router = APIRouter(prefix="/content-blocks", tags=["Homepage Content"])


@router.get("", response_model=list[ContentBlockRead])
def list_blocks(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(ContentBlock).order_by(ContentBlock.id).all()


@router.post("", response_model=ContentBlockRead, status_code=status.HTTP_201_CREATED)
def create_block(
    payload: ContentBlockCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = ContentBlock(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{item_id}", response_model=ContentBlockRead)
def get_block(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    return get_or_404(db, ContentBlock, item_id)


@router.patch("/{item_id}", response_model=ContentBlockRead)
def update_block(
    item_id: int,
    payload: ContentBlockUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, ContentBlock, item_id)
    apply_updates(row, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_block(
    item_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    row = get_or_404(db, ContentBlock, item_id)
    db.delete(row)
    db.commit()
