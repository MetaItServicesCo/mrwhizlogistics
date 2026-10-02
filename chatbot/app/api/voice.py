"""Voice endpoints for the chat widget (only called when the visitor taps a voice control)."""

import logging

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.security import client_ip, ip_hash
from app.site import site_config
from app.voice import (
    MAX_AUDIO_BYTES,
    TTS_MAX_CHARS,
    VoiceError,
    audio_extension,
    clean_for_speech,
    get_voice,
    speak_limiter,
    transcribe_limiter,
)

log = logging.getLogger(__name__)
router = APIRouter(prefix="/chat-api/voice", tags=["Voice"])


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)


async def _voice_config():
    cfg = await site_config.get()
    if not (cfg.enabled and cfg.voice.enabled):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Voice is turned off.")
    return cfg


@router.post("/transcribe")
async def transcribe(request: Request, audio: UploadFile = File(...)) -> dict:
    await _voice_config()
    extension = audio_extension(audio.content_type)
    if not extension:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Unsupported audio format.")
    data = await audio.read(MAX_AUDIO_BYTES + 1)
    if not data:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "No audio received.")
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "That recording is too long. Please keep it under a minute.")
    if not transcribe_limiter.allow(ip_hash(client_ip(request))):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many voice messages. Please type for a moment.")
    try:
        text = await get_voice().transcribe(data, extension)
    except VoiceError as exc:
        log.warning("Transcription failed: %s", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Sorry, I couldn't process that recording. Please type your message.") from exc
    except Exception as exc:  # noqa: BLE001 - network etc.
        log.warning("Transcription failed: %s", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Sorry, I couldn't process that recording. Please type your message.") from exc
    return {"text": text[:1000]}


@router.post("/speak")
async def speak(body: SpeakRequest, request: Request) -> Response:
    cfg = await _voice_config()
    text = clean_for_speech(body.text)
    if not text:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Nothing to read aloud.")
    if len(text) > TTS_MAX_CHARS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Send at most {TTS_MAX_CHARS} characters per request.")
    if not speak_limiter.allow(ip_hash(client_ip(request)), cost=len(text)):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Voice replies are paused for a moment.")
    try:
        audio = await get_voice().speak(text, cfg.voice.voice)
    except Exception as exc:  # noqa: BLE001 - the widget falls back to the browser voice
        log.warning("Speech synthesis failed: %s", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Voice is unavailable right now.") from exc
    return Response(content=audio, media_type="audio/wav", headers={"Cache-Control": "private, max-age=86400"})
