"""
Knowledge base lifecycle: crawl the live site, index what changed, serve
searches.

- Crawl: sitemap.xml lists every public page (it already excludes drafts),
  each page's <main> is extracted and split into chunks.
- Incremental: a page is re-embedded only when its text hash changed; pages
  that left the sitemap are removed. A full run on an unchanged site costs
  one HTTP fetch per page and no embedding work.
- Also indexed: company facts (phone, hours...) and the "always know" facts
  from Dashboard -> Chatbot.
- One crawler at a time across workers (Postgres advisory lock); every worker
  reloads its in-memory index when a new run finishes.
"""

import asyncio
import logging
import time
from urllib.parse import urlparse

import httpx
import numpy as np
from sqlalchemy import delete, func, select, text

from app.config import get_settings
from app.db import KbChunk, KbPage, KbRun, SessionLocal, engine, utcnow
from app.knowledge.embeddings import get_embedder
from app.knowledge.extract import Chunk, ExtractedPage, Section, chunk_page, extract_page, parse_sitemap
from app.knowledge.retriever import HybridIndex, Hit, IndexedChunk
from app.site import site_config

log = logging.getLogger(__name__)
settings = get_settings()

CRAWL_LOCK_KEY = 7731001
COMPANY_URL = "kb://company"
FACTS_URL = "kb://facts"
USER_AGENT = "MrWhizAssistantIndexer/1.0"


def public_link(url: str) -> str | None:
    """Visitor-facing link for a stored page path; None for synthetic pages."""
    if not url.startswith("/"):
        return None
    return settings.site_public_url.rstrip("/") + url


def _path_of(url: str) -> str:
    parsed = urlparse(url)
    return (parsed.path or "/") + (f"?{parsed.query}" if parsed.query else "")


