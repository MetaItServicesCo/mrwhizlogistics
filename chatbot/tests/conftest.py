import asyncio
import os
import sys

# Async psycopg needs a selector event loop; Windows defaults to Proactor
# (production runs on Linux, where this is a no-op).
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Offline and isolated: fake model, hashing embeddings, a separate schema,
# no background crawling. Must be set before the app modules are imported.
os.environ["LLM_PROVIDER"] = "fake"
os.environ["EMBEDDING_PROVIDER"] = "hash"
os.environ["DB_SCHEMA"] = "chatbot_test"
os.environ["BACKGROUND_JOBS"] = "false"
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ["SESSION_MESSAGES_PER_MINUTE"] = "50"
# Hashing embeddings score lower than bge; this is the equivalent threshold.
os.environ["KB_MIN_SCORE"] = "0.3"

import numpy as np  # noqa: E402
import pytest  # noqa: E402

from app.knowledge.embeddings import HashingEmbedder, set_embedder  # noqa: E402
from app.knowledge.retriever import HybridIndex, IndexedChunk  # noqa: E402
from app.site import ChatbotConfig  # noqa: E402

set_embedder(HashingEmbedder())

DOCS = [
    ("/hot-shot", "Hot Shot Trucking", "Hot Shot Trucking > Overview",
     "Hot shot trucking moves urgent, medium-to-heavy loads on flatbed trailers pulled by heavy-duty pickups. Ideal for equipment and time-sensitive freight."),
    ("/box-truck", "Box Truck Freight", "Box Truck Freight > Fleet",
     "Our 26 ft box trucks carry palletized goods with a lift gate, weather-proof and secure for retail distribution."),
    ("/semi-truck", "Semi Truck", "Semi Truck > Trailers",
     "Semi truck options include dry van, reefer trailers for temperature-controlled loads, and flatbed for oversized freight."),
    ("/contact", "Contact", "Contact > Coverage",
     "We deliver nationwide across all 50 states with 24/7 dispatch."),
]


class FakeKB:
    def __init__(self) -> None:
        self.embedder = HashingEmbedder()
        chunks = [IndexedChunk(i, url, title, heading, f"{heading}\n{text}") for i, (url, title, heading, text) in enumerate(DOCS)]
        self.index = HybridIndex(chunks, self.embedder.embed_documents([c.content for c in chunks]), "test")

    async def search(self, query: str, k: int | None = None):
        return self.index.search(self.embedder.embed_query(query), query, k or 4)


class FakeLeads:
    def __init__(self, fail: bool = False) -> None:
        self.created: list[tuple[dict, str]] = []
        self.updated: list[tuple[int, dict]] = []
        self.fail = fail

    async def create_lead(self, lead: dict, session_id: str) -> int:
        if self.fail:
            raise RuntimeError("backend down")
        self.created.append((dict(lead), session_id))
        return 101

    async def update_lead(self, lead_id: int, lead: dict) -> None:
        self.updated.append((lead_id, dict(lead)))


@pytest.fixture
def site() -> ChatbotConfig:
    return ChatbotConfig(phone="(469) 767 8853", email="dispatch@mrwhizlogistics.com", working_hours="24/7")


@pytest.fixture
def fake_kb() -> FakeKB:
    return FakeKB()


@pytest.fixture
def fake_leads() -> FakeLeads:
    return FakeLeads()


@pytest.fixture
def embedder() -> HashingEmbedder:
    return HashingEmbedder()


def unit(v) -> np.ndarray:
    v = np.asarray(v, dtype=np.float32)
    return v / np.linalg.norm(v)
