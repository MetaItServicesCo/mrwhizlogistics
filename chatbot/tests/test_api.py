"""
HTTP + Postgres integration: SSE streaming, persistence, session restore,
limits, the Postgres checkpointer and the admin API. Runs against the local
database in an isolated "chatbot_test" schema (dropped before the run).
Skipped automatically when no database is reachable.
"""

import json
import uuid

import httpx
import pytest
from jose import jwt
from sqlalchemy import select, text

from app import site as site_module
from app.api import chat as chat_api
from app.config import get_settings
from app.db import engine
from app.knowledge.base import kb
from app.main import app
from tests.conftest import FakeKB, FakeLeads

settings = get_settings()
pytestmark = pytest.mark.asyncio(loop_scope="session")


def parse_sse(body: str) -> list[tuple[str, dict]]:
    events = []
    for block in body.strip().split("\n\n"):
        lines = dict(line.split(": ", 1) for line in block.splitlines() if ": " in line)
        if "event" in lines:
            events.append((lines["event"], json.loads(lines.get("data", "{}"))))
    return events


@pytest.fixture(scope="session")
async def client():
    try:
        async with engine.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA IF EXISTS "{settings.db_schema}" CASCADE'))
    except Exception as exc:  # noqa: BLE001
        pytest.skip(f"Postgres not reachable: {exc}")
    async with app.router.lifespan_context(app):
        kb.index = FakeKB().index
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
            yield c


@pytest.fixture(autouse=True)
def offline_backend(monkeypatch, site):
    """No real backend: fixed site config and a recording lead client."""
    leads = FakeLeads()

    async def fake_get():
        return site

    monkeypatch.setattr(site_module.site_config, "get", fake_get)
    monkeypatch.setattr(chat_api, "backend", leads)
    return leads


async def send(client, message: str, session_id: str | None = None) -> tuple[str, list[tuple[str, dict]]]:
    resp = await client.post("/chat-api/chat", json={"message": message, "session_id": session_id, "page_url": "/hot-shot"})
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"].startswith("text/event-stream")
    assert resp.headers["x-accel-buffering"] == "no"
    events = parse_sse(resp.text)
    sid = events[0][1]["session_id"]
    return sid, events


async def test_config(client):
    resp = await client.get("/chat-api/config")
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is True and body["quick_prompts"] and body["phone"] == "(469) 767 8853"


async def test_chat_streams_and_persists(client):
    sid, events = await send(client, "Do you have reefer trailers for temperature-controlled loads?")
    kinds = [k for k, _ in events]
    assert kinds[0] == "session" and kinds[-1] == "done"
    assert "token" in kinds and "sources" in kinds
    done = events[-1][1]
    assert "reefer" in done["reply"].lower()
    assert "".join(d["text"] for k, d in events if k == "token").strip() == done["reply"]

    restored = (await client.get(f"/chat-api/sessions/{sid}")).json()
    assert [m["role"] for m in restored["messages"]] == ["user", "assistant"]
    assert restored["messages"][1]["sources"][0]["url"].endswith("/semi-truck")


async def test_lead_flow_over_http_uses_checkpointer(client, offline_backend):
    sid, _ = await send(client, "I need a quote, my name is Dana White")
    _, events = await send(client, "469 767 2211", sid)
    assert events[-1][1]["lead_stage"] == "confirming"
    assert any(k == "lead" and d["status"] == "confirming" for k, d in events)
    _, events = await send(client, "yes", sid)
    assert events[-1][1]["lead_stage"] == "submitted"
    assert len(offline_backend.created) == 1 and offline_backend.created[0][1] == sid
    restored = (await client.get(f"/chat-api/sessions/{sid}")).json()
    assert restored["lead_stage"] == "submitted" and len(restored["messages"]) == 6


async def test_unknown_or_malformed_session_starts_new(client):
    sid, _ = await send(client, "hello", "not-a-valid-id")
    assert len(sid) == 32 and sid != "not-a-valid-id"
    assert (await client.get("/chat-api/sessions/../etc")).status_code == 404
    assert (await client.get(f"/chat-api/sessions/{uuid.uuid4().hex}")).status_code == 404


async def test_message_limits(client, monkeypatch):
    resp = await client.post("/chat-api/chat", json={"message": "x" * (settings.max_message_chars + 1)})
    assert resp.status_code == 413
    resp = await client.post("/chat-api/chat", json={"message": "   "})
    assert resp.status_code == 422

    monkeypatch.setattr(settings, "session_messages_per_minute", 2)
    sid, _ = await send(client, "hello")
    await send(client, "thanks", sid)
    resp = await client.post("/chat-api/chat", json={"message": "again", "session_id": sid})
    assert resp.status_code == 429


