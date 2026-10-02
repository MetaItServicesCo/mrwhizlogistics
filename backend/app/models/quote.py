from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base


class QuoteRequest(Base):
    __tablename__ = "quote_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    # Website form requires it; chat leads may only leave a phone number.
    email = Column(String(255), nullable=True, index=True)
    pickup = Column(String(255))
    drop = Column(String(255))
    selected_service = Column(String(80), nullable=False)
    details = Column(Text)
    status = Column(String(30), default="new", nullable=False, index=True)
    # "website" (quote form) or "chatbot" (AI assistant).
    source = Column(String(30), default="website", nullable=True, index=True)
    # The visitor asked to be called back right away (chat leads).
    callback_requested = Column(Boolean, default=False, nullable=True)
    # Chat session that produced the lead, to open the transcript.
    chat_session_id = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
