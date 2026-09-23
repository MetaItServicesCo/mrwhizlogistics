from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_admin
from app.models.rental import RentalItem, RentalQuote
from app.schemas.rental import (
    RentalItemCreate, 
    RentalItemRead, 
    RentalQuoteCreate
)

rental_router = APIRouter(
    prefix="/rental-quotes",
    tags=["Rental Quotes & Equipment Gallery"],
)

def format_quote_response(db_item: RentalQuote) -> dict:
    return {
        "id": db_item.id,
        "customer": {
            "fullName": db_item.full_name,
            "companyName": db_item.company_name,
            "email": db_item.email,
            "phone": db_item.phone,
            "preferredContactMethod": db_item.preferred_contact_method,
        },
        "rental": {
            "slug": db_item.rental_slug,
            "name": db_item.rental_name or "",
            "duration": db_item.rental_duration,
            "startDate": db_item.start_date,
            "endDate": db_item.end_date,
        },
        "logistics": {
            "pickupLocation": db_item.pickup_location,
            "returnLocation": db_item.return_location,
            "deliveryRequired": db_item.delivery_required,
            "deliveryAddress": db_item.delivery_address,
        },
        "load": {
            "intendedUse": db_item.intended_use,
            "description": db_item.load_description,
            "cargoType": db_item.cargo_type,
            "estimatedWeight": db_item.estimated_weight,
            "estimatedMileage": db_item.estimated_mileage,
        },
        "requirements": {
            "specialRequirements": db_item.special_requirements,
            "additionalNotes": db_item.additional_notes,
        },
        "status": db_item.status,
        "submittedAt": db_item.submitted_at,
    }

# 1. GET Equipment Details & Gallery (For Detail Page)
@rental_router.get("/equipment/{slug}", response_model=RentalItemRead, summary="Fetch Detail Page Data & Gallery")
def get_equipment_detail(slug: str, db: Session = Depends(get_db)):
    item = db.query(RentalItem).filter(RentalItem.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Rental Equipment not found")
    return item

# 2. POST Add Equipment & Gallery (Dashboard Setup)
@rental_router.post("/equipment", response_model=RentalItemRead, status_code=status.HTTP_201_CREATED, summary="Add Equipment & Gallery (Dashboard)", dependencies=[Depends(get_current_admin)])
def create_equipment_item(payload: RentalItemCreate, db: Session = Depends(get_db)):
    item = RentalItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

# 3. POST User Form Submission
@rental_router.post("", status_code=status.HTTP_201_CREATED, summary="Submit Rental Quote (Website)")
def submit_rental_quote(payload: RentalQuoteCreate, db: Session = Depends(get_db)):
    try:
        quote = RentalQuote(
            full_name=payload.customer.fullName,
            company_name=payload.customer.companyName,
            email=payload.customer.email,
            phone=payload.customer.phone,
            preferred_contact_method=payload.customer.preferredContactMethod or "phone",
            rental_slug=payload.rental.slug,
            rental_name=payload.rental.name,
            rental_duration=payload.rental.duration,
            start_date=payload.rental.startDate,
            end_date=payload.rental.endDate,
            pickup_location=payload.logistics.pickupLocation,
            return_location=payload.logistics.returnLocation,
            delivery_required=payload.logistics.deliveryRequired or False,
            delivery_address=payload.logistics.deliveryAddress,
            intended_use=payload.load.intendedUse,
            load_description=payload.load.description,
            cargo_type=payload.load.cargoType,
            estimated_weight=payload.load.estimatedWeight,
            estimated_mileage=payload.load.estimatedMileage,
            special_requirements=payload.requirements.specialRequirements,
            additional_notes=payload.requirements.additionalNotes,
            status="pending",
            meta_data=payload.metadata,
        )
        db.add(quote)
        db.commit()
        db.refresh(quote)
        return format_quote_response(quote)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit quote: {str(e)}")

# 4. GET Dashboard Quote List Control
@rental_router.get("", summary="Get All Quotes (Dashboard)", dependencies=[Depends(get_current_admin)])
def list_rental_quotes(status_filter: Optional[str] = Query(None, alias="status"), db: Session = Depends(get_db)):
    q = db.query(RentalQuote)
    if status_filter:
        q = q.filter(RentalQuote.status == status_filter)
    records = q.order_by(RentalQuote.submitted_at.desc()).all()
    return [format_quote_response(rec) for rec in records]

# 5. DELETE Dashboard Record Control
@rental_router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Quote (Dashboard)", dependencies=[Depends(get_current_admin)])
def delete_quote(quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(RentalQuote).filter(RentalQuote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    db.delete(quote)
    db.commit()

router = rental_router