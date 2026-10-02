"""
Visitor-facing chat API (served at /chat-api, same origin as the website).

POST /chat-api/chat streams Server-Sent Events:
  session  {"session_id"}                    first event; the widget stores it
  token    {"text"}                          incremental reply text
  replace  {"text"}                          guard replaced the streamed text
  sources  {"sources": [{url, title}]}       pages the answer is based on
  lead     {"status", ...}                   callback flow state (confirming/submitted)
  done     {"reply", "suggestions", "sources", "lead_stage"}
  error    {"message"}
"""

import asyncio
import json
import logging
import time
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from sqlalchemy import select, text

from app.backend_client import backend
from app.config import get_settings
from app.db import Conversation, Message, SessionLocal, engine, utcnow
from app.knowledge.base import kb
from app.runtime import runtime
from app.security import client_ip, enforce_rate_limits, ip_hash, new_session_id, session_lock_key, valid_session_id
from app.site import site_config

log = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/chat-api", tags=["Chat"])

TURN_TIMEOUT_SECONDS = 90


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str | None = Field(None, max_length=64)
    page_url: str | None = Field(None, max_length=500)


class ConfigResponse(BaseModel):
    enabled: bool
    greeting: str
    quick_prompts: list[str]
    phone: str


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.get("/config", response_model=ConfigResponse)
async def chat_config() -> ConfigResponse:
    cfg = await site_config.get()
    return ConfigResponse(enabled=cfg.enabled, greeting=cfg.greeting, quick_prompts=cfg.quick_prompts, phone=cfg.dispatch_phone)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> dict:
    """Restore a conversation in the widget (the session id is an unguessable secret)."""
    if not valid_session_id(session_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    async with SessionLocal() as db:
        convo = await db.get(Conversation, session_id)
        if not convo:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
        rows = (
            await db.execute(select(Message).where(Message.conversation_id == session_id).order_by(Message.id).limit(200))
        ).scalars().all()
    return {
        "session_id": session_id,
        "lead_stage": convo.lead_stage,
        "messages": [
            {"role": m.role, "content": m.content, "sources": m.sources or [], "suggestions": m.suggestions or [], "created_at": m.created_at.isoformat()}
            for m in rows
        ],
    }


async def _ensure_conversation(session_id: str, ip_digest: str, request: Request, page_url: str | None, first_message: str) -> None:
    async with SessionLocal() as db:
        convo = await db.get(Conversation, session_id)
        if convo is None:
            db.add(
                Conversation(
                    id=session_id,
                    ip_hash=ip_digest,
                    user_agent=(request.headers.get("user-agent") or "")[:300],
                    page_url=(page_url or "")[:500] or None,
                    title=first_message[:200],
                )
            )
            await db.commit()


async def _save_user_message(session_id: str, content: str, ip_digest: str) -> None:
    async with SessionLocal() as db:
        db.add(Message(conversation_id=session_id, role="user", content=content, ip_hash=ip_digest))
        await db.commit()


async def _save_turn(session_id: str, state: dict, latency_ms: int) -> None:
    async with SessionLocal() as db:
        db.add(
            Message(
                conversation_id=session_id,
                role="assistant",
                content=state.get("reply") or "",
                route=state.get("intent"),
                sources=state.get("sources") or [],
                suggestions=state.get("suggestions") or [],
                latency_ms=latency_ms,
                flagged=bool(state.get("flagged")),
            )
        )
        convo = await db.get(Conversation, session_id)
        if convo:
            convo.updated_at = utcnow()
            convo.message_count = (convo.message_count or 0) + 2
            convo.last_route = state.get("intent")
            convo.language = state.get("language") or convo.language
            convo.lead_stage = state.get("lead_stage") or convo.lead_stage
            convo.lead_id = state.get("lead_id") or convo.lead_id
            convo.handoff = bool(state.get("handoff")) or convo.handoff
            convo.flagged = bool(state.get("flagged")) or convo.flagged
        await db.commit()


@router.post("/chat")
async def chat(body: ChatRequest, request: Request) -> StreamingResponse:
    cfg = await site_config.get()
    if not cfg.enabled:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "The assistant is offline right now.")
    message = body.message.strip()
    if not message:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Message is empty.")
    if len(message) > settings.max_message_chars:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"Please keep messages under {settings.max_message_chars} characters.",
        )

    session_id = body.session_id if valid_session_id(body.session_id) else new_session_id()
    ip_digest = ip_hash(client_ip(request))
    await enforce_rate_limits(session_id, ip_digest)
    await _ensure_conversation(session_id, ip_digest, request, body.page_url, message)

    async def stream() -> AsyncIterator[str]:
        yield sse("session", {"session_id": session_id})
        started = time.monotonic()
        # One turn at a time per conversation, across workers.
        async with engine.connect() as raw_conn:
            # Autocommit: a session-level lock without an idle open transaction.
            lock_conn = await raw_conn.execution_options(isolation_level="AUTOCOMMIT")
            locked = await lock_conn.scalar(text("SELECT pg_try_advisory_lock(:k)"), {"k": session_lock_key(session_id)})
            if not locked:
                yield sse("error", {"message": "Still working on your previous message. One moment please."})
                return
            try:
                await _save_user_message(session_id, message, ip_digest)
                config = {
                    "configurable": {
                        "thread_id": session_id,
                        "session_id": session_id,
                        "site": cfg,
                        "llm": request.app.state.llm,
                        "kb": kb,
                        "leads": backend,
                    },
                    "recursion_limit": 12,
                }
                final: dict = {}
                async with asyncio.timeout(TURN_TIMEOUT_SECONDS):
                    async for mode, chunk in runtime.graph.astream(
                        {"messages": [HumanMessage(content=message)]},
                        config=config,
                        stream_mode=["custom", "values"],
                    ):
                        if mode == "custom" and isinstance(chunk, dict):
                            kind = chunk.get("type", "token")
                            yield sse(kind, {k: v for k, v in chunk.items() if k != "type"})
                        elif mode == "values":
                            final = chunk
                latency = int((time.monotonic() - started) * 1000)
                await _save_turn(session_id, final, latency)
                yield sse(
                    "done",
                    {
                        "reply": final.get("reply", ""),
                        "suggestions": final.get("suggestions") or [],
                        "sources": final.get("sources") or [],
                        "lead_stage": final.get("lead_stage") or "none",
                    },
                )
            except TimeoutError:
                log.error("Turn timed out for %s", session_id)
                yield sse("error", {"message": f"Sorry, that took too long. Please try again or call dispatch at {cfg.dispatch_phone}."})
            except Exception:  # noqa: BLE001 - the visitor gets a clean message, we get the trace
                log.exception("Chat turn failed for %s", session_id)
                yield sse("error", {"message": f"Sorry, something went wrong. Please try again or call dispatch at {cfg.dispatch_phone}."})
            finally:
                await lock_conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": session_lock_key(session_id)})

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            # nginx: pass tokens through immediately instead of buffering.
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "knowledge_chunks": len(kb.index)}
