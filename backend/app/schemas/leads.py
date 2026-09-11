from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.enums import InquiryStatus


class ContactCreate(BaseModel):
    name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: EmailStr
    company: Optional[str] = None
    truck_type: str
    message: Optional[str] = None


class ContactUpdate(BaseModel):
    status: Optional[InquiryStatus] = None
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    truck_type: Optional[str] = None
    message: Optional[str] = None


class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: EmailStr
    company: Optional[str] = None
    truck_type: str
    message: Optional[str] = None
    status: str
    created_at: datetime


# class QuoteCreate(BaseModel):
#     name: str
#     phone: Optional[str] = None
#     email: EmailStr
#     pickup: Optional[str] = None
#     drop: Optional[str] = None
#     selected_service: str = Field(default="Hot Shot")
#     details: Optional[str] = None


# class QuoteUpdate(BaseModel):
#     status: Optional[InquiryStatus] = None
#     name: Optional[str] = None
#     phone: Optional[str] = None
#     email: Optional[EmailStr] = None
#     pickup: Optional[str] = None
#     drop: Optional[str] = None
#     selected_service: Optional[str] = None
#     details: Optional[str] = None


# class QuoteRead(BaseModel):
#     model_config = ConfigDict(from_attributes=True)

#     id: int
#     name: str
#     phone: Optional[str] = None
#     email: EmailStr
#     pickup: Optional[str] = None
#     drop: Optional[str] = None
#     selected_service: str
#     details: Optional[str] = None
#     status: str
#     created_at: datetime


class SubscriberCreate(BaseModel):
    email: EmailStr


class SubscriberUpdate(BaseModel):
    is_active: Optional[bool] = None


class SubscriberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime
