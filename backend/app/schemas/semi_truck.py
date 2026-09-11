from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SemiTruckBase(BaseModel):
    # Landing Page Titles
    page_heading: Optional[str] = "Semi Truck"
    page_subheading: Optional[str] = "Choose the right semi truck"

    # Card Data
    card_number: str
    category_tag: str
    title: str
    short_description: str
    card_image: str
    features: List[str] = []

    # Detail Page Data
    detail_heading: str
    detail_image: Optional[str] = None
    detail_paragraphs: List[str] = []

    # Specs
    trailer_length: Optional[str] = None
    max_payload: Optional[str] = None
    cargo_type: Optional[str] = None

    # SEO & Routing
    slug: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None

class SemiTruckResponse(SemiTruckBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True