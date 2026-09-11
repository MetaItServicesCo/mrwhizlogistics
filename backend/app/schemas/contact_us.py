from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class ContactUsCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    service_needed: Optional[str] = None
    company_name: Optional[str] = None
    message: Optional[str] = None


class ContactUsUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    service_needed: Optional[str] = None
    company_name: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None


class ContactUsRead(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    service_needed: Optional[str] = None
    company_name: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = "new"
    created_at: datetime

    class Config:
        from_attributes = True


class ContactInfoRead(BaseModel):
    address: str
    contact_number: str
    email: str
    working_hours: str