class KnowledgeBase:
    def __init__(self) -> None:
        self.index = HybridIndex([], np.zeros((0, 1)))
        self._reload_lock = asyncio.Lock()
        self.last_error: str | None = None

    # ------------------------------------------------------------------ search
    async def search(self, query: str, k: int | None = None) -> list[Hit]:
        if not len(self.index):
            return []
        embedder = await get_embedder()
        vec = await asyncio.to_thread(embedder.embed_query, query)
        return self.index.search(vec, query, k or settings.kb_top_k)

    # ------------------------------------------------------------------ loading
    async def current_version(self) -> str:
        async with SessionLocal() as db:
            run_id = await db.scalar(select(func.max(KbRun.id)).where(KbRun.status == "ok"))
            count = await db.scalar(select(func.count(KbChunk.id)))
        return f"{run_id or 0}:{count or 0}"

    async def reload_if_changed(self) -> bool:
        version = await self.current_version()
        if version == self.index.version:
            return False
        async with self._reload_lock:
            if version == self.index.version:
                return False
            async with SessionLocal() as db:
                rows = (await db.execute(select(KbChunk).order_by(KbChunk.id))).scalars().all()
            chunks = [IndexedChunk(r.id, r.url, r.title or "", r.heading or "", r.content) for r in rows]
            embeddings = np.array([r.embedding for r in rows], dtype=np.float32) if rows else np.zeros((0, 1))
            self.index = await asyncio.to_thread(HybridIndex, chunks, embeddings, version)
            log.info("Knowledge index loaded: %d chunks (version %s)", len(chunks), version)
            return True

    # ------------------------------------------------------------------ crawling
    async def _fetch_pages(self, client: httpx.AsyncClient) -> tuple[dict[str, ExtractedPage], dict[str, str]]:
        resp = await client.get("/sitemap.xml")
        resp.raise_for_status()
        paths = list(dict.fromkeys(_path_of(u) for u in parse_sitemap(resp.text)))[: settings.kb_max_pages]
        pages: dict[str, ExtractedPage] = {}
        failures: dict[str, str] = {}
        sem = asyncio.Semaphore(4)

        async def fetch(path: str) -> None:
            async with sem:
                try:
                    r = await client.get(path)
                    if r.status_code != 200 or "text/html" not in r.headers.get("content-type", ""):
                        failures[path] = f"HTTP {r.status_code}"
                        return
                    page = await asyncio.to_thread(extract_page, r.text)
                    if page.sections:
                        pages[path] = page
                    else:
                        failures[path] = "No readable content"
                except httpx.HTTPError as exc:
                    failures[path] = str(exc)[:300]

        await asyncio.gather(*(fetch(p) for p in paths))
        return pages, failures

    async def _synthetic_pages(self) -> dict[str, ExtractedPage]:
        cfg = await site_config.get()
        pages = {
            COMPANY_URL: ExtractedPage(
                title="Company information",
                sections=[Section(heading="Contact details", text=cfg.company_facts())],
            )
        }
        if cfg.facts:
            pages[FACTS_URL] = ExtractedPage(
                title="Assistant facts",
                sections=[Section(heading="Facts", text="\n".join(cfg.facts))],
            )
        return pages

    async def refresh(self, trigger: str = "schedule") -> dict:
        """Crawl and index changes. Returns the run summary (or {"skipped": True})."""
        async with engine.connect() as raw_conn:
            lock_conn = await raw_conn.execution_options(isolation_level="AUTOCOMMIT")
            got = await lock_conn.scalar(text("SELECT pg_try_advisory_lock(:k)"), {"k": CRAWL_LOCK_KEY})
            if not got:
                return {"skipped": True, "reason": "Another indexing run is in progress."}
            try:
                return await self._refresh_locked(trigger)
            finally:
                await lock_conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": CRAWL_LOCK_KEY})

    async def _refresh_locked(self, trigger: str) -> dict:
        started = time.monotonic()
        async with SessionLocal() as db:
            run = KbRun(trigger=trigger)
            db.add(run)
            await db.commit()
            run_id = run.id
        summary = {"run_id": run_id, "pages_total": 0, "pages_changed": 0, "pages_failed": 0, "chunks_total": 0}
        try:
            async with httpx.AsyncClient(
                base_url=settings.site_internal_url,
                timeout=20,
                follow_redirects=True,
                headers={"User-Agent": USER_AGENT},
            ) as client:
                pages, failures = await self._fetch_pages(client)
            pages.update(await self._synthetic_pages())
            summary["pages_total"] = len(pages)
            summary["pages_failed"] = len(failures)

            async with SessionLocal() as db:
                existing = {p.url: p for p in (await db.execute(select(KbPage))).scalars().all()}

            changed = {url: page for url, page in pages.items() if existing.get(url) is None or existing[url].page_hash != page.content_hash or existing[url].status != "ok"}
            embedder = await get_embedder()
            for url, page in changed.items():
                chunks: list[Chunk] = chunk_page(page, settings.kb_chunk_chars, settings.kb_chunk_overlap)
                vectors = await asyncio.to_thread(embedder.embed_documents, [c.content for c in chunks])
                async with SessionLocal() as db:
                    row = await db.get(KbPage, url)
                    if row is None:
                        row = KbPage(url=url)
                        db.add(row)
                    row.title = page.title[:300]
                    row.page_hash = page.content_hash
                    row.chunk_count = len(chunks)
                    row.status = "ok"
                    row.error = None
                    row.fetched_at = utcnow()
                    await db.flush()
                    await db.execute(delete(KbChunk).where(KbChunk.url == url))
                    db.add_all(
                        KbChunk(url=url, title=c.title[:300], heading=c.heading[:300], content=c.content, embedding=v.tolist())
                        for c, v in zip(chunks, vectors)
                    )
                    await db.commit()
            summary["pages_changed"] = len(changed)

            async with SessionLocal() as db:
                # Pages that left the sitemap (unpublished/deleted) leave the index.
                # A page that failed to fetch this time keeps its old chunks.
                gone = [url for url in existing if url not in pages and url not in failures]
                if gone:
                    await db.execute(delete(KbPage).where(KbPage.url.in_(gone)))
                for url, error in failures.items():
                    row = await db.get(KbPage, url)
                    if row is None:
                        db.add(KbPage(url=url, status="error", error=error[:500], chunk_count=0, fetched_at=utcnow()))
                    else:
                        row.error = error[:500]
                await db.commit()
                summary["chunks_total"] = await db.scalar(select(func.count(KbChunk.id))) or 0
                run = await db.get(KbRun, run_id)
                run.status = "ok"
                run.finished_at = utcnow()
                run.duration_s = round(time.monotonic() - started, 2)
                for key in ("pages_total", "pages_changed", "pages_failed", "chunks_total"):
                    setattr(run, key, summary[key])
                await db.commit()
            self.last_error = None
            log.info("Knowledge refresh (%s): %s", trigger, summary)
        except Exception as exc:  # noqa: BLE001 - record and keep the previous index
            log.exception("Knowledge refresh failed")
            self.last_error = str(exc)[:1000]
            async with SessionLocal() as db:
                run = await db.get(KbRun, run_id)
                run.status = "error"
                run.error = self.last_error
                run.finished_at = utcnow()
                run.duration_s = round(time.monotonic() - started, 2)
                await db.commit()
            summary["error"] = self.last_error
        await self.reload_if_changed()
        return summary


kb = KnowledgeBase()
