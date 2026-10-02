"""
Storage for the chatbot service: its own "chatbot" schema in the site's
Postgres (conversations for the dashboard, the knowledge index, crawl runs).
LangGraph's checkpointer keeps agent state in the same schema.
"""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, REAL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.config import get_settings

settings = get_settings()

metadata = MetaData(schema=settings.db_schema)
Base = declarative_base(metadata=metadata)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    # Salted hash only: enough for rate limits, not an IP address.
    ip_hash = Column(String(64), index=True)
    user_agent = Column(String(300))
    page_url = Column(String(500))
    language = Column(String(16))
    title = Column(String(200))
    message_count = Column(Integer, default=0, nullable=False)
    last_route = Column(String(30))
    lead_stage = Column(String(20), default="none", nullable=False)
    lead_id = Column(Integer, index=True)
    handoff = Column(Boolean, default=False, nullable=False)
    # Guard rewrote or blocked something in this conversation.
    flagged = Column(Boolean, default=False, nullable=False)
    # Started from the proactive invite (not by the visitor opening the chat).
    proactive = Column(Boolean, default=False, nullable=False, server_default=text("false"))


class Message(Base):
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    conversation_id = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(16), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    route = Column(String(30))
    sources = Column(JSONB)
    suggestions = Column(JSONB)
    latency_ms = Column(Integer)
    flagged = Column(Boolean, default=False, nullable=False)
    ip_hash = Column(String(64), index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)


class ProactiveStat(Base):
    """Daily count of proactive invites shown (opened = proactive conversations)."""

    __tablename__ = "proactive_stats"

    day = Column(Date, primary_key=True)
    shown = Column(Integer, default=0, nullable=False)


class KbPage(Base):
    __tablename__ = "kb_pages"

    url = Column(String(500), primary_key=True)
    title = Column(String(300))
    page_hash = Column(String(64))
    chunk_count = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="ok", nullable=False)  # ok | error | removed
    error = Column(String(500))
    fetched_at = Column(DateTime(timezone=True), default=utcnow)


class KbChunk(Base):
    __tablename__ = "kb_chunks"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    url = Column(String(500), ForeignKey("kb_pages.url", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300))
    heading = Column(String(300))
    content = Column(Text, nullable=False)
    embedding = Column(ARRAY(REAL), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class KbRun(Base):
    __tablename__ = "kb_runs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    trigger = Column(String(20), nullable=False)  # startup | schedule | manual
    status = Column(String(20), default="running", nullable=False)  # running | ok | error
    started_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    finished_at = Column(DateTime(timezone=True))
    pages_total = Column(Integer, default=0)
    pages_changed = Column(Integer, default=0)
    pages_failed = Column(Integer, default=0)
    chunks_total = Column(Integer, default=0)
    duration_s = Column(Float)
    error = Column(String(1000))


engine: AsyncEngine = create_async_engine(
    settings.async_database_url,
    pool_size=10,
    max_overflow=10,
    pool_pre_ping=True,
    # Keep every statement inside our schema.
    connect_args={"options": f"-c search_path={settings.db_schema},public"},
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


STARTUP_LOCK_KEY = 7731000


@asynccontextmanager
async def startup_lock():
    """Serializes schema setup across workers: CREATE SCHEMA IF NOT EXISTS
    and create_all race when several workers boot on a fresh database."""
    async with engine.connect() as raw_conn:
        conn = await raw_conn.execution_options(isolation_level="AUTOCOMMIT")
        # Poll instead of a blocking pg_advisory_lock(): the checkpointer's
        # CREATE INDEX CONCURRENTLY waits for every running statement, so a
        # worker blocked inside pg_advisory_lock() would deadlock the setup.
        while not await conn.scalar(text("SELECT pg_try_advisory_lock(:k)"), {"k": STARTUP_LOCK_KEY}):
            await asyncio.sleep(0.5)
        try:
            yield
        finally:
            await conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": STARTUP_LOCK_KEY})


# Columns added after the first release (create_all never alters tables).
COLUMN_UPGRADES = [
    ("conversations", "proactive", "BOOLEAN NOT NULL DEFAULT FALSE"),
]


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{settings.db_schema}"'))
        await conn.run_sync(metadata.create_all)
        for table, column, ddl in COLUMN_UPGRADES:
            await conn.execute(text(f'ALTER TABLE "{settings.db_schema}"."{table}" ADD COLUMN IF NOT EXISTS "{column}" {ddl}'))
