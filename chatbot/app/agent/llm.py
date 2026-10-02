"""
The language-model boundary. Agent nodes depend on the `ChatLLM` protocol,
never on a provider SDK:

- GroqLLM: production. LangChain's ChatGroq with retries, a fallback model,
  timeouts and a per-worker concurrency cap (Groq rate limits are per minute).
  Switching provider later means another implementation of this protocol.
- FakeLLM: deterministic and offline, for tests, evals of the graph logic and
  local development without an API key.
"""

import asyncio
import logging
import re
import time
from collections.abc import AsyncIterator
from typing import TYPE_CHECKING, Literal, Optional, Protocol

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from app.config import get_settings

if TYPE_CHECKING:
    from app.agent.models import ModelChoice

log = logging.getLogger(__name__)
settings = get_settings()

Intent = Literal["knowledge", "lead", "handoff", "smalltalk", "off_topic"]


class RouteDecision(BaseModel):
    """How to handle the visitor's latest message."""

    intent: Intent = Field(description="Which specialist should answer the latest message.")
    search_query: str = Field(
        default="",
        description="The latest message rewritten as a standalone ENGLISH search query, resolving references to earlier turns. Empty for smalltalk.",
    )
    language: str = Field(default="en", description="ISO 639-1 code of the language the visitor writes in, e.g. en, es.")


class LeadExtraction(BaseModel):
    """Details the visitor has stated. Leave a field null unless the visitor said it."""

    name: Optional[str] = Field(None, description="Visitor's name.")
    phone: Optional[str] = Field(None, description="Phone number exactly as the visitor typed it.")
    email: Optional[str] = Field(None, description="Email address.")
    service: Optional[str] = Field(None, description="Service needed: Hot Shot, Box Truck, Semi Truck, Rental or other.")
    pickup: Optional[str] = Field(None, description="Pickup city/state or address.")
    delivery: Optional[str] = Field(None, description="Delivery city/state or address.")
    freight: Optional[str] = Field(None, description="What is being shipped: type, weight, dimensions, pallets.")
    pickup_date: Optional[str] = Field(None, description="When the load is ready, as the visitor said it.")
    notes: Optional[str] = Field(None, description="Any other useful detail for the dispatcher.")
    confirmation: Literal["yes", "no", "none"] = Field(
        "none",
        description="Only if the assistant's last message asked the visitor to confirm their callback details: yes if they confirmed, no if they want to change something, otherwise none.",
    )
    declined: bool = Field(
        False,
        description="True only if the visitor clearly says they don't want a call or quote right now (e.g. 'no thanks', 'just browsing', 'not now').",
    )


class LLMUnavailable(RuntimeError):
    """Every model attempt failed (rate limits, outage, timeout)."""


class LLMHealth:
    """Last outcome of model calls in this worker (Dashboard -> AI Assistant status)."""

    def __init__(self) -> None:
        self.last_ok: float | None = None
        self.last_error: str | None = None
        self.last_error_at: float | None = None

    def ok(self) -> None:
        self.last_ok = time.time()

    def failed(self, exc: Exception) -> None:
        self.last_error = describe_error(exc)
        self.last_error_at = time.time()


def describe_error(exc: Exception) -> str:
    """A short, key-free explanation of a provider error for admins."""
    text = str(exc)
    lowered = text.lower()
    if "invalid_api_key" in lowered or "invalid api key" in lowered or "401" in lowered:
        return "Groq rejected the API key (401). Check GROQ_API_KEY in .env, without quotes or spaces, then recreate the chatbot container."
    if "model_not_found" in lowered or "does not exist" in lowered or "decommissioned" in lowered:
        return f"The configured model is not available on Groq: {text[:200]}"
    if "rate_limit" in lowered or "429" in lowered:
        return "Groq rate limit reached (429). Replies fall back to basic answers until the limit resets; consider a higher Groq tier."
    if "connect" in lowered or "timed out" in lowered or "timeout" in lowered or "name resolution" in lowered:
        return f"Could not reach Groq from the server (network/firewall): {text[:200]}"
    return text[:300]


