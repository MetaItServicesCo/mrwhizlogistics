from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base

class BoxTruck(Base):
    __tablename__ = "box_trucks"

    id = Column(Integer, primary_key=True, index=True)

    # --- PAGE HEADINGS (listing page) ---
    page_heading = Column(String(200), nullable=True, default="Box Truck")
    page_subheading = Column(String(300), nullable=True)
    
    # Landing Page Card Fields
    card_number = Column(String, nullable=False)
    category_tag = Column(String(100), nullable=True)
    title = Column(String, nullable=False)
    short_description = Column(Text, nullable=False)
    card_image = Column(String, nullable=False)
    features = Column(JSON, default=[])
    
    # Detail Page Fields
    detail_heading = Column(String, nullable=False)
    detail_image = Column(String, nullable=True)
    detail_paragraphs = Column(JSON, default=[])
    # Rich-text body from the dashboard editor (sanitised HTML). When set it
    # replaces the legacy paragraph list on the public detail page.
    content_html = Column(Text, nullable=True)
    
    # Dynamic Routing & SEO Fields
    slug = Column(String, unique=True, index=True, nullable=False)
    meta_title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String, nullable=True)
    canonical_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())