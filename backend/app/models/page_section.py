from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database import Base


class PageSection(Base):
    __tablename__ = "page_sections"
    __table_args__ = (UniqueConstraint("page_id", "key", name="uq_page_section_key"),)

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=False, index=True)
    key = Column(String(80), nullable=False, index=True)
    eyebrow = Column(String(255))
    title = Column(String(500))
    highlight_text = Column(String(255))
    subtitle = Column(String(500))
    description = Column(Text)
    image = Column(String(500))
    video_url = Column(String(500))
    cta_label = Column(String(255))
    items = Column(JSON, default=list)
    extra = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    page = relationship("Page", back_populates="sections")
