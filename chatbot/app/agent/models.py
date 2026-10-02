"""
Choosing Groq models that this API key can actually use.

Groq changes its lineup over time and some models are limited by account
tier (e.g. the Llama models became "Enterprise" only) or by project model
permissions. Instead of failing with "model not found", the service lists
the models available to the key and picks, per role, the first available
model from a preference list that starts with the configured one.
"""

import logging
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()

GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models"

# Best first. Production models available to every tier come first; the
# Llama models remain as options for Enterprise keys.
CHAT_PREFERENCES = [
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
]
FAST_PREFERENCES = [
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
]
# Never chat models: speech, guard/safety classifiers, agentic systems.
_NOT_CHAT = ("whisper", "tts", "guard", "safeguard", "compound", "playai", "orpheus", "prompt-guard")


class NoUsableModel(RuntimeError):
    pass


@dataclass
class ModelChoice:
    chat: str
    fast: str
    fallback: str
    available: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


def is_reasoning_model(model: str) -> bool:
    """gpt-oss models accept reasoning_effort (kept low for chat latency)."""
    return model.startswith("openai/gpt-oss")


async def list_available_models(api_key: str) -> list[str]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(GROQ_MODELS_URL, headers={"Authorization": f"Bearer {api_key}"})
    if resp.status_code == 401:
        raise NoUsableModel("Groq rejected the API key (401). Check GROQ_API_KEY in .env, without quotes or spaces.")
    resp.raise_for_status()
    data = resp.json().get("data", [])
    return sorted(m["id"] for m in data if m.get("active", True) and not any(x in m["id"].lower() for x in _NOT_CHAT))


def _pick(configured: str, preferences: list[str], available: set[str], role: str, notes: list[str]) -> str | None:
    for candidate in [configured, *preferences]:
        if candidate and candidate in available:
            if candidate != configured:
                notes.append(f"{role}: configured model '{configured}' is not available to this key; using '{candidate}'.")
            return candidate
    return None


def resolve(available: list[str]) -> ModelChoice:
    avail = set(available)
    notes: list[str] = []
    chat = _pick(settings.chat_model, CHAT_PREFERENCES, avail, "Chat", notes)
    fast = _pick(settings.router_model, FAST_PREFERENCES, avail, "Routing", notes)
    # Anything chat-capable beats nothing (a future model we don't know yet).
    if not chat and available:
        chat = available[0]
        notes.append(f"Chat: no preferred model available; using '{chat}'.")
    if not chat:
        raise NoUsableModel("This Groq key has no access to any chat model. Check the key's project and model permissions in the Groq console.")
    fast = fast or chat
    fallback_pref = [settings.fallback_model, *FAST_PREFERENCES, *CHAT_PREFERENCES]
    fallback = next((m for m in fallback_pref if m in avail and m != chat), chat)
    return ModelChoice(chat=chat, fast=fast, fallback=fallback, available=available, notes=notes)


async def discover() -> ModelChoice:
    available = await list_available_models(settings.groq_api_key)
    choice = resolve(available)
    log.info("Groq models: chat=%s fast=%s fallback=%s (%d available)", choice.chat, choice.fast, choice.fallback, len(available))
    for note in choice.notes:
        log.warning(note)
    return choice
