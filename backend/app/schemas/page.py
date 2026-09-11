from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class SEONested(BaseModel):
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


class SEOBase(SEONested):
    page_id: int


class SEOCreate(SEOBase):
    pass


class SEOUpdate(SEONested):
    page_id: Optional[int] = None


class SEORead(SEONested):
    model_config = ConfigDict(from_attributes=True)

    id: int
    page_id: int


class PageSectionBase(BaseModel):
    key: str
    eyebrow: Optional[str] = None
    title: Optional[str] = None
    highlight_text: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    video_url: Optional[str] = None
    cta_label: Optional[str] = None
    items: list[Any] = Field(default_factory=list)
    extra: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True
    sort_order: int = 0


class PageSectionCreate(PageSectionBase):
    page_id: int


class PageSectionUpdate(BaseModel):
    key: Optional[str] = None
    eyebrow: Optional[str] = None
    title: Optional[str] = None
    highlight_text: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    video_url: Optional[str] = None
    cta_label: Optional[str] = None
    items: Optional[list[Any]] = None
    extra: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class PageSectionRead(PageSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    page_id: int
    updated_at: Optional[datetime] = None


class PageBase(BaseModel):
    title: str
    slug: str
    page_type: str = "home"
    content: Optional[str] = None
    is_active: bool = True
    parent_id: Optional[int] = None
    redirect_url: Optional[str] = None
    sort_order: int = 0


class PageCreate(PageBase):
    seo: Optional[SEONested] = None


class PageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    page_type: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None
    parent_id: Optional[int] = None
    redirect_url: Optional[str] = None
    sort_order: Optional[int] = None
    seo: Optional[SEONested] = None


class PageRead(PageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class PageDetail(PageRead):
    seo: Optional[SEORead] = None
    sections: list[PageSectionRead] = Field(default_factory=list)
