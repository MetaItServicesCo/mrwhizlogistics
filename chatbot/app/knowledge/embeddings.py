"""
Text embeddings. Groq has no embeddings API, so production runs a small local
model (BAAI/bge-small-en-v1.5 via fastembed: ONNX, CPU, ~130 MB, baked into
the Docker image). The hashing embedder is a deterministic stand-in for tests.
"""

import asyncio
import hashlib
import re
from typing import Protocol

import numpy as np

from app.config import get_settings

settings = get_settings()


class Embedder(Protocol):
    dim: int

    def embed_documents(self, texts: list[str]) -> np.ndarray: ...

    def embed_query(self, text: str) -> np.ndarray: ...


def _normalize(m: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(m, axis=-1, keepdims=True)
    norms[norms == 0] = 1.0
    return (m / norms).astype(np.float32)


class FastEmbedEmbedder:
    def __init__(self, model_name: str, cache_dir: str | None = None) -> None:
        from fastembed import TextEmbedding

        self._model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)
        self.dim = int(self._model.embedding_size) if hasattr(self._model, "embedding_size") else 384

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dim), dtype=np.float32)
        return _normalize(np.array(list(self._model.passage_embed(texts, batch_size=32))))

    def embed_query(self, text: str) -> np.ndarray:
        return _normalize(np.array(list(self._model.query_embed([text])))[0:1])[0]


_TOKEN = re.compile(r"[a-z0-9]+")


class HashingEmbedder:
    """Bag-of-words hashing into a fixed space: deterministic, no downloads."""

    dim = 512

    def _vec(self, text: str) -> np.ndarray:
        v = np.zeros(self.dim, dtype=np.float32)
        for tok in _TOKEN.findall(text.lower()):
            h = int(hashlib.md5(tok.encode()).hexdigest(), 16)
            v[h % self.dim] += 1.0
        return v

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dim), dtype=np.float32)
        return _normalize(np.stack([self._vec(t) for t in texts]))

    def embed_query(self, text: str) -> np.ndarray:
        return _normalize(self._vec(text)[None, :])[0]


_embedder: Embedder | None = None
_lock = asyncio.Lock()


def build_embedder() -> Embedder:
    if settings.embedding_provider == "hash":
        return HashingEmbedder()
    return FastEmbedEmbedder(settings.embedding_model, settings.embedding_cache_dir)


async def get_embedder() -> Embedder:
    """Loaded once per process, off the event loop (model load takes seconds)."""
    global _embedder
    if _embedder is None:
        async with _lock:
            if _embedder is None:
                _embedder = await asyncio.to_thread(build_embedder)
    return _embedder


def set_embedder(embedder: Embedder | None) -> None:
    """Tests inject their own embedder."""
    global _embedder
    _embedder = embedder
