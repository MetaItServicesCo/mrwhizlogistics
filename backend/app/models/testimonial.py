from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=True, index=True)

    quote = Column(Text, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(255))
    rating = Column(Integer, default=5, nullable=False)
    initials = Column(String(10))
    accent = Column(String(255))
    image = Column(String(500))

    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)