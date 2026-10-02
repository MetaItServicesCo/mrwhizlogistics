"""
Voice for the website chat, used only when the visitor taps a voice control:
- speech-to-text: Groq Whisper (whisper-large-v3-turbo),
- text-to-speech: Groq Orpheus (max 200 characters per request; the widget
  sends a long reply sentence by sentence and plays them back to back).

Costs are bounded with per-visitor limits; audio is generated on demand and
never stored.
"""

import io
import logging
import re
import struct
import time
from collections import defaultdict, deque

import httpx

from app.agent.llm import describe_error
from app.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()

GROQ_AUDIO = "https://api.groq.com/openai/v1/audio"
TTS_MAX_CHARS = 200
VOICES = ("autumn", "diana", "hannah", "austin", "daniel", "troy")
AUDIO_TYPES = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
}
MAX_AUDIO_BYTES = 5 * 1024 * 1024  # ~60 s of opus/aac comfortably fits

_URL = re.compile(r"https?://\S+")
_SPACES = re.compile(r"\s+")


class VoiceError(RuntimeError):
    def __init__(self, message: str, status: int = 502) -> None:
        super().__init__(message)
        self.status = status


def audio_extension(content_type: str | None) -> str | None:
    base = (content_type or "").split(";")[0].strip().lower()
    return AUDIO_TYPES.get(base)


def clean_for_speech(text: str) -> str:
    """Links and markdown read badly aloud."""
    text = _URL.sub("", text or "")
    text = text.replace("*", "").replace("#", "").replace("`", "")
    return _SPACES.sub(" ", text).strip()


# --------------------------------------------------------------------------- limits


class SlidingLimiter:
    """Per-worker sliding-window budget per visitor (good enough for cost control)."""

    def __init__(self, budget: int, window_s: int) -> None:
        self.budget, self.window = budget, window_s
        self._hits: dict[str, deque[tuple[float, int]]] = defaultdict(deque)

    def allow(self, key: str, cost: int = 1) -> bool:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0][0] > self.window:
            hits.popleft()
        if sum(c for _, c in hits) + cost > self.budget:
            return False
        hits.append((now, cost))
        if len(self._hits) > 50_000:  # bound memory under abuse
            self._hits.clear()
        return True


transcribe_limiter = SlidingLimiter(budget=20, window_s=600)  # 20 voice messages / 10 min
speak_limiter = SlidingLimiter(budget=6000, window_s=600)  # ~6k characters / 10 min


# --------------------------------------------------------------------------- providers


class GroqVoice:
    async def transcribe(self, audio: bytes, extension: str) -> str:
        files = {"file": (f"speech.{extension}", audio)}
        data = {"model": settings.stt_model, "response_format": "json", "temperature": "0"}
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{GROQ_AUDIO}/transcriptions",
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                files=files,
                data=data,
            )
        if resp.status_code != 200:
            raise VoiceError(describe_error(RuntimeError(f"{resp.status_code} {resp.text[:300]}")))
        return (resp.json().get("text") or "").strip()

    async def speak(self, text: str, voice: str) -> bytes:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{GROQ_AUDIO}/speech",
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={"model": settings.tts_model, "input": text, "voice": voice, "response_format": "wav"},
            )
        if resp.status_code != 200:
            raise VoiceError(describe_error(RuntimeError(f"{resp.status_code} {resp.text[:300]}")))
        return resp.content


def silent_wav(seconds: float = 0.25, rate: int = 16000) -> bytes:
    frames = int(seconds * rate)
    data = b"\x00\x00" * frames
    buf = io.BytesIO()
    buf.write(b"RIFF" + struct.pack("<I", 36 + len(data)) + b"WAVE")
    buf.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, rate, rate * 2, 2, 16))
    buf.write(b"data" + struct.pack("<I", len(data)) + data)
    return buf.getvalue()


class FakeVoice:
    """Offline stand-in (tests, local development without a key)."""

    async def transcribe(self, audio: bytes, extension: str) -> str:
        return "I have a load to move" if audio else ""

    async def speak(self, text: str, voice: str) -> bytes:
        return silent_wav()


_voice: GroqVoice | FakeVoice | None = None


def get_voice() -> GroqVoice | FakeVoice:
    global _voice
    if _voice is None:
        _voice = FakeVoice() if settings.llm_provider == "fake" or not settings.groq_api_key else GroqVoice()
    return _voice
