from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------- FAQ item ----------------

class FAQBase(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)
    display_order: int = 0
    is_active: bool = True

    @field_validator("question", "answer")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be empty")
        return v


class FAQCreate(FAQBase):
    category_id: int


class FAQUpdate(BaseModel):
    category_id: Optional[int] = None
    question: Optional[str] = Field(None, min_length=1, max_length=500)
    answer: Optional[str] = Field(None, min_length=1)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("question", "answer")
    @classmethod
    def _not_blank(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("This field cannot be empty")
        return v


class FAQOut(BaseModel):
    id: int
    category_id: int
    question: str
    answer: str
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FAQListResponse(BaseModel):
    items: List[FAQOut]
    total: int
    page: int
    size: int


# ---------------- FAQ category ----------------

class FAQCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    icon: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=300)
    display_order: int = 0
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class FAQCategoryCreate(FAQCategoryBase):
    pass


class FAQCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    icon: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=300)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class FAQCategoryOut(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None
    display_order: int
    is_active: bool
    faq_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FAQCategoryListResponse(BaseModel):
    items: List[FAQCategoryOut]
    total: int
    page: int
    size: int


# ---------------- Public (frontend) shapes ----------------

class PublicFAQItem(BaseModel):
    id: int
    question: str
    answer: str

    model_config = {"from_attributes": True}


class PublicFAQCategory(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None
    faq_count: int
    faqs: List[PublicFAQItem]

    model_config = {"from_attributes": True}


FAQRead = FAQOut
FAQCategoryRead = FAQCategoryOut