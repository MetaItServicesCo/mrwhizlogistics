from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean, JSON
from app.database import Base

class RentalItem(Base):
    """Rental Equipment Catalog & Gallery Model"""
    __tablename__ = "rental_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    hourly_rate = Column(String, nullable=True)
    main_image = Column(String, nullable=True)
    gallery_images = Column(JSON, default=list)  # ["img1.jpg", "img2.jpg"]


class RentalQuote(Base):
    """Customer Form Submission Model"""
    __tablename__ = "rental_quotes"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    
    # Customer Info
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    preferred_contact_method = Column(String, default="phone")

    # Rental Details
    rental_slug = Column(String, nullable=False)
    rental_name = Column(String, nullable=True)
    rental_duration = Column(String, default="daily")
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)

    # Logistics (MUST BE OPTIONAL)
    pickup_location = Column(String, nullable=True)
    return_location = Column(String, nullable=True)
    delivery_required = Column(Boolean, default=False)
    delivery_address = Column(String, nullable=True)

    # Cargo Details
    intended_use = Column(String, nullable=True)
    load_description = Column(Text, nullable=True)
    cargo_type = Column(String, nullable=True)
    estimated_weight = Column(String, nullable=True)
    estimated_mileage = Column(String, nullable=True)

    # Requirements
    special_requirements = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)

    # System & Meta
    status = Column(String, default="pending")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(JSON, nullable=True)