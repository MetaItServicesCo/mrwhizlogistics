"""Process-wide runtime: the compiled graph and its checkpointer."""

import logging

from langgraph.checkpoint.memory import InMemorySaver

from app.agent.graph import build_graph
from app.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()


class Runtime:
    def __init__(self) -> None:
        self.graph = None
        self.checkpointer = None
        self._pool = None

    async def start(self, use_postgres: bool = True) -> None:
        if use_postgres:
            from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
            from psycopg.rows import dict_row
            from psycopg_pool import AsyncConnectionPool

            self._pool = AsyncConnectionPool(
                conninfo=settings.libpq_url,
                max_size=10,
                open=False,
                kwargs={
                    "autocommit": True,
                    "prepare_threshold": 0,
                    "row_factory": dict_row,
                    # Checkpoint tables live in the chatbot schema, not public.
                    "options": f"-c search_path={settings.db_schema}",
                },
            )
            await self._pool.open()
            self.checkpointer = AsyncPostgresSaver(self._pool)
            await self.checkpointer.setup()
        else:
            self.checkpointer = InMemorySaver()
        self.graph = build_graph(self.checkpointer)
        log.info("Agent graph ready (%s checkpointer)", "postgres" if use_postgres else "memory")

    async def delete_thread(self, thread_id: str) -> None:
        if self.checkpointer is not None:
            await self.checkpointer.adelete_thread(thread_id)

    async def stop(self) -> None:
        if self._pool is not None:
            await self._pool.close()


runtime = Runtime()
