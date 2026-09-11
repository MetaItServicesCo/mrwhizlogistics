from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class SEO(Base):
    """SEO metadata associated with a page."""

    __tablename__ = "seo"

    id = Column(Integer, primary_key=True, index=True)

    page_id = Column(
        Integer,
        ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    seo_slug = Column(String(255), nullable=True)
    keywords = Column(String(500), nullable=True)
    canonical_url = Column(String(500), nullable=True)
    robots = Column(String(80), nullable=True)

    og_title = Column(String(255), nullable=True)
    og_description = Column(Text, nullable=True)
    og_image = Column(String(500), nullable=True)
    og_type = Column(String(50), nullable=True)

    page = relationship(
        "Page",
        back_populates="seo",
    )


# class QuoteRequest(Base):
#     """Quote form submission (Get a fast quote popup)."""
#     __tablename__ = "quote_requests"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(255), nullable=False)
#     phone = Column(String(50))
#     email = Column(String(255), nullable=False, index=True)
#     pickup = Column(String(255))
#     drop = Column(String(255))
#     selected_service = Column(String(120), nullable=False, default="Hot Shot")
#     details = Column(Text)
#     status = Column(String(30), default="new", nullable=False, index=True)
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# class ServiceOption(Base):
#     """One option in the quote form's 'Select Service' dropdown
#     (Hot Shot / Box Truck / Semi Truck). Admin can add/edit/delete/reorder."""
#     __tablename__ = "service_options"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(120), nullable=False, unique=True)   # Hot Shot / Box Truck / Semi Truck
#     is_active = Column(Boolean, default=True, nullable=False, index=True)
#     sort_order = Column(Integer, default=0, nullable=False, index=True)
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)