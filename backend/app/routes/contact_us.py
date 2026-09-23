from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_admin

# Schemas
from app.schemas.contact_us import (
    ContactInfoRead, 
    ContactUsCreate, 
    ContactUsUpdate, 
    ContactUsRead
)
from app.schemas.truck_type import PublicTruckType
from app.models.truck_type import TruckType

# ==========================================================================
# 1. DATABASE MODEL
# ==========================================================================
# The model lives in app/models/contact_us.py and is imported here. It used to
# be re-declared in this module with extend_existing=True, which appended a
# second copy of the `id` index to the same Table object -- create_all() then
# emitted "CREATE INDEX ix_contact_inquiries_id" twice and startup aborted.
from app.models.contact_us import ContactInquiry, ContactUs

# ==========================================================================
# 2. ROUTER DEFINITION
# ==========================================================================

contact_us_router = APIRouter(
    prefix="/contact-us",
    tags=["Contact Us"],
)

# --------------------------------------------------------------------------
# A. STATIC ROUTES (MUST BE DEFINED FIRST)
# --------------------------------------------------------------------------

@contact_us_router.post(
    "", 
    response_model=ContactUsRead, 
    status_code=status.HTTP_201_CREATED,
    summary="1. Submit Contact Form"
)
def submit_contact_form(
    payload: ContactUsCreate,
    db: Session = Depends(get_db),
):
    """Website user contact form submission."""
    data = payload.model_dump()
    entry = ContactUs(
        full_name=data.get("full_name"),
        email=data.get("email"),
        phone_number=data.get("phone_number"),
        service_needed=data.get("service_needed"),
        truck_type=data.get("service_needed"),
        company_name=data.get("company_name"),
        message=data.get("message"),
        status="new"
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@contact_us_router.get(
    "", 
    response_model=List[ContactUsRead],
    summary="2. List All Submissions"
, dependencies=[Depends(get_current_admin)])
def list_contact_inquiries(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    """Dashboard inquiry list."""
    q = db.query(ContactUs)
    if status_filter:
        q = q.filter(ContactUs.status == status_filter)
    return q.order_by(ContactUs.created_at.desc()).all()


@contact_us_router.get(
    "/services/list", 
    response_model=List[PublicTruckType],
    summary="3. Services Dropdown Options"
)
def get_service_dropdown_options(db: Session = Depends(get_db)):
    """Frontend dropdown choices."""
    return (
        db.query(TruckType)
        .filter(TruckType.is_active.is_(True))
        .order_by(TruckType.sort_order.asc(), TruckType.id.asc())
        .all()
    )


@contact_us_router.get(
    "/info", 
    response_model=ContactInfoRead,
    summary="4. Company Info"
)
def get_contact_info():
    """Footer and static details."""
    return {
        "address": "555 N 5th St 109 B, Garland, TX 75040, United States",
        "contact_number": "+1 (469) 767 8853",
        "email": "dispatch@yourcompany.com",
        "working_hours": "24/7 Dispatch — Always available",
    }


# --------------------------------------------------------------------------
# B. DYNAMIC PARAMETERIZED ROUTES (ID-BASED - DEFINED AT THE BOTTOM)
# --------------------------------------------------------------------------

@contact_us_router.get(
    "/{inquiry_id}", 
    response_model=ContactUsRead,
    summary="5. Get Single Inquiry"
, dependencies=[Depends(get_current_admin)])
def get_single_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
):
    """Single item view by ID."""
    entry = db.query(ContactUs).filter(ContactUs.id == inquiry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return entry


@contact_us_router.patch(
    "/{inquiry_id}", 
    response_model=ContactUsRead,
    summary="6. Update Inquiry Data / Status"
, dependencies=[Depends(get_current_admin)])
def update_inquiry(
    inquiry_id: int,
    payload: ContactUsUpdate,
    db: Session = Depends(get_db),
):
    """Dashboard record update."""
    entry = db.query(ContactUs).filter(ContactUs.id == inquiry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@contact_us_router.delete(
    "/{inquiry_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="7. Delete Inquiry"
, dependencies=[Depends(get_current_admin)])
def delete_contact_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
):
    """Dashboard record deletion."""
    entry = db.query(ContactUs).filter(ContactUs.id == inquiry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    db.delete(entry)
    db.commit()


# Backward compatibility aliases for all initial routers
contacts_router = contact_us_router
truck_router = contact_us_router
public_router = contact_us_router