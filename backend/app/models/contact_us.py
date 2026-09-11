from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy import Column, DateTime, Integer, String, Text, or_
from sqlalchemy.orm import Session

from app.core.crud import apply_updates, get_or_404
from app.database import Base, get_db

# Models
from app.models.truck_type import TruckType

# Schemas
from app.schemas.contact_us import ContactInfoRead, ContactUsCreate, ContactUsRead
from app.schemas.leads import ContactUpdate
from app.schemas.truck_type import (
    PublicTruckType,
    TruckTypeCreate,
    TruckTypeListResponse,
    TruckTypeRead,
    TruckTypeUpdate,
)

# ==========================================================================
# 1. MODELS DEFINITION
# ==========================================================================

class ContactUs(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    service_needed = Column(String, nullable=True)
    truck_type = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String, default="new", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

ContactInquiry = ContactUs

# ==========================================================================
# 2. SINGLE UNIFIED ROUTER
# ==========================================================================

contact_us_router = APIRouter(
    prefix="/contact-us",
    tags=["Contact Us"],
)

# --------------------------------------------------------------------------
# A. PUBLIC & WEBSITE FORM ENDPOINTS
# --------------------------------------------------------------------------

@contact_us_router.post(
    "", 
    response_model=ContactUsRead, 
    status_code=status.HTTP_201_CREATED,
    summary="1. Submit Contact Form (Website)"
)
def submit_contact_form(
    payload: ContactUsCreate,
    db: Session = Depends(get_db),
):
    """Website se user form submit karega."""
    try:
        data = payload.model_dump()
        
        # Safe extraction (Prevents 500 Internal Server Error)
        entry = ContactUs(
            full_name=data.get("full_name"),
            email=data.get("email"),
            phone_number=data.get("phone_number"),
            service_needed=data.get("service_needed"),
            truck_type=data.get("service_needed"),  # Sync truck_type column with service_needed
            company_name=data.get("company_name"),
            message=data.get("message"),
            status="new"
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Insertion Error: {str(e)}"
        )


@contact_us_router.get(
    "/services/list", 
    response_model=List[PublicTruckType],
    summary="2. Get Service Needed / Truck Types Dropdown"
)
def get_service_dropdown_options(db: Session = Depends(get_db)):
    """Frontend dropdown options fetch karne ke liye."""
    return (
        db.query(TruckType)
        .filter(TruckType.is_active.is_(True))
        .order_by(TruckType.sort_order.asc(), TruckType.id.asc())
        .all()
    )


@contact_us_router.get(
    "/info", 
    response_model=ContactInfoRead,
    summary="3. Get Static Contact Details"
)
def get_contact_info():
    """Footer aur Contact page details."""
    return {
        "address": "555 N 5th St 109 B, Garland, TX 75040, United States",
        "contact_number": "+1 (469) 767 8853",
        "email": "dispatch@yourcompany.com",
        "working_hours": "24/7 Dispatch — Always available",
    }

# --------------------------------------------------------------------------
# B. DASHBOARD ENDPOINTS (LIST, GET, UPDATE, DELETE)
# --------------------------------------------------------------------------

@contact_us_router.get(
    "", 
    response_model=List[ContactUsRead],
    summary="4. List All Submissions (Dashboard)"
)
def list_contact_inquiries(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    """Dashboard par sari inquiries show karega."""
    q = db.query(ContactUs)
    if status_filter:
        q = q.filter(ContactUs.status == status_filter)

    return q.order_by(ContactUs.created_at.desc()).all()


@contact_us_router.get(
    "/{inquiry_id}", 
    response_model=ContactUsRead,
    summary="5. Get Single Inquiry Detail (Dashboard)"
)
def get_single_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
):
    """Single inquiry ka data dekhaney ke liye."""
    return get_or_404(db, ContactUs, inquiry_id)


@contact_us_router.patch(
    "/{inquiry_id}", 
    response_model=ContactUsRead,
    summary="6. Update Inquiry Data / Status (Dashboard)"
)
def update_inquiry(
    inquiry_id: int,
    payload: ContactUpdate,
    db: Session = Depends(get_db),
):
    """Dashboard se row ka status/data update karne ke liye."""
    row = get_or_404(db, ContactUs, inquiry_id)
    data = payload.model_dump(exclude_unset=True)

    if "status" in data and data["status"] is not None:
        data["status"] = (
            data["status"].value
            if hasattr(data["status"], "value")
            else data["status"]
        )

    apply_updates(row, data)
    db.commit()
    db.refresh(row)
    return row


@contact_us_router.delete(
    "/{inquiry_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="7. Delete Inquiry (Dashboard)"
)
def delete_contact_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
):
    """Dashboard se Record ko permanent delete karne ke liye."""
    entry = get_or_404(db, ContactUs, inquiry_id)
    db.delete(entry)
    db.commit()


# ==========================================================================
# 3. BACKWARD COMPATIBILITY ALIASES
# ==========================================================================
# Keeps app/routes/__init__.py working without throwing ImportError
contacts_router = contact_us_router
truck_router = contact_us_router
public_router = contact_us_router