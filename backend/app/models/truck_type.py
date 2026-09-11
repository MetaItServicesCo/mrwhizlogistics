from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class TruckType(Base):
    """One option in the contact form's 'Choose your truck or trailer' dropdown.
    Admin can add / edit / delete / reorder from the dashboard."""
    __tablename__ = "truck_types"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    category = Column(String(80), nullable=False, index=True)   # Hot Shot / Box Truck / Semi Truck
    description = Column(String(300))
    icon = Column(String(50))                                   # truck / van / trailer

    is_active = Column(Boolean, default=True, nullable=False, index=True)
    sort_order = Column(Integer, default=0, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)