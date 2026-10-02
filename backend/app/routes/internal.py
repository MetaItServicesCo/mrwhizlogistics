"""
Service-to-service API for the AI chat assistant (the separate chatbot
service). Authenticated with a shared secret header, never exposed to
visitors: the chatbot creates and enriches leads here so the backend stays
the single owner of lead data and its validation.
"""

import hmac
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.crud import get_or_404
from app.core.dispatch_alert import send_dispatch_alert
from app.database import get_db
from app.models.quote import QuoteRequest
from app.schemas.quote import QuoteRead

router = APIRouter(prefix="/internal", tags=["Internal (chatbot service)"])

CHAT_SOURCE = "chatbot"


def require_service_token(x_service_token: str | None = Header(default=None)) -> None:
    expected = settings.chatbot_service_token
    if not expected:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Chatbot integration is not configured.")
    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid service token.")


def _clean(value: Optional[str], limit: int) -> Optional[str]:
    value = (value or "").strip()
    return value[:limit] or None


class ChatLeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=7, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    selected_service: Optional[str] = Field(None, max_length=120)
    pickup: Optional[str] = Field(None, max_length=255)
    drop: Optional[str] = Field(None, max_length=255)
    details: Optional[str] = Field(None, max_length=4000)
    chat_session_id: str = Field(..., min_length=8, max_length=64)
    callback_requested: bool = True

    @field_validator("name", "phone")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Cannot be empty")
        return v


class ChatLeadUpdate(BaseModel):
    """Details shared after the callback request; only filled fields change."""

    name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    selected_service: Optional[str] = Field(None, max_length=120)
    pickup: Optional[str] = Field(None, max_length=255)
    drop: Optional[str] = Field(None, max_length=255)
    details: Optional[str] = Field(None, max_length=4000)


def _dashboard_url() -> str:
    return f"{settings.public_site_url.rstrip('/')}/dashboard/leads/quotes"


@router.post(
    "/chat-leads",
    response_model=QuoteRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_service_token)],
)
def create_chat_lead(payload: ChatLeadCreate, background: BackgroundTasks, db: Session = Depends(get_db)):
    # Retries from the chatbot (timeouts) must not create duplicates.
    existing = (
        db.query(QuoteRequest)
        .filter(QuoteRequest.chat_session_id == payload.chat_session_id, QuoteRequest.source == CHAT_SOURCE)
        .order_by(QuoteRequest.id.desc())
        .first()
    )
    if existing:
        return existing
    row = QuoteRequest(
        name=payload.name.strip()[:255],
        phone=payload.phone.strip()[:50],
        email=_clean(payload.email, 255),
        selected_service=_clean(payload.selected_service, 120) or "Call back request",
        pickup=_clean(payload.pickup, 255),
        drop=_clean(payload.drop, 255),
        details=_clean(payload.details, 4000),
        status="new",
        source=CHAT_SOURCE,
        callback_requested=payload.callback_requested,
        chat_session_id=payload.chat_session_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    if payload.callback_requested:
        lead = {c: getattr(row, c) for c in ("id", "name", "phone", "email", "selected_service", "pickup", "drop", "details")}
        background.add_task(send_dispatch_alert, lead, _dashboard_url())
    return row


@router.patch(
    "/chat-leads/{lead_id}",
    response_model=QuoteRead,
    dependencies=[Depends(require_service_token)],
)
def update_chat_lead(lead_id: int, payload: ChatLeadUpdate, db: Session = Depends(get_db)):
    row = get_or_404(db, QuoteRequest, lead_id)
    if row.source != CHAT_SOURCE:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    limits = {"name": 255, "phone": 50, "email": 255, "selected_service": 120, "pickup": 255, "drop": 255, "details": 4000}
    for field, value in payload.model_dump(exclude_unset=True).items():
        value = _clean(value, limits[field])
        if value:
            setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row