async def test_disabled_assistant(client, monkeypatch, site):
    site.enabled = False
    resp = await client.post("/chat-api/chat", json={"message": "hello"})
    assert resp.status_code == 503


async def _admin_token() -> str | None:
    async with engine.connect() as conn:
        try:
            user_id = await conn.scalar(text("SELECT id FROM public.users WHERE is_active LIMIT 1"))
        except Exception:  # noqa: BLE001
            return None
    if user_id is None:
        return None
    return jwt.encode({"sub": str(user_id)}, settings.secret_key, algorithm=settings.algorithm)


async def test_admin_api(client):
    assert (await client.get("/chat-api/admin/conversations")).status_code == 401
    bad = jwt.encode({"sub": "1"}, "wrong-key", algorithm="HS256")
    assert (await client.get("/chat-api/admin/conversations", headers={"Authorization": f"Bearer {bad}"})).status_code == 401

    token = await _admin_token()
    if not token:
        pytest.skip("No active user in public.users to sign a dashboard token for")
    auth = {"Authorization": f"Bearer {token}"}

    sid, _ = await send(client, "Call me back, my name is Lee Park, 469 767 2211")
    await send(client, "yes", sid)

    listing = (await client.get("/chat-api/admin/conversations", headers=auth)).json()
    assert listing["total"] >= 1
    leads_only = (await client.get("/chat-api/admin/conversations?filter=leads", headers=auth)).json()
    assert any(c["id"] == sid for c in leads_only["items"])
    found = (await client.get("/chat-api/admin/conversations?q=Lee%20Park", headers=auth)).json()
    assert [c["id"] for c in found["items"]] == [sid]

    detail = (await client.get(f"/chat-api/admin/conversations/{sid}", headers=auth)).json()
    assert detail["lead_id"] == 101 and len(detail["messages"]) == 4
    assert detail["messages"][1]["latency_ms"] is not None

    stats = (await client.get("/chat-api/admin/stats?days=7", headers=auth)).json()
    assert stats["conversations"] >= 1 and stats["leads"] >= 1 and 0 < stats["conversion_rate"] <= 1
    assert stats["routes"].get("lead", 0) >= 1 and stats["daily"]

    knowledge = (await client.get("/chat-api/admin/knowledge", headers=auth)).json()
    assert "pages" in knowledge and "runs" in knowledge
    preview = (await client.get("/chat-api/admin/knowledge/search?q=reefer%20trailers", headers=auth)).json()
    assert preview["hits"][0]["url"].endswith("/semi-truck")

    assert (await client.delete(f"/chat-api/admin/conversations/{sid}", headers=auth)).status_code == 204
    assert (await client.get(f"/chat-api/admin/conversations/{sid}", headers=auth)).status_code == 404


async def test_proactive_invite_start_and_reply(client, offline_backend):
    resp = await client.post("/chat-api/proactive/invite", json={"page_url": "/hot-shot/20-feet-flat-bed"})
    assert resp.status_code == 200
    invite = resp.json()
    assert "hot shot truck" in invite["message"] and invite["suggestions"] == ["I have a load to move", "Just browsing"]
    assert "number" not in invite["message"].lower()  # opens a conversation, doesn't ask for details

    start = (await client.post("/chat-api/proactive/start", json={"page_url": "/hot-shot/20-feet-flat-bed"})).json()
    sid = start["session_id"]
    assert start["message"] == invite["message"]
    restored = (await client.get(f"/chat-api/sessions/{sid}")).json()
    assert restored["lead_stage"] == "discovery" and [m["role"] for m in restored["messages"]] == ["assistant"]

    _, events = await send(client, "Lena Brooks 469 767 2211", sid)
    assert events[-1][1]["lead_stage"] == "confirming"
    _, events = await send(client, "yes", sid)
    assert events[-1][1]["lead_stage"] == "submitted" and len(offline_backend.created) == 1


async def test_proactive_decline(client):
    sid = (await client.post("/chat-api/proactive/start", json={"page_url": "/"})).json()["session_id"]
    _, events = await send(client, "Just browsing", sid)
    assert events[-1][1]["lead_stage"] == "none"


async def test_proactive_disabled(client, site):
    site.proactive.enabled = False
    assert (await client.post("/chat-api/proactive/invite", json={})).status_code == 404
    assert (await client.post("/chat-api/proactive/start", json={})).status_code == 404
    config = (await client.get("/chat-api/config")).json()
    assert config["proactive"]["enabled"] is False


