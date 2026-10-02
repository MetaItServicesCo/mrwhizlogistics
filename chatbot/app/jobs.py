"""Background jobs (one asyncio task each, per worker; heavy ones take a pg lock)."""

import asyncio
import logging
from datetime import timedelta

from sqlalchemy import delete, select, text

from app.config import get_settings
from app.db import Conversation, SessionLocal, engine, utcnow
from app.knowledge.base import kb
from app.runtime import runtime
from app.site import site_config

log = logging.getLogger(__name__)
settings = get_settings()
RETENTION_LOCK_KEY = 7731002


async def knowledge_refresher() -> None:
    """Index on startup if empty, then refresh on a schedule."""
    await asyncio.sleep(5)  # let the website come up first in a fresh deploy
    try:
        await kb.reload_if_changed()
        trigger = "startup" if not len(kb.index) else "schedule"
        await kb.refresh(trigger)
    except Exception:  # noqa: BLE001
        log.exception("Initial knowledge refresh failed")
    while True:
        await asyncio.sleep(max(5, settings.kb_refresh_minutes) * 60)
        try:
            await kb.refresh("schedule")
        except Exception:  # noqa: BLE001
            log.exception("Scheduled knowledge refresh failed")


async def index_reloader() -> None:
    """Workers that didn't run the crawl pick up the new index."""
    while True:
        await asyncio.sleep(60)
        try:
            await kb.reload_if_changed()
        except Exception:  # noqa: BLE001
            log.exception("Knowledge index reload failed")


async def purge_old_conversations() -> int:
    cfg = await site_config.get()
    cutoff = utcnow() - timedelta(days=cfg.retention_days)
    async with engine.connect() as raw_conn:
        lock_conn = await raw_conn.execution_options(isolation_level="AUTOCOMMIT")
        if not await lock_conn.scalar(text("SELECT pg_try_advisory_lock(:k)"), {"k": RETENTION_LOCK_KEY}):
            return 0
        try:
            async with SessionLocal() as db:
                ids = (await db.execute(select(Conversation.id).where(Conversation.updated_at < cutoff).limit(5000))).scalars().all()
                if ids:
                    await db.execute(delete(Conversation).where(Conversation.id.in_(ids)))
                    await db.commit()
            for thread_id in ids:
                await runtime.delete_thread(thread_id)
            if ids:
                log.info("Deleted %d conversations older than %d days", len(ids), cfg.retention_days)
            return len(ids)
        finally:
            await lock_conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": RETENTION_LOCK_KEY})


async def retention_cleaner() -> None:
    while True:
        try:
            await purge_old_conversations()
        except Exception:  # noqa: BLE001
            log.exception("Transcript retention cleanup failed")
        await asyncio.sleep(6 * 3600)
