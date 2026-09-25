from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HotshotBase(BaseModel):
    # Listing page headings
    page_heading: Optional[str] = None
    page_subheading: Optional[str] = None

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
    content_html: Optional[str] = None

    # SEO & Slug Navigation
    slug: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None

class HotshotResponse(HotshotBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True