async def test_status_and_proactive_stats(client):
    token = await _admin_token()
    if not token:
        pytest.skip("No active user in public.users to sign a dashboard token for")
    auth = {"Authorization": f"Bearer {token}"}
    status_body = (await client.get("/chat-api/admin/status", headers=auth)).json()
    assert status_body["model"]["reachable"] is True and status_body["model"]["provider"] == "fake"
    stats = (await client.get("/chat-api/admin/stats?days=7", headers=auth)).json()
    assert stats["proactive"]["shown"] >= 1 and stats["proactive"]["opened"] >= 2 and stats["proactive"]["leads"] >= 1
    proactive_only = (await client.get("/chat-api/admin/conversations?filter=proactive", headers=auth)).json()
    assert proactive_only["items"] and all(c["proactive"] for c in proactive_only["items"])


async def test_load_test_mode_is_isolated(client, offline_backend, monkeypatch):
    from app.api import chat as chat_mod

    monkeypatch.setattr(settings, "loadtest_token", "lt-secret")
    lt = {"X-Load-Test": "lt-secret"}

    # Full lead flow under load-test headers: no lead reaches the backend.
    resp = await client.post("/chat-api/chat", json={"message": "Call me, I'm Lo Ad, 469 767 2211"}, headers=lt)
    sid = parse_sse(resp.text)[0][1]["session_id"]
    resp = await client.post("/chat-api/chat", json={"message": "yes", "session_id": sid}, headers=lt)
    assert parse_sse(resp.text)[-1][1]["lead_stage"] == "submitted"
    assert offline_backend.created == []

    # No per-IP/session rate limits for synthetic traffic.
    monkeypatch.setattr(settings, "session_messages_per_minute", 1)
    for _ in range(3):
        assert (await client.post("/chat-api/chat", json={"message": "hello", "session_id": sid}, headers=lt)).status_code == 200

    # Wrong token: treated as a normal visitor (rate limited here).
    assert (await client.post("/chat-api/chat", json={"message": "hello", "session_id": sid}, headers={"X-Load-Test": "nope"})).status_code == 429

    # Invites under load test are not counted as impressions.
    from app.db import ProactiveStat, SessionLocal

    async with SessionLocal() as db:
        before = sum(r.shown for r in (await db.execute(select(ProactiveStat))).scalars().all())
    await client.post("/chat-api/proactive/invite", json={"page_url": "/"}, headers=lt)
    async with SessionLocal() as db:
        after = sum(r.shown for r in (await db.execute(select(ProactiveStat))).scalars().all())
    assert after == before

    # Hidden from the dashboard, then purged.
    token = await _admin_token()
    if token:
        listing = (await client.get("/chat-api/admin/conversations?q=Lo%20Ad", headers={"Authorization": f"Bearer {token}"})).json()
        assert listing["items"] == []
    assert (await client.post("/chat-api/loadtest/purge", headers={"X-Load-Test": "nope"})).status_code == 404
    purged = (await client.post("/chat-api/loadtest/purge", headers=lt)).json()
    assert purged["deleted"] >= 1
    assert (await client.get(f"/chat-api/sessions/{sid}")).status_code == 404


async def test_voice_transcribe_and_speak(client):
    files = {"audio": ("speech.webm", b"\x1a\x45\xdf\xa3fake-opus", "audio/webm;codecs=opus")}
    resp = await client.post("/chat-api/voice/transcribe", files=files)
    assert resp.status_code == 200 and resp.json()["text"] == "I have a load to move"

    bad = await client.post("/chat-api/voice/transcribe", files={"audio": ("x.txt", b"hello", "text/plain")})
    assert bad.status_code == 415
    empty = await client.post("/chat-api/voice/transcribe", files={"audio": ("e.webm", b"", "audio/webm")})
    assert empty.status_code == 422

    speech = await client.post("/chat-api/voice/speak", json={"text": "Hi! Check https://example.com for **details**."})
    assert speech.status_code == 200 and speech.headers["content-type"] == "audio/wav"
    assert speech.content[:4] == b"RIFF"
    too_long = await client.post("/chat-api/voice/speak", json={"text": "word " * 60})
    assert too_long.status_code == 422


async def test_voice_limits_and_switch(client, site, monkeypatch):
    from app import voice as voice_mod

    monkeypatch.setattr(voice_mod.speak_limiter, "budget", 30)
    voice_mod.speak_limiter._hits.clear()
    assert (await client.post("/chat-api/voice/speak", json={"text": "a" * 25})).status_code == 200
    assert (await client.post("/chat-api/voice/speak", json={"text": "b" * 25})).status_code == 429
    voice_mod.speak_limiter._hits.clear()

    site.voice.enabled = False
    assert (await client.post("/chat-api/voice/speak", json={"text": "hello"})).status_code == 404
    files = {"audio": ("s.webm", b"data", "audio/webm")}
    assert (await client.post("/chat-api/voice/transcribe", files=files)).status_code == 404
    assert (await client.get("/chat-api/config")).json()["voice_enabled"] is False
