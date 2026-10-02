from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    """Chatbot service configuration (environment variables / chatbot/.env)."""

    # ---- Storage: the site's Postgres; this service only uses the "chatbot" schema.
    database_url: str
    db_schema: str = "chatbot"

    # ---- Main backend (leads, settings) and the public website (knowledge crawl)
    backend_url: str = "http://backend:8000"
    # Shared secret for /api/internal/* on the backend.
    service_token: str = ""
    # Where the crawler fetches pages from (Docker-internal frontend).
    site_internal_url: str = "http://frontend:3000"
    # The public origin used in source links shown to visitors.
    site_public_url: str = "https://mrwhizlogistics.com"

    # ---- Admin API: dashboard JWTs are signed by the backend with this key.
    secret_key: str = ""
    algorithm: str = "HS256"

    # ---- LLM
    # "groq" in production; "fake" is a deterministic offline model for tests
    # and local development without an API key.
    llm_provider: str = "groq"
    groq_api_key: str = ""
    # Preferred models. If the key can't use one, the service picks the next
    # available model (app/agent/models.py). The gpt-oss models are open to
    # every Groq tier; the Llama models are Enterprise-only.
    # Writes answers and runs the lead conversation.
    chat_model: str = "openai/gpt-oss-120b"
    # Routing and structured extraction (fast, cheap).
    router_model: str = "openai/gpt-oss-20b"
    # Used when the primary model is rate limited or failing.
    fallback_model: str = "openai/gpt-oss-20b"
    llm_timeout_seconds: float = 30.0
    # Voice (only when the visitor taps a voice control in the widget).
    stt_model: str = "whisper-large-v3-turbo"
    tts_model: str = "canopylabs/orpheus-v1-english"
    llm_max_retries: int = 2
    # Concurrent LLM calls per worker, to stay inside Groq rate limits.
    llm_max_concurrency: int = 16
    temperature: float = 0.2

    # ---- Knowledge base
    # "fastembed" (local bge-small) in production; "hash" for tests.
    embedding_provider: str = "fastembed"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_cache_dir: str = str(SERVICE_DIR / ".models")
    kb_refresh_minutes: int = 30
    kb_top_k: int = 6
    # Below this dense similarity (and with no keyword hit) the bot says it
    # doesn't know instead of guessing.
    kb_min_score: float = 0.60
    kb_chunk_chars: int = 900
    kb_chunk_overlap: int = 150
    kb_max_pages: int = 400

    # ---- Abuse protection
    max_message_chars: int = 1000
    session_messages_per_minute: int = 12
    session_messages_per_day: int = 150
    ip_messages_per_minute: int = 30
    history_turns: int = 10

    # ---- Misc
    cors_origins: str = "*"
    dispatch_phone: str = "(469) 767 8853"
    # Transcripts older than this are deleted (overridable from the dashboard).
    default_retention_days: int = 90
    log_level: str = "INFO"
    # Disable background crawling/cleanup (tests).
    background_jobs: bool = True
    # Load testing against production: requests with the header
    # "X-Load-Test: <token>" use the offline model, never create leads or
    # emails, skip per-IP limits, are excluded from dashboard stats and can
    # be purged. Empty disables load-test mode entirely.
    loadtest_token: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def async_database_url(self) -> str:
        """SQLAlchemy async URL on psycopg 3 (the backend uses psycopg2)."""
        url = self.database_url
        for prefix in ("postgresql+psycopg2://", "postgresql+psycopg://", "postgresql://", "postgres://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix):]
        return url

    @property
    def libpq_url(self) -> str:
        """Plain libpq URL for the LangGraph checkpointer pool."""
        return self.async_database_url.replace("postgresql+psycopg://", "postgresql://", 1)

    model_config = SettingsConfigDict(env_file=SERVICE_DIR / ".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
