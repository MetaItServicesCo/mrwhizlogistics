from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.types import JSON

from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    number = Column(String(10))
    title = Column(String(255), nullable=False)
    badge = Column(String(255))
    image = Column(String(500))
    short_description = Column(Text)
    description = Column(JSON, default=list)
    features = Column(JSON, default=list)
    stats = Column(JSON, default=list)
    options = Column(JSON, default=list)
    category = Column(String(50), nullable=False, index=True)
    icon = Column(String(50))
    nav_href = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
