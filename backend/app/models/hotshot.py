from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Hotshot(Base):
    __tablename__ = "hotshot_cards"

    id = Column(Integer, primary_key=True, index=True)

    # --- PAGE HEADINGS (listing page) ---
    page_heading = Column(String(200), nullable=True, default="Hotshot")
    page_subheading = Column(String(300), nullable=True)

    # --- LANDING PAGE / CARD DATA ---
    card_number = Column(String(20), nullable=False)          # e.g. "01"
    category_tag = Column(String(100), nullable=False)        # e.g. "CRITICAL PARTS DELIVERY"
    title = Column(String(200), nullable=False)               # e.g. "Truck & Trailers"
    short_description = Column(Text, nullable=False)          # Card text
    card_image = Column(String(500), nullable=False)          # Card image path/URL
    features = Column(JSON, default=[])                       # e.g. ["Responsive Pickup", "Direct Delivery"]

    # --- DETAIL PAGE DATA ---
    detail_heading = Column(String(300), nullable=False)      # Main Title on Detail Page
    detail_image = Column(String(500), nullable=True)        # Banner/Detail image path/URL
    detail_paragraphs = Column(JSON, default=[])              # Array of paragraphs for detailed description
    # Rich-text body from the dashboard editor (sanitised HTML). When set it
    # replaces the legacy paragraph list on the public detail page.
    content_html = Column(Text, nullable=True)

    # --- ROUTING & SEO DATA ---
    slug = Column(String(200), unique=True, index=True, nullable=False) # Route identifier (e.g. truck-trailers)
    meta_title = Column(String(200), nullable=True)           # SEO Title
    meta_description = Column(Text, nullable=True)            # SEO Meta Description
    meta_keywords = Column(String(300), nullable=True)         # SEO Keywords
    canonical_url = Column(String(500), nullable=True)        # Canonical URL

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())