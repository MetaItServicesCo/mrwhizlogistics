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
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import BaseModel, Field
from datetime import timedelta

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.backend_client import backend
from app.config import get_settings
from app.db import Conversation, Message, ProactiveStat, SessionLocal, engine, utcnow
from app.knowledge.base import kb
from app.runtime import runtime
from app.agent.llm import FakeLLM
from app.security import client_ip, enforce_rate_limits, ip_hash, is_load_test, new_session_id, session_lock_key, valid_session_id
from app.site import PROACTIVE_SUGGESTIONS, site_config

log = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/chat-api", tags=["Chat"])

TURN_TIMEOUT_SECONDS = 90
_LOAD_TEST_LLM = FakeLLM()


class _NoLeads:
    """Load-test traffic never reaches Quote Requests or dispatch email."""

    async def create_lead(self, lead: dict, session_id: str) -> int:
        return 0

    async def update_lead(self, lead_id: int, lead: dict) -> None:
        return None


_NO_LEADS = _NoLeads()
# Strong references keep in-flight turns alive after a client disconnects.
_running_turns: set[asyncio.Task] = set()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str | None = Field(None, max_length=64)
    page_url: str | None = Field(None, max_length=500)


class ProactiveSettings(BaseModel):
    enabled: bool
    delay_seconds: int
    mode: str


class ConfigResponse(BaseModel):
    enabled: bool
    greeting: str
    quick_prompts: list[str]
    phone: str
    proactive: ProactiveSettings
    voice_enabled: bool


class InviteRequest(BaseModel):
    page_url: str | None = Field(None, max_length=500)


class InviteResponse(BaseModel):
    message: str
    suggestions: list[str]


class ProactiveStartResponse(InviteResponse):
    session_id: str


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.get("/config", response_model=ConfigResponse)
async def chat_config() -> ConfigResponse:
    cfg = await site_config.get()
    return ConfigResponse(
        enabled=cfg.enabled,
        greeting=cfg.greeting,
        quick_prompts=cfg.quick_prompts,
        phone=cfg.dispatch_phone,
        proactive=ProactiveSettings(enabled=cfg.proactive.enabled, delay_seconds=cfg.proactive.delay_seconds, mode=cfg.proactive.mode),
        voice_enabled=cfg.voice.enabled,
    )


async def _proactive_config():
    cfg = await site_config.get()
    if not (cfg.enabled and cfg.proactive.enabled):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Proactive invites are off.")
    return cfg


@router.post("/proactive/invite", response_model=InviteResponse)
async def proactive_invite(body: InviteRequest, request: Request) -> InviteResponse:
    """The invite text for the visitor's page; counts one impression."""
    cfg = await _proactive_config()
    if is_load_test(request):
        return InviteResponse(message=cfg.proactive.message_for(body.page_url), suggestions=PROACTIVE_SUGGESTIONS)
    today = utcnow().date()
    async with SessionLocal() as db:
        stmt = pg_insert(ProactiveStat).values(day=today, shown=1)
        await db.execute(stmt.on_conflict_do_update(index_elements=[ProactiveStat.day], set_={"shown": ProactiveStat.shown + 1}))
        await db.commit()
    return InviteResponse(message=cfg.proactive.message_for(body.page_url), suggestions=PROACTIVE_SUGGESTIONS)


@router.post("/proactive/start", response_model=ProactiveStartResponse)
async def proactive_start(body: InviteRequest, request: Request) -> ProactiveStartResponse:
    """The visitor engaged with the invite: open a conversation already in the lead flow."""
    cfg = await _proactive_config()
    load_test = is_load_test(request)
    ip_digest = ip_hash(client_ip(request))
    async with SessionLocal() as db:
        recent = 0 if load_test else await db.scalar(
            select(func.count(Conversation.id)).where(
                Conversation.ip_hash == ip_digest,
                Conversation.proactive.is_(True),
                Conversation.created_at > utcnow() - timedelta(minutes=10),
            )
        )
    # Generous: offices and mobile carriers share one IP across many visitors.
    if (recent or 0) >= 30:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many chats started. Please wait a moment.")

    session_id = new_session_id()
    message = cfg.proactive.message_for(body.page_url)
    # Seed the agent: the invite is the assistant's first turn and already
    # asked what they're moving, so the conversation starts in discovery.
    await runtime.graph.aupdate_state(
        {"configurable": {"thread_id": session_id}},
        {
            "messages": [AIMessage(content=message)],
            "lead_stage": "discovery",
            "lead": {},
            "handoff": False,
            "discovery_turns": 1,
            "contact_asks": 0,
            "intent": "lead",
            "reply": message,
        },
        as_node="finalize",
    )
    async with SessionLocal() as db:
        db.add(
            Conversation(
                id=session_id,
                ip_hash=ip_digest,
                user_agent=(request.headers.get("user-agent") or "")[:300],
                page_url=(body.page_url or "")[:500] or None,
                title="(proactive invite)",
                message_count=1,
                last_route="lead",
                lead_stage="discovery",
                proactive=True,
                load_test=load_test,
            )
        )
        await db.flush()
        db.add(Message(conversation_id=session_id, role="assistant", content=message, route="lead", suggestions=PROACTIVE_SUGGESTIONS))
        await db.commit()
    return ProactiveStartResponse(session_id=session_id, message=message, suggestions=PROACTIVE_SUGGESTIONS)


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


