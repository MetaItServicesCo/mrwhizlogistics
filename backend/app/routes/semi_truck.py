import os
import json
import shutil
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.semi_truck import SemiTruck
from app.schemas.semi_truck import SemiTruckResponse

router = APIRouter(prefix="/semi-trucks", tags=["Semi Truck Services"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_uploaded_file(file: Union[UploadFile, str, None]) -> Optional[str]:
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
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{UPLOAD_DIR}/{filename}"
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
        return parsed if isinstance(parsed, list) else [str(parsed)]
    except Exception:
        return [item.strip() for item in data.split(",") if item.strip()]


# 1. GET ALL
@router.get("/", response_model=List[SemiTruckResponse])
def get_all_semi_trucks(db: Session = Depends(get_db)):
    return db.query(SemiTruck).order_by(SemiTruck.id.asc()).all()


# 2. GET BY SLUG
@router.get("/{slug}", response_model=SemiTruckResponse)
def get_semi_truck_by_slug(slug: str, db: Session = Depends(get_db)):
    record = db.query(SemiTruck).filter(SemiTruck.slug == slug).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Semi truck service card not found"
        )
    return record


# 3. CREATE NEW (POST)
@router.post("/", response_model=SemiTruckResponse, status_code=status.HTTP_201_CREATED)
async def create_semi_truck(
    card_number: str = Form(...),
    category_tag: str = Form(...),
    title: str = Form(...),
    short_description: str = Form(...),
    detail_heading: str = Form(...),
    slug: str = Form(...),
    
    page_heading: Optional[str] = Form("Semi Truck"),
    page_subheading: Optional[str] = Form("Choose the right semi truck"),
    
    trailer_length: Optional[str] = Form(None),
    max_payload: Optional[str] = Form(None),
    cargo_type: Optional[str] = Form(None),

    features: Optional[str] = Form("[]"),
    detail_paragraphs: Optional[str] = Form("[]"),
    
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    
    card_image_file: UploadFile = File(...),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    
    db: Session = Depends(get_db)
):
    if db.query(SemiTruck).filter(SemiTruck.slug == slug).first():
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

    new_semi_truck = SemiTruck(
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
        trailer_length=clean_string(trailer_length),
        max_payload=clean_string(max_payload),
        cargo_type=clean_string(cargo_type),
        slug=slug,
        meta_title=clean_string(meta_title),
        meta_description=clean_string(meta_description),
        meta_keywords=clean_string(meta_keywords),
        canonical_url=clean_string(canonical_url)
    )

    db.add(new_semi_truck)
    db.commit()
    db.refresh(new_semi_truck)
    return new_semi_truck


# 4. UPDATE EXISTING (PUT)
@router.put("/{id}", response_model=SemiTruckResponse)
async def update_semi_truck(
    id: int,
    page_heading: Optional[str] = Form(None),
    page_subheading: Optional[str] = Form(None),
    card_number: Optional[str] = Form(None),
    category_tag: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    detail_heading: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    
    trailer_length: Optional[str] = Form(None),
    max_payload: Optional[str] = Form(None),
    cargo_type: Optional[str] = Form(None),

    features: Optional[str] = Form(None),
    detail_paragraphs: Optional[str] = Form(None),
    
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    
    card_image_file: Union[UploadFile, str, None] = File(default=None),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    
    db: Session = Depends(get_db)
):
    record = db.query(SemiTruck).filter(SemiTruck.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Semi truck service card not found"
        )

    if slug and slug != record.slug:
        if db.query(SemiTruck).filter(SemiTruck.slug == slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="New slug already exists."
            )
        record.slug = slug

    if page_heading is not None: record.page_heading = clean_string(page_heading)
    if page_subheading is not None: record.page_subheading = clean_string(page_subheading)
    if card_number is not None: record.card_number = card_number
    if category_tag is not None: record.category_tag = category_tag
    if title is not None: record.title = title
    if short_description is not None: record.short_description = short_description
    if detail_heading is not None: record.detail_heading = detail_heading
    
    if trailer_length is not None: record.trailer_length = clean_string(trailer_length)
    if max_payload is not None: record.max_payload = clean_string(max_payload)
    if cargo_type is not None: record.cargo_type = clean_string(cargo_type)

    if meta_title is not None: record.meta_title = clean_string(meta_title)
    if meta_description is not None: record.meta_description = clean_string(meta_description)
    if meta_keywords is not None: record.meta_keywords = clean_string(meta_keywords)
    if canonical_url is not None: record.canonical_url = clean_string(canonical_url)

    new_card_img = save_uploaded_file(card_image_file)
    if new_card_img:
        record.card_image = new_card_img

    new_detail_img = save_uploaded_file(detail_image_file)
    if new_detail_img:
        record.detail_image = new_detail_img

    if features is not None:
        record.features = parse_to_list(features)

    if detail_paragraphs is not None:
        record.detail_paragraphs = parse_to_list(detail_paragraphs)

    db.commit()
    db.refresh(record)
    return record


# 5. DELETE
@router.delete("/{id}")
def delete_semi_truck(id: int, db: Session = Depends(get_db)):
    record = db.query(SemiTruck).filter(SemiTruck.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Semi truck card not found"
        )
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Semi truck card deleted successfully"}