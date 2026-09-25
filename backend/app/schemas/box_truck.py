from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# -------------------------------------------------------------
# 1. BASE SCHEMA (Shared Fields)
# -------------------------------------------------------------
class BoxTruckBase(BaseModel):
    page_heading: Optional[str] = None
    page_subheading: Optional[str] = None

    card_number: str
    category_tag: Optional[str] = None
    title: str
    short_description: str
    features: List[str] = []
    
    detail_heading: str
    detail_paragraphs: List[str] = []
    content_html: Optional[str] = None
    
    slug: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None


# -------------------------------------------------------------
# 2. RESPONSE SCHEMA (API Output Format)
# -------------------------------------------------------------
class BoxTruckResponse(BoxTruckBase):
    id: int
    card_image: str
    detail_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True