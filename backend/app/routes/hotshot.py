import os
import uuid
import json
import shutil
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_admin
from app.core.html import sanitize_html
from app.models.hotshot import Hotshot
from app.schemas.hotshot import HotshotResponse

router = APIRouter(prefix="/hotshots", tags=["Hotshot Services"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_uploaded_file(file: Union[UploadFile, str, None]) -> Optional[str]:
    """
    Safely inspects and uploads files. Prevents 500 & 422 errors by verifying 
    file headers and skipping dummy strings sent by Swagger UI.
    """
    if not file or isinstance(file, str):
        return None

    filename = getattr(file, "filename", None)
    if not filename or not isinstance(filename, str) or not filename.strip():
        return None

    try:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size == 0:
            return None

        # Uploads were stored under their original filename, so a second
        # "truck.png" silently overwrote the first one and changed the image
        # on an unrelated record. Prefix a short random token to keep them
        # distinct while leaving the name readable.
        safe_name = os.path.basename(filename)
        stored_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"

        file_path = os.path.join(UPLOAD_DIR, stored_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{UPLOAD_DIR}/{stored_name}"
    except Exception:
        return None


def clean_string(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned if cleaned else None


def parse_to_list(data: Optional[str]) -> list:
    if not data or not isinstance(data, str) or not data.strip():
        return []
    try:
        parsed = json.loads(data)
        if isinstance(parsed, list):
            return parsed
        return [str(parsed)]
    except Exception:
        return [item.strip() for item in data.split(",") if item.strip()]


# 1. GET ALL
@router.get("/", response_model=List[HotshotResponse])
def get_all_hotshots(db: Session = Depends(get_db)):
    return db.query(Hotshot).order_by(Hotshot.id.asc()).all()


# 2. GET BY SLUG
@router.get("/{slug}", response_model=HotshotResponse)
def get_hotshot_by_slug(slug: str, db: Session = Depends(get_db)):
    hotshot = db.query(Hotshot).filter(Hotshot.slug == slug).first()
    if not hotshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Hotshot service card not found"
        )
    return hotshot


# 3. CREATE NEW (POST) - Supports optional custom ID & Page Headings
@router.post("/", response_model=HotshotResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def create_hotshot(
    card_number: str = Form(...),
    category_tag: str = Form(...),
    title: str = Form(...),
    short_description: str = Form(...),
    detail_heading: str = Form(...),
    slug: str = Form(...),
    
    custom_id: Optional[int] = Form(None, description="Optional custom ID for the card"),
    page_heading: Optional[str] = Form("Hotshot"),
    page_subheading: Optional[str] = Form("Choose the right hotshot service"),
    
    features: Optional[str] = Form("[]"),
    detail_paragraphs: Optional[str] = Form("[]"),
    content_html: Optional[str] = Form(None),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    
    card_image_file: UploadFile = File(...),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    
    db: Session = Depends(get_db)
):
    # Check custom ID uniqueness if provided
    if custom_id is not None:
        if db.query(Hotshot).filter(Hotshot.id == custom_id).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Card with ID {custom_id} already exists."
            )

    if db.query(Hotshot).filter(Hotshot.slug == slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Slug already exists. Choose a unique slug."
        )

    card_image_path = save_uploaded_file(card_image_file)
    if not card_image_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid card_image_file is required."
        )
    
    detail_image_path = save_uploaded_file(detail_image_file)

    new_hotshot = Hotshot(
        page_heading=clean_string(page_heading),
        page_subheading=clean_string(page_subheading),
        card_number=card_number,
        category_tag=category_tag,
        title=title,
        short_description=short_description,
        card_image=card_image_path,
        features=parse_to_list(features),
        detail_heading=detail_heading,
        detail_image=detail_image_path,
        detail_paragraphs=parse_to_list(detail_paragraphs),
        content_html=sanitize_html(content_html),
        slug=slug,
        meta_title=clean_string(meta_title),
        meta_description=clean_string(meta_description),
        meta_keywords=clean_string(meta_keywords),
        canonical_url=clean_string(canonical_url)
    )

    if custom_id is not None:
        new_hotshot.id = custom_id

    db.add(new_hotshot)
    db.commit()
    db.refresh(new_hotshot)
    return new_hotshot


# 4. UPDATE EXISTING (PUT)
@router.put("/{id}", response_model=HotshotResponse, dependencies=[Depends(get_current_admin)])
async def update_hotshot(
    id: int,
    page_heading: Optional[str] = Form(None),
    page_subheading: Optional[str] = Form(None),
    card_number: Optional[str] = Form(None),
    category_tag: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    detail_heading: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    
    features: Optional[str] = Form(None),
    detail_paragraphs: Optional[str] = Form(None),
    content_html: Optional[str] = Form(None),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    
    card_image_file: Union[UploadFile, str, None] = File(default=None),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    
    db: Session = Depends(get_db)
):
    hotshot = db.query(Hotshot).filter(Hotshot.id == id).first()
    if not hotshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Hotshot service card not found"
        )

    if slug and slug != hotshot.slug:
        if db.query(Hotshot).filter(Hotshot.slug == slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="New slug already exists."
            )
        hotshot.slug = slug

    if page_heading is not None: hotshot.page_heading = clean_string(page_heading)
    if page_subheading is not None: hotshot.page_subheading = clean_string(page_subheading)
    if card_number is not None: hotshot.card_number = card_number
    if category_tag is not None: hotshot.category_tag = category_tag
    if title is not None: hotshot.title = title
    if short_description is not None: hotshot.short_description = short_description
    if detail_heading is not None: hotshot.detail_heading = detail_heading
    
    if meta_title is not None: hotshot.meta_title = clean_string(meta_title)
    if meta_description is not None: hotshot.meta_description = clean_string(meta_description)
    if meta_keywords is not None: hotshot.meta_keywords = clean_string(meta_keywords)
    if canonical_url is not None: hotshot.canonical_url = clean_string(canonical_url)

    new_card_img = save_uploaded_file(card_image_file)
    if new_card_img:
        hotshot.card_image = new_card_img

    new_detail_img = save_uploaded_file(detail_image_file)
    if new_detail_img:
        hotshot.detail_image = new_detail_img

    if features is not None:
        hotshot.features = parse_to_list(features)

    if detail_paragraphs is not None:
        hotshot.detail_paragraphs = parse_to_list(detail_paragraphs)

    # Sent as "" to clear the rich-text body, which falls back to the
    # legacy paragraphs; omitted entirely to leave it untouched.
    if content_html is not None:
        hotshot.content_html = sanitize_html(content_html)

    db.commit()
    db.refresh(hotshot)
    return hotshot


# 5. DELETE
@router.delete("/{id}", dependencies=[Depends(get_current_admin)])
def delete_hotshot(id: int, db: Session = Depends(get_db)):
    hotshot = db.query(Hotshot).filter(Hotshot.id == id).first()
    if not hotshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Hotshot service card not found"
        )
    
    db.delete(hotshot)
    db.commit()
    return {"success": True, "message": "Hotshot card deleted successfully"}