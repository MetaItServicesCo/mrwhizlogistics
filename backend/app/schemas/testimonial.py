from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class TestimonialBase(BaseModel):
    quote: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    rating: int = Field(5, ge=1, le=5)
    initials: Optional[str] = Field(None, max_length=10)
    accent: Optional[str] = Field(None, max_length=255)
    image: Optional[str] = Field(None, max_length=500)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("quote", "name")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be empty")
        return v


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    quote: Optional[str] = Field(None, min_length=1)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    rating: Optional[int] = Field(None, ge=1, le=5)
    initials: Optional[str] = Field(None, max_length=10)
    accent: Optional[str] = Field(None, max_length=255)
    image: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("quote", "name")
    @classmethod
    def _not_blank(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("This field cannot be empty")
        return v


class TestimonialRead(BaseModel):
    id: int
    quote: str
    name: str
    role: Optional[str] = None
    rating: int
    initials: Optional[str] = None
    accent: Optional[str] = None
    image: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TestimonialListResponse(BaseModel):
    items: List[TestimonialRead]
    total: int
    page: int
    size: int