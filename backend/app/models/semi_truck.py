from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base

class SemiTruck(Base):
    __tablename__ = "semi_truck_cards"

    id = Column(Integer, primary_key=True, index=True)

    # --- LANDING PAGE DATA ---
    page_heading = Column(String(300), nullable=True, default="Semi Truck")
    page_subheading = Column(String(500), nullable=True, default="Choose the right semi truck")
    
    # --- CARD DATA ---
    card_number = Column(String(20), nullable=False)          # e.g., "01"
    category_tag = Column(String(100), nullable=False)        # e.g., "TEMPERATURE CONTROLLED"
    title = Column(String(200), nullable=False)               # e.g., "Reefer Truck"
    short_description = Column(Text, nullable=False)          # Card summary
    card_image = Column(String(500), nullable=False)          # Card image path
    features = Column(JSON, default=[])                       # e.g., ["Temp-controlled", "Live GPS"]

    # --- DETAIL PAGE DATA ---
    detail_heading = Column(String(300), nullable=False)      # e.g., "Transportation built around..."
    detail_image = Column(String(500), nullable=True)         # Banner image
    detail_paragraphs = Column(JSON, default=[])              # Description paragraphs
    # Rich-text body from the dashboard editor (sanitised HTML). When set it
    # replaces the legacy paragraph list on the public detail page.
    content_html = Column(Text, nullable=True)

    # --- TECHNICAL SPECIFICATIONS (Bottom Bar) ---
    trailer_length = Column(String(100), nullable=True)       # e.g., "53 ft"
    max_payload = Column(String(100), nullable=True)           # e.g., "~44,000 lbs"
    cargo_type = Column(String(100), nullable=True)            # e.g., "Temp Controlled"

    # --- ROUTING & SEO DATA ---
    slug = Column(String(200), unique=True, index=True, nullable=False)
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(300), nullable=True)
    canonical_url = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())