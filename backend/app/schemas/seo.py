from typing import Optional

from pydantic import BaseModel, ConfigDict


class SEOBase(BaseModel):
    page_id: int
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    seo_slug: Optional[str] = None
    keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    robots: Optional[str] = "index,follow"
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    og_type: Optional[str] = "website"


class SEOCreate(SEOBase):
    pass


class SEOUpdate(BaseModel):
    page_id: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    seo_slug: Optional[str] = None
    keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    robots: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    og_type: Optional[str] = None


class SEORead(SEOBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
