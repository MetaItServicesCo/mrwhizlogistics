from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    slug: str
    number: Optional[str] = None
    title: str
    badge: Optional[str] = None
    image: Optional[str] = None
    short_description: Optional[str] = None
    description: list[str] = Field(default_factory=list)
    features: list[dict[str, Any]] = Field(default_factory=list)
    stats: list[dict[str, Any]] = Field(default_factory=list)
    options: list[dict[str, Any]] = Field(default_factory=list)
    category: str
    icon: Optional[str] = None
    nav_href: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    slug: Optional[str] = None
    number: Optional[str] = None
    title: Optional[str] = None
    badge: Optional[str] = None
    image: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[list[str]] = None
    features: Optional[list[dict[str, Any]]] = None
    stats: Optional[list[dict[str, Any]]] = None
    options: Optional[list[dict[str, Any]]] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    nav_href: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ServiceRead(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
