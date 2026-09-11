from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class QuoteRequest(Base):
    __tablename__ = "quote_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    email = Column(String(255), nullable=False, index=True)
    pickup = Column(String(255))
    drop = Column(String(255))
    selected_service = Column(String(80), nullable=False)
    details = Column(Text)
    status = Column(String(30), default="new", nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
