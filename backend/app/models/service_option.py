from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class ServiceOption(Base):
    """One option in the quote form's 'Select Service' dropdown
    (Hot Shot / Box Truck / Semi Truck). Admin can add/edit/delete/reorder."""
    __tablename__ = "service_options"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(120), nullable=False, unique=True)   # Hot Shot / Box Truck / Semi Truck

    is_active = Column(Boolean, default=True, nullable=False, index=True)
    sort_order = Column(Integer, default=0, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)