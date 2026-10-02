"""Mr. Whiz Logistics AI chat assistant (LangGraph + Groq), a separate service."""

import asyncio
import contextlib
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import jobs
from app.agent.llm import get_llm
from app.api import admin, chat
from app.config import get_settings
from app.db import init_db, startup_lock
from app.knowledge.base import kb
from app.knowledge.embeddings import get_embedder
from app.runtime import runtime

settings = get_settings()
logging.basicConfig(level=settings.log_level, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
# Visitor messages are logged only at DEBUG (personal data).
logging.getLogger("httpx").setLevel(logging.WARNING)
log = logging.getLogger("chatbot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # One worker at a time creates tables and runs checkpointer migrations.
    async with startup_lock():
        await init_db()
        await runtime.start(use_postgres=True)
    app.state.llm = get_llm()
    # Load the embedding model and the current index before taking traffic.
    await get_embedder()
    await kb.reload_if_changed()
    tasks: list[asyncio.Task] = []
    if settings.background_jobs:
        tasks = [
            asyncio.create_task(jobs.knowledge_refresher()),
            asyncio.create_task(jobs.index_reloader()),
            asyncio.create_task(jobs.retention_cleaner()),
        ]
    log.info("Chatbot ready: provider=%s model=%s chunks=%d", settings.llm_provider, settings.chat_model, len(kb.index))
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()
        for task in tasks:
            with contextlib.suppress(asyncio.CancelledError):
                await task
        await runtime.stop()


app = FastAPI(title="Mr. Whiz AI Assistant", version="1.0.0", lifespan=lifespan, docs_url="/chat-api/docs", openapi_url="/chat-api/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(chat.router)
app.include_router(admin.router)
