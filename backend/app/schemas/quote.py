from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.enums import InquiryStatus


# ==========================================================================
# Quote request (the form)
# ==========================================================================

class QuoteCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: EmailStr
    pickup: Optional[str] = None
    drop: Optional[str] = None
    selected_service: str = Field(default="Hot Shot", max_length=120)
    details: Optional[str] = None

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class QuoteUpdate(BaseModel):
    status: Optional[InquiryStatus] = None
    name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    pickup: Optional[str] = None
    drop: Optional[str] = None
    selected_service: Optional[str] = Field(None, max_length=120)
    details: Optional[str] = None


class QuoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: Optional[str] = None
    email: EmailStr
    pickup: Optional[str] = None
    drop: Optional[str] = None
    selected_service: str
    details: Optional[str] = None
    status: str
    created_at: datetime


# ==========================================================================
# Service options — quote form's "Select Service" dropdown
# ==========================================================================

class ServiceOptionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class ServiceOptionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def _not_blank(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
        return v


class ServiceOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sort_order: int
    is_active: bool
    created_at: datetime


class ServiceOptionListResponse(BaseModel):
    items: List[ServiceOptionRead]
    total: int
    page: int
    size: int


# Public (frontend dropdown) — sirf zaroori fields
class PublicServiceOption(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str