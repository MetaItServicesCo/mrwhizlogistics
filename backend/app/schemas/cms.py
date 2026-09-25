from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ContentBlockBase(BaseModel):
    key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    body: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class ContentBlockCreate(ContentBlockBase):
    pass


class ContentBlockUpdate(BaseModel):
    key: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    body: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None


class ContentBlockRead(ContentBlockBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class SiteSettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    label: Optional[str] = None


class SiteSettingCreate(SiteSettingBase):
    pass


class SiteSettingUpdate(BaseModel):
    value: Optional[str] = None
    label: Optional[str] = None


class SiteSettingRead(SiteSettingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CountStat(BaseModel):
    total: int
    new: int = 0


class DashboardStats(BaseModel):
    quotes: CountStat
    contacts: CountStat
    subscribers: int
    services: int
    faqs: int
    testimonials: int
    pages: int


class NotificationItem(BaseModel):
    id: str
    kind: Literal["quote", "contact", "rental", "comment", "subscriber"]
    title: str
    detail: Optional[str] = None
    created_at: datetime
    href: str
    unread: bool


class NotificationFeed(BaseModel):
    unread: int
    items: list[NotificationItem]
