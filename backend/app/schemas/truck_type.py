from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TruckTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    category: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(None, max_length=300)
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("name", "category")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be empty")
        return v


class TruckTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    category: Optional[str] = Field(None, min_length=1, max_length=80)
    description: Optional[str] = Field(None, max_length=300)
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("name", "category")
    @classmethod
    def _not_blank(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("This field cannot be empty")
        return v


class TruckTypeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime


class TruckTypeListResponse(BaseModel):
    items: List[TruckTypeRead]
    total: int
    page: int
    size: int


class PublicTruckType(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None
    icon: Optional[str] = None