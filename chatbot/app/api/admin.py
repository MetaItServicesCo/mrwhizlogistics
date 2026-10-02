"""Dashboard API (admin JWT from the main backend): conversations, analytics, knowledge."""

from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import Integer, cast, delete, func, or_, select

from app.db import Conversation, KbChunk, KbPage, KbRun, Message, SessionLocal, utcnow
from app.knowledge.base import kb, public_link
from app.runtime import runtime
from app.security import require_admin, valid_session_id
from app.site import site_config

router = APIRouter(prefix="/chat-api/admin", tags=["Chat admin"], dependencies=[Depends(require_admin)])


def _conversation_row(c: Conversation) -> dict:
    return {
        "id": c.id,
        "created_at": c.created_at.isoformat(),
        "updated_at": c.updated_at.isoformat(),
        "title": c.title,
        "message_count": c.message_count,
        "language": c.language,
        "page_url": c.page_url,
        "last_route": c.last_route,
        "lead_stage": c.lead_stage,
        "lead_id": c.lead_id,
        "handoff": c.handoff,
        "flagged": c.flagged,
    }


@router.get("/conversations")
async def list_conversations(
    filter: str = Query("all", pattern="^(all|leads|handoff|flagged)$"),
    q: str | None = Query(None, max_length=100),
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
) -> dict:
    query = select(Conversation)
    if filter == "leads":
        query = query.where(Conversation.lead_id.is_not(None))
    elif filter == "handoff":
        query = query.where(Conversation.handoff.is_(True))
    elif filter == "flagged":
        query = query.where(Conversation.flagged.is_(True))
    if q:
        like = f"%{q.strip()}%"
        matching = select(Message.conversation_id).where(Message.content.ilike(like))
        query = query.where(or_(Conversation.title.ilike(like), Conversation.id.in_(matching)))
    async with SessionLocal() as db:
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        rows = (
            await db.execute(query.order_by(Conversation.updated_at.desc()).offset((page - 1) * size).limit(size))
        ).scalars().all()
    return {"items": [_conversation_row(c) for c in rows], "total": total or 0, "page": page, "size": size}


@router.get("/conversations/{session_id}")
async def get_conversation(session_id: str) -> dict:
    async with SessionLocal() as db:
        convo = await db.get(Conversation, session_id)
        if not convo:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
        messages = (
            await db.execute(select(Message).where(Message.conversation_id == session_id).order_by(Message.id))
        ).scalars().all()
    return _conversation_row(convo) | {
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "route": m.route,
                "sources": m.sources or [],
                "latency_ms": m.latency_ms,
                "flagged": m.flagged,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }


