from datetime import datetime
from typing import Optional, List, Any, Dict, Literal
from pydantic import BaseModel, EmailStr

# --- Equipment Schemas ---
class RentalItemBase(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    hourly_rate: Optional[str] = None
    main_image: Optional[str] = None
    gallery_images: List[str] = []

class RentalItemCreate(RentalItemBase):
    pass

class RentalItemRead(RentalItemBase):
    id: int
    class Config:
        from_attributes = True


# --- Quote Form Sub-Schemas ---
class CustomerInfoSchema(BaseModel):
    fullName: str
    companyName: Optional[str] = None
    email: EmailStr
    phone: str
    preferredContactMethod: Optional[str] = "phone"

class RentalInfoSchema(BaseModel):
    slug: str
    name: Optional[str] = ""
    duration: Optional[str] = "daily"
    startDate: Optional[str] = None
    endDate: Optional[str] = None

class LogisticsInfoSchema(BaseModel):
    pickupLocation: Optional[str] = None  # Explicitly Optional
    returnLocation: Optional[str] = None  # Explicitly Optional
    deliveryRequired: Optional[bool] = False
    deliveryAddress: Optional[str] = None

class LoadInfoSchema(BaseModel):
    intendedUse: Optional[str] = None
    description: Optional[str] = None
    cargoType: Optional[str] = None
    estimatedWeight: Optional[str] = None
    estimatedMileage: Optional[str] = None

class RequirementsSchema(BaseModel):
    specialRequirements: Optional[str] = None
    additionalNotes: Optional[str] = None

class RentalQuoteCreate(BaseModel):
    customer: CustomerInfoSchema
    rental: RentalInfoSchema
    logistics: LogisticsInfoSchema
    load: LoadInfoSchema
    requirements: RequirementsSchema
    metadata: Optional[Dict[str, Any]] = None


# Dashboard workflow for a rental request. "pending" is what the website form
# creates, so it stays the first step rather than being renamed.
RentalQuoteStatus = Literal["pending", "contacted", "quoted", "booked", "closed"]


class RentalQuoteStatusUpdate(BaseModel):
    status: RentalQuoteStatus
