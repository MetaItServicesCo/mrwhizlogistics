from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class FAQCategory(Base):
    """
    A FAQ category = one tab in the Home FAQ section
    (e.g. "Hot Shot Trucking", "Box Truck", "Semi-Truck", "General FAQ").
    Admin can add / edit / reorder / activate-deactivate these.
    """
    __tablename__ = "faq_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String(150), nullable=False)
    # slug = Column(String(160), nullable=False, unique=True, index=True)  # SEO-friendly id
    icon = Column(String(80), nullable=True)          # icon key for the tab (frontend maps it)
    description = Column(String(300), nullable=True)   # optional line under the tab

    display_order = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # One category -> many FAQs. Deleting a category deletes its FAQs.
    faqs = relationship(
        "FAQ",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="FAQ.display_order",
    )


class FAQ(Base):
    """A single question/answer that belongs to a FAQCategory."""
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    category_id = Column(
        Integer,
        ForeignKey("faq_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)

    display_order = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category = relationship("FAQCategory", back_populates="faqs")