health = LLMHealth()


class ChatLLM(Protocol):
    async def route(self, system: str, history: list[BaseMessage]) -> RouteDecision: ...

    async def extract_lead(self, system: str, history: list[BaseMessage]) -> LeadExtraction: ...

    def stream(self, system: str, history: list[BaseMessage], fallback: str | None = None) -> AsyncIterator[str]: ...

    async def ping(self) -> str | None: ...

    def models(self) -> dict: ...


# =========================================================================== Groq


class GroqLLM:
    """Groq via LangChain, on models resolved against what the key can use."""

    REDISCOVER_AFTER_S = 60

    def __init__(self, choice: "ModelChoice | None" = None) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set (or set LLM_PROVIDER=fake for offline use).")
        from app.agent.models import ModelChoice

        self._sem = asyncio.Semaphore(settings.llm_max_concurrency)
        self._resolve_lock = asyncio.Lock()
        self._needs_resolve = choice is None
        self._last_resolve = 0.0
        self.resolve_error: str | None = None
        self._build(choice or ModelChoice(chat=settings.chat_model, fast=settings.router_model, fallback=settings.fallback_model))

    @classmethod
    async def create(cls) -> "GroqLLM":
        llm = cls()
        await llm._ensure_models(force=True)
        return llm

    def _model(self, name: str, temperature: float, **overrides):
        from langchain_groq import ChatGroq

        from app.agent.models import is_reasoning_model

        kwargs = dict(
            model=name,
            api_key=settings.groq_api_key,
            temperature=temperature,
            max_retries=settings.llm_max_retries,
            timeout=settings.llm_timeout_seconds,
        )
        if is_reasoning_model(name):
            # Short, fast answers: minimal hidden reasoning.
            kwargs["reasoning_effort"] = "low"
        kwargs.update(overrides)
        return ChatGroq(**kwargs)

    def _build(self, choice: "ModelChoice") -> None:
        self.choice = choice
        chat = self._model(choice.chat, settings.temperature)
        fast = self._model(choice.fast, 0)
        fallback = self._model(choice.fallback, settings.temperature)
        fallback_fast = self._model(choice.fallback, 0)
        self._chat = chat.with_fallbacks([fallback]) if choice.fallback != choice.chat else chat
        self._router = fast.with_structured_output(RouteDecision).with_fallbacks(
            [fallback_fast.with_structured_output(RouteDecision), chat.with_structured_output(RouteDecision)]
        )
        # Extraction quality matters more than speed: the big model first.
        self._extractor = chat.with_structured_output(LeadExtraction).with_fallbacks(
            [fallback_fast.with_structured_output(LeadExtraction)]
        )
        # Health checks call the model once, without retries or fallbacks.
        self._ping_model = self._model(choice.fast, 0, max_retries=0, timeout=15, max_tokens=256)

    async def _ensure_models(self, force: bool = False) -> None:
        """(Re)discover available models: at startup and after "model not found"."""
        if not (force or self._needs_resolve):
            return
        if not force and time.time() - self._last_resolve < self.REDISCOVER_AFTER_S:
            return
        from app.agent.models import NoUsableModel, discover

        async with self._resolve_lock:
            if not (force or self._needs_resolve):
                return
            self._last_resolve = time.time()
            try:
                choice = await discover()
            except NoUsableModel as exc:
                self.resolve_error = str(exc)
                log.error("Model discovery: %s", exc)
                return
            except Exception as exc:  # noqa: BLE001 - keep the configured models, retry later
                self.resolve_error = f"Could not list Groq models ({describe_error(exc)}); using the configured models."
                log.warning(self.resolve_error)
                return
            self.resolve_error = None
            self._needs_resolve = False
            self._build(choice)

    def _note_failure(self, exc: Exception, what: str) -> None:
        health.failed(exc)
        log.warning("%s model failed: %s", what, describe_error(exc))
        text = str(exc).lower()
        if "model_not_found" in text or "does not exist" in text or "decommissioned" in text:
            self._needs_resolve = True

    async def route(self, system: str, history: list[BaseMessage]) -> RouteDecision:
        await self._ensure_models()
        async with self._sem:
            try:
                result = await self._router.ainvoke([SystemMessage(system), *history])
            except Exception as exc:  # noqa: BLE001
                self._note_failure(exc, "Router")
                raise LLMUnavailable(str(exc)) from exc
        health.ok()
        return result if isinstance(result, RouteDecision) else RouteDecision.model_validate(result)

    async def extract_lead(self, system: str, history: list[BaseMessage]) -> LeadExtraction:
        await self._ensure_models()
        async with self._sem:
            try:
                result = await self._extractor.ainvoke([SystemMessage(system), *history])
            except Exception as exc:  # noqa: BLE001
                self._note_failure(exc, "Extraction")
                raise LLMUnavailable(str(exc)) from exc
        health.ok()
        return result if isinstance(result, LeadExtraction) else LeadExtraction.model_validate(result)

    async def stream(self, system: str, history: list[BaseMessage], fallback: str | None = None) -> AsyncIterator[str]:
        await self._ensure_models()
        async with self._sem:
            emitted = False
            try:
                async for chunk in self._chat.astream([SystemMessage(system), *history]):
                    piece = chunk.content if isinstance(chunk.content, str) else ""
                    if piece:
                        emitted = True
                        yield piece
                health.ok()
            except Exception as exc:  # noqa: BLE001
                self._note_failure(exc, "Chat")
                if emitted:
                    # Mid-answer failure: close the sentence gracefully.
                    yield "\u2026"
                    return
                if fallback:
                    yield fallback
                    return
                raise LLMUnavailable(str(exc)) from exc

    async def ping(self) -> str | None:
        """Live check of the fast model: None when healthy, else the reason."""
        await self._ensure_models(force=self._needs_resolve)
        if self.resolve_error and self._needs_resolve:
            return self.resolve_error
        try:
            async with asyncio.timeout(20):
                await self._ping_model.ainvoke("Reply with OK.")
            health.ok()
            return None
        except Exception as exc:  # noqa: BLE001
            self._note_failure(exc, "Health check")
            return describe_error(exc)

    def models(self) -> dict:
        c = self.choice
        return {"chat": c.chat, "fast": c.fast, "fallback": c.fallback, "available": c.available, "notes": c.notes, "error": self.resolve_error}


# =========================================================================== Fake

_PHONE = re.compile(r"(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}")
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
_NAME = re.compile(r"\b(?:my name is|i am|i'm|this is|name's)\s+([A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+)?)", re.I)
_DECLINE = re.compile(r"\b(no thanks|no thank you|not now|not right now|just browsing|just looking|maybe later|not interested|no need|i'?m good)\b|^\s*no\s*[.!]*\s*$", re.I)
_YES = re.compile(r"^\s*(yes|yeah|yep|yup|correct|right|sure|ok|okay|confirm|that's right|call me|please do)\b", re.I)
_NO = re.compile(r"^\s*(no|nope|wrong|change|not right|incorrect)\b", re.I)
_LEAD_WORDS = re.compile(r"\b(quote|price|pricing|rate|cost|book|booking|ship|move|haul|call me|call back|callback|load)\b", re.I)
_HANDOFF_WORDS = re.compile(r"\b(human|agent|person|representative|dispatcher|someone|manager|complaint|emergency)\b", re.I)
_SMALLTALK = re.compile(r"^\s*(hi|hello|hey|thanks|thank you|bye|goodbye|good (morning|afternoon|evening))\b[\s!.]*$", re.I)
_OFF_TOPIC = re.compile(r"\b(poem|joke|homework|python|javascript|recipe|weather|politic|ignore (all|previous|your) )", re.I)
_SERVICES = {"hot shot": "Hot Shot", "hotshot": "Hot Shot", "box truck": "Box Truck", "semi": "Semi Truck", "rental": "Rental"}