@router.delete("/conversations/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(session_id: str) -> None:
    if not valid_session_id(session_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    async with SessionLocal() as db:
        await db.execute(delete(Conversation).where(Conversation.id == session_id))
        await db.commit()
    await runtime.delete_thread(session_id)


@router.get("/stats")
async def stats(days: int = Query(30, ge=1, le=365)) -> dict:
    since = utcnow() - timedelta(days=days)
    async with SessionLocal() as db:
        convos = select(Conversation).where(Conversation.created_at >= since).subquery()
        totals = (
            await db.execute(
                select(
                    func.count(),
                    func.coalesce(func.sum(cast(convos.c.lead_id.is_not(None), Integer)), 0),
                    func.coalesce(func.sum(cast(convos.c.handoff, Integer)), 0),
                    func.coalesce(func.sum(cast(convos.c.flagged, Integer)), 0),
                    func.coalesce(func.sum(convos.c.message_count), 0),
                )
            )
        ).one()
        latency = await db.scalar(
            select(func.percentile_cont(0.5).within_group(Message.latency_ms)).where(
                Message.role == "assistant", Message.created_at >= since, Message.latency_ms.is_not(None)
            )
        )
        routes = (
            await db.execute(
                select(Message.route, func.count())
                .where(Message.role == "assistant", Message.created_at >= since)
                .group_by(Message.route)
            )
        ).all()
        day = func.date_trunc("day", Conversation.created_at)
        daily = (
            await db.execute(
                select(day, func.count(), func.coalesce(func.sum(cast(Conversation.lead_id.is_not(None), Integer)), 0))
                .where(Conversation.created_at >= since)
                .group_by(day)
                .order_by(day)
            )
        ).all()
        # Questions the assistant couldn't answer from the site: content gaps.
        unanswered = (
            await db.execute(
                select(Message.conversation_id, Message.content, Message.created_at)
                .where(
                    Message.role == "assistant",
                    Message.route == "knowledge",
                    Message.created_at >= since,
                    Message.sources == [],
                )
                .order_by(Message.created_at.desc())
                .limit(15)
            )
        ).all()
        questions = []
        for convo_id, _answer, created in unanswered:
            question = await db.scalar(
                select(Message.content)
                .where(Message.conversation_id == convo_id, Message.role == "user", Message.created_at <= created)
                .order_by(Message.id.desc())
                .limit(1)
            )
            if question:
                questions.append({"conversation_id": convo_id, "question": question, "created_at": created.isoformat()})
    conversations, leads, handoffs, flagged, messages = (int(v or 0) for v in totals)
    return {
        "days": days,
        "conversations": conversations,
        "leads": leads,
        "conversion_rate": round(leads / conversations, 4) if conversations else 0,
        "handoffs": handoffs,
        "flagged": flagged,
        "messages": messages,
        "median_latency_ms": int(latency) if latency is not None else None,
        "routes": {r or "unknown": int(n) for r, n in routes},
        "daily": [{"date": d.date().isoformat(), "conversations": int(c), "leads": int(l)} for d, c, l in daily],
        "unanswered": questions,
    }


@router.get("/knowledge")
async def knowledge_status() -> dict:
    async with SessionLocal() as db:
        pages = (await db.execute(select(KbPage).order_by(KbPage.url))).scalars().all()
        runs = (await db.execute(select(KbRun).order_by(KbRun.id.desc()).limit(10))).scalars().all()
        chunks = await db.scalar(select(func.count(KbChunk.id)))
    return {
        "chunks": chunks or 0,
        "loaded_chunks": len(kb.index),
        "pages": [
            {
                "url": p.url,
                "link": public_link(p.url),
                "title": p.title,
                "status": p.status if not p.error else ("error" if p.chunk_count == 0 else "stale"),
                "error": p.error,
                "chunk_count": p.chunk_count,
                "fetched_at": p.fetched_at.isoformat() if p.fetched_at else None,
            }
            for p in pages
        ],
        "runs": [
            {
                "id": r.id,
                "trigger": r.trigger,
                "status": r.status,
                "started_at": r.started_at.isoformat(),
                "finished_at": r.finished_at.isoformat() if r.finished_at else None,
                "pages_total": r.pages_total,
                "pages_changed": r.pages_changed,
                "pages_failed": r.pages_failed,
                "chunks_total": r.chunks_total,
                "duration_s": r.duration_s,
                "error": r.error,
            }
            for r in runs
        ],
    }


@router.post("/knowledge/reindex", status_code=status.HTTP_202_ACCEPTED)
async def reindex(background: BackgroundTasks) -> dict:
    # Settings (facts, company details) may have just changed in the dashboard.
    site_config.invalidate()
    background.add_task(kb.refresh, "manual")
    return {"status": "started"}


@router.get("/knowledge/search")
async def search_preview(q: str = Query(..., min_length=2, max_length=200)) -> dict:
    """What the assistant would retrieve for a question (for checking content coverage)."""
    hits = await kb.search(q)
    return {
        "query": q,
        "hits": [
            {"url": public_link(h.chunk.url) or h.chunk.url, "title": h.chunk.title, "heading": h.chunk.heading, "content": h.chunk.content[:600], "similarity": round(h.dense, 3)}
            for h in hits
        ],
    }
