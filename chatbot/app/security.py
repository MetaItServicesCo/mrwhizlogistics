"""Request identity, abuse limits and dashboard authentication."""

import hashlib
import hmac
import re
import uuid
from datetime import timedelta

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import func, select, text

from app.config import get_settings
from app.db import Message, SessionLocal, utcnow

settings = get_settings()
_SESSION_RE = re.compile(r"^[a-f0-9]{32}$")


def is_load_test(request: Request) -> bool:
    """Synthetic load-test traffic (see Settings.loadtest_token)."""
    token = settings.loadtest_token
    supplied = request.headers.get("x-load-test")
    return bool(token and supplied and hmac.compare_digest(supplied, token))


def new_session_id() -> str:
    return uuid.uuid4().hex


def valid_session_id(value: str | None) -> bool:
    return bool(value and _SESSION_RE.match(value))


def client_ip(request: Request) -> str:
    # Behind nginx: X-Real-IP / X-Forwarded-For are set by our proxy.
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def ip_hash(ip: str) -> str:
    """Salted, one-way: lets us rate limit without storing addresses."""
    return hashlib.sha256(f"{settings.secret_key}:{ip}".encode()).hexdigest()[:32]


async def enforce_rate_limits(session_id: str, ip_digest: str) -> None:
    """Counts stored visitor messages, so limits hold across workers and restarts."""
    now = utcnow()
    async with SessionLocal() as db:
        per_session_min = await db.scalar(
            select(func.count(Message.id)).where(
                Message.conversation_id == session_id, Message.role == "user", Message.created_at > now - timedelta(minutes=1)
            )
        )
        per_session_day = await db.scalar(
            select(func.count(Message.id)).where(
                Message.conversation_id == session_id, Message.role == "user", Message.created_at > now - timedelta(days=1)
            )
        )
        per_ip_min = await db.scalar(
            select(func.count(Message.id)).where(
                Message.ip_hash == ip_digest, Message.role == "user", Message.created_at > now - timedelta(minutes=1)
            )
        )
    if (per_session_min or 0) >= settings.session_messages_per_minute or (per_ip_min or 0) >= settings.ip_messages_per_minute:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "You're sending messages very quickly. Please wait a moment.")
    if (per_session_day or 0) >= settings.session_messages_per_day:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"This chat has reached its daily limit. Please call dispatch at {settings.dispatch_phone}.",
        )


def session_lock_key(session_id: str) -> int:
    """Stable 63-bit key for pg advisory locks (one turn at a time per session)."""
    return int(session_id[:15], 16)


_bearer = HTTPBearer(auto_error=False)


async def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> int:
    """Dashboard JWT issued by the main backend (same signing key); the user must be active."""
    if not credentials or not settings.secret_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError) as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc
    async with SessionLocal() as db:
        active = await db.scalar(text("SELECT is_active FROM public.users WHERE id = :id"), {"id": user_id})
    if not active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user_id