def _last_human(history: list[BaseMessage]) -> str:
    for m in reversed(history):
        if isinstance(m, HumanMessage):
            return str(m.content)
    return ""


def _last_ai(history: list[BaseMessage]) -> str:
    for m in reversed(history):
        if isinstance(m, AIMessage):
            return str(m.content)
    return ""


class FakeLLM:
    """Keyword/regex stand-in with the same contract as GroqLLM."""

    async def ping(self) -> str | None:
        return None

    def models(self) -> dict:
        return {"chat": "fake", "fast": "fake", "fallback": "fake", "available": [], "notes": [], "error": None}

    async def route(self, system: str, history: list[BaseMessage]) -> RouteDecision:
        text = _last_human(history)
        lead_active = "LEAD FLOW: ACTIVE" in system or "LEAD FLOW: SUBMITTED" in system
        if _OFF_TOPIC.search(text):
            intent: Intent = "off_topic"
        elif _HANDOFF_WORDS.search(text):
            intent = "handoff"
        elif _SMALLTALK.match(text):
            intent = "smalltalk"
        elif _PHONE.search(text) or _EMAIL.search(text) or _LEAD_WORDS.search(text):
            intent = "lead"
        elif lead_active and "?" not in text:
            intent = "lead"
        else:
            intent = "knowledge"
        return RouteDecision(intent=intent, search_query=text, language="en")

    async def extract_lead(self, system: str, history: list[BaseMessage]) -> LeadExtraction:
        text = _last_human(history)
        out = LeadExtraction()
        if m := _PHONE.search(text):
            out.phone = m.group(0)
        if m := _EMAIL.search(text):
            out.email = m.group(0)
        if m := _NAME.search(text):
            out.name = m.group(1).strip()
        elif "name" in _last_ai(history).lower() or out.phone:
            words = _PHONE.sub("", text).replace(",", " ").split()
            alpha = [w for w in words if w.isalpha()]
            if 1 <= len(alpha) <= 3 and not _YES.match(text) and not _NO.match(text):
                out.name = " ".join(alpha[:2]).title()
        lower = text.lower()
        for key, label in _SERVICES.items():
            if key in lower:
                out.service = label
                break
        if m := re.search(r"\bfrom\s+([A-Za-z .]+?)\s+to\s+([A-Za-z .]+?)(?:[,.!?]|$)", text, re.I):
            out.pickup, out.delivery = m.group(1).strip(), m.group(2).strip()
        if _DECLINE.search(text) and not (out.phone or out.name):
            out.declined = True
        if "CONFIRMATION PENDING" in system:
            if _YES.match(text):
                out.confirmation = "yes"
            elif _NO.match(text):
                out.confirmation = "no"
        return out

    async def stream(self, system: str, history: list[BaseMessage], fallback: str | None = None) -> AsyncIterator[str]:
        if "<context>" in system:
            # Answer from the first retrieved chunk (skip its "[n] Page > Section" line).
            context = system.split("<context>", 1)[1].split("</context>", 1)[0]
            first = next((l for l in context.splitlines()[1:] if l.strip() and not l.startswith(("[", "#"))), "")
            reply = f"From our website: {first.strip()[:300]}"
        elif fallback:
            reply = fallback
        else:
            reply = "Happy to help with your freight. What do you need moved?"
        for word in reply.split(" "):
            yield word + " "
            await asyncio.sleep(0)


_llm: ChatLLM | None = None


async def create_llm() -> ChatLLM:
    """Build the configured provider (Groq first discovers which models the key can use)."""
    global _llm
    _llm = FakeLLM() if settings.llm_provider == "fake" else await GroqLLM.create()
    return _llm


def get_llm() -> ChatLLM:
    global _llm
    if _llm is None:
        _llm = FakeLLM() if settings.llm_provider == "fake" else GroqLLM()
    return _llm


def set_llm(llm: ChatLLM | None) -> None:
    global _llm
    _llm = llm
