from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func

from app.database import Base


class SeedRun(Base):
    """Records one-time content migrations so deleted CMS data stays deleted."""

    __tablename__ = "seed_runs"

    key = Column(String(100), primary_key=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
