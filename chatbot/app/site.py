"""
Live configuration from the main backend:
- chatbot settings edited in Dashboard -> Chatbot (site setting "chatbot_settings"),
- company facts (phone, email, address, hours) from the site settings.
Cached briefly so a dashboard change applies within a minute.
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()

CHATBOT_SETTINGS_KEY = "chatbot_settings"
CACHE_SECONDS = 60

DEFAULT_GREETING = (
    "Hi! I'm the Mr. Whiz Logistics assistant. Ask me about hot shot, box truck or semi "
    "truck freight, or tell me what you need moved and I'll get a dispatcher to call you."
)
DEFAULT_QUICK_PROMPTS = [
    "I need a shipping quote",
    "What services do you offer?",
    "Do you deliver nationwide?",
    "Call me back",
]


@dataclass
class ChatbotConfig:
    enabled: bool = True
    greeting: str = DEFAULT_GREETING
    quick_prompts: list[str] = field(default_factory=lambda: list(DEFAULT_QUICK_PROMPTS))
    # Short facts the assistant must always know (also indexed as knowledge).
    facts: list[str] = field(default_factory=list)
    retention_days: int = 90
    company_name: str = "Mr. Whiz Logistics"
    phone: str = ""
    email: str = ""
    address: str = ""
    working_hours: str = ""

    @property
    def dispatch_phone(self) -> str:
        return self.phone or settings.dispatch_phone

    def company_facts(self) -> str:
        lines = [f"Company: {self.company_name}"]
        if self.phone or settings.dispatch_phone:
            lines.append(f"Dispatch phone: {self.dispatch_phone}")
        if self.email:
            lines.append(f"Email: {self.email}")
        if self.address:
            lines.append(f"Address: {' '.join(self.address.split())}")
        if self.working_hours:
            lines.append(f"Hours: {self.working_hours}")
        return "\n".join(lines)


def parse_config(rows: list[dict]) -> ChatbotConfig:
    values = {r.get("key"): r.get("value") for r in rows if isinstance(r, dict)}
    cfg = ChatbotConfig(retention_days=settings.default_retention_days)
    raw = values.get(CHATBOT_SETTINGS_KEY)
    try:
        stored = json.loads(raw) if raw else {}
    except (TypeError, ValueError):
        stored = {}
    if isinstance(stored, dict):
        if isinstance(stored.get("enabled"), bool):
            cfg.enabled = stored["enabled"]
        if isinstance(stored.get("greeting"), str) and stored["greeting"].strip():
            cfg.greeting = stored["greeting"].strip()[:500]
        prompts = stored.get("quick_prompts")
        if isinstance(prompts, list):
            cleaned = [p.strip()[:80] for p in prompts if isinstance(p, str) and p.strip()]
            if cleaned:
                cfg.quick_prompts = cleaned[:6]
        facts = stored.get("facts")
        if isinstance(facts, list):
            cfg.facts = [f.strip()[:600] for f in facts if isinstance(f, str) and f.strip()][:50]
        days = stored.get("retention_days")
        if isinstance(days, int) and 7 <= days <= 3650:
            cfg.retention_days = days
    cfg.company_name = (values.get("company_name") or cfg.company_name).strip() or cfg.company_name
    cfg.phone = (values.get("phone") or "").strip()
    cfg.email = (values.get("email") or "").strip()
    cfg.address = (values.get("address") or "").strip()
    cfg.working_hours = (values.get("working_hours") or "").strip()
    return cfg


class SiteConfigCache:
    def __init__(self) -> None:
        self._value: ChatbotConfig | None = None
        self._at = 0.0
        self._lock = asyncio.Lock()

    async def get(self) -> ChatbotConfig:
        if self._value and time.monotonic() - self._at < CACHE_SECONDS:
            return self._value
        async with self._lock:
            if self._value and time.monotonic() - self._at < CACHE_SECONDS:
                return self._value
            try:
                async with httpx.AsyncClient(timeout=8) as client:
                    resp = await client.get(f"{settings.backend_url}/api/public/settings")
                    resp.raise_for_status()
                    self._value = parse_config(resp.json())
            except Exception as exc:  # noqa: BLE001 - keep serving with the last known config
                log.warning("Could not load site settings: %s", exc)
                if self._value is None:
                    self._value = ChatbotConfig(retention_days=settings.default_retention_days)
            self._at = time.monotonic()
            return self._value

    def invalidate(self) -> None:
        self._at = 0.0


site_config = SiteConfigCache()
