from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class NewsletterCampaign(Base):
    __tablename__ = "newsletter_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(200), nullable=False)
    preview_text = Column(String(300), nullable=True)
    content_html = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="draft", index=True)
    recipient_count = Column(Integer, nullable=False, default=0)
    delivered_count = Column(Integer, nullable=False, default=0)
    failed_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)

    deliveries = relationship(
        "NewsletterDelivery",
        back_populates="campaign",
        cascade="all, delete-orphan",
    )


class NewsletterDelivery(Base):
    __tablename__ = "newsletter_deliveries"
    __table_args__ = (UniqueConstraint("campaign_id", "subscriber_id", name="uq_newsletter_delivery"),)

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("newsletter_campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    # Keep the delivery audit even if an administrator later deletes the
    # subscriber record. The recipient address is snapshotted below.
    subscriber_id = Column(Integer, ForeignKey("subscribers.id", ondelete="SET NULL"), nullable=True, index=True)
    email = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    error_message = Column(String(500), nullable=True)
    sent_at = Column(DateTime, nullable=True)

    campaign = relationship("NewsletterCampaign", back_populates="deliveries")