async def _ensure_conversation(session_id: str, ip_digest: str, request: Request, page_url: str | None, first_message: str, load_test: bool = False) -> None:
    async with SessionLocal() as db:
        convo = await db.get(Conversation, session_id)
        if convo is not None and convo.proactive and convo.title == "(proactive invite)":
            convo.title = first_message[:200]
            await db.commit()
        if convo is None:
            db.add(
                Conversation(
                    id=session_id,
                    ip_hash=ip_digest,
                    user_agent=(request.headers.get("user-agent") or "")[:300],
                    page_url=(page_url or "")[:500] or None,
                    title=first_message[:200],
                    load_test=load_test,
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
    load_test = is_load_test(request)
    if not load_test:
        await enforce_rate_limits(session_id, ip_digest)
    await _ensure_conversation(session_id, ip_digest, request, body.page_url, message, load_test)

    config = {
        "configurable": {
            "thread_id": session_id,
            "session_id": session_id,
            "site": cfg,
            # Load tests exercise the full stack except Groq and lead delivery.
            "llm": _LOAD_TEST_LLM if load_test else request.app.state.llm,
            "kb": kb,
            "leads": _NO_LEADS if load_test else backend,
        },
        "recursion_limit": 12,
    }
    # The turn runs as its own task and the response only relays its events:
    # if the visitor closes the tab mid-reply, the turn still finishes and is
    # saved (e.g. right after a lead was sent to dispatch).
    events: asyncio.Queue[str | None] = asyncio.Queue()

    async def run_turn() -> None:
        started = time.monotonic()
        try:
            # One turn at a time per conversation, across workers.
            async with engine.connect() as raw_conn:
                # Autocommit: a session-level lock without an idle open transaction.
                lock_conn = await raw_conn.execution_options(isolation_level="AUTOCOMMIT")
                locked = await lock_conn.scalar(text("SELECT pg_try_advisory_lock(:k)"), {"k": session_lock_key(session_id)})
                if not locked:
                    await events.put(sse("error", {"message": "Still working on your previous message. One moment please."}))
                    return
                try:
                    await _save_user_message(session_id, message, ip_digest)
                    final: dict = {}
                    async with asyncio.timeout(TURN_TIMEOUT_SECONDS):
                        async for mode, chunk in runtime.graph.astream(
                            {"messages": [HumanMessage(content=message)]},
                            config=config,
                            stream_mode=["custom", "values"],
                        ):
                            if mode == "custom" and isinstance(chunk, dict):
                                kind = chunk.get("type", "token")
                                await events.put(sse(kind, {k: v for k, v in chunk.items() if k != "type"}))
                            elif mode == "values":
                                final = chunk
                    latency = int((time.monotonic() - started) * 1000)
                    await _save_turn(session_id, final, latency)
                    await events.put(
                        sse(
                            "done",
                            {
                                "reply": final.get("reply", ""),
                                "suggestions": final.get("suggestions") or [],
                                "sources": final.get("sources") or [],
                                "lead_stage": final.get("lead_stage") or "none",
                            },
                        )
                    )
                except TimeoutError:
                    log.error("Turn timed out for %s", session_id)
                    await events.put(sse("error", {"message": f"Sorry, that took too long. Please try again or call dispatch at {cfg.dispatch_phone}."}))
                except Exception:  # noqa: BLE001 - the visitor gets a clean message, we get the trace
                    log.exception("Chat turn failed for %s", session_id)
                    await events.put(sse("error", {"message": f"Sorry, something went wrong. Please try again or call dispatch at {cfg.dispatch_phone}."}))
                finally:
                    await lock_conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": session_lock_key(session_id)})
        finally:
            await events.put(None)

    task = asyncio.create_task(run_turn())
    _running_turns.add(task)
    task.add_done_callback(_running_turns.discard)

    async def stream() -> AsyncIterator[str]:
        yield sse("session", {"session_id": session_id})
        while (item := await events.get()) is not None:
            yield item

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


@router.post("/loadtest/purge")
async def purge_load_test(request: Request) -> dict:
    """Delete all load-test conversations and their agent state."""
    if not is_load_test(request):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    async with SessionLocal() as db:
        ids = (await db.execute(select(Conversation.id).where(Conversation.load_test.is_(True)))).scalars().all()
        for start in range(0, len(ids), 1000):
            batch = ids[start : start + 1000]
            await db.execute(Conversation.__table__.delete().where(Conversation.id.in_(batch)))
        await db.commit()
    for thread_id in ids:
        await runtime.delete_thread(thread_id)
    return {"deleted": len(ids)}
