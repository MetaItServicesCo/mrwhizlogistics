"""
Hybrid retrieval over the knowledge index, held in memory per worker.

The whole site is a few thousand chunks at most, so exact cosine similarity
(numpy) plus BM25 keyword scoring is milliseconds and needs no vector
database. Results are fused with Reciprocal Rank Fusion: dense search catches
paraphrases ("how fast can you ship"), BM25 catches exact terms ("26 ft").
"""

import re
from dataclasses import dataclass

import numpy as np
from rank_bm25 import BM25Okapi

_TOKEN = re.compile(r"[a-z0-9]+")
STOPWORDS = frozenset(
    "a an and are as at be by can do does for from how i in is it me my of on or our the to we what when "
    "where which who why will with you your".split()
)
RRF_K = 60


def tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN.findall(text.lower()) if t not in STOPWORDS]


@dataclass
class IndexedChunk:
    id: int
    url: str
    title: str
    heading: str
    content: str


@dataclass
class Hit:
    chunk: IndexedChunk
    score: float  # fused (RRF) score, for ordering
    dense: float  # cosine similarity, for the confidence check
    keyword: float  # BM25 score


class HybridIndex:
    def __init__(self, chunks: list[IndexedChunk], embeddings: np.ndarray, version: str = "") -> None:
        self.chunks = chunks
        self.embeddings = embeddings.astype(np.float32) if len(chunks) else np.zeros((0, 1), dtype=np.float32)
        self.version = version
        self._bm25 = BM25Okapi([tokenize(c.content) for c in chunks]) if chunks else None

    def __len__(self) -> int:
        return len(self.chunks)

    def search(self, query_vec: np.ndarray, query: str, k: int = 6) -> list[Hit]:
        if not self.chunks:
            return []
        dense = self.embeddings @ query_vec.astype(np.float32)
        tokens = tokenize(query)
        keyword = np.asarray(self._bm25.get_scores(tokens)) if self._bm25 and tokens else np.zeros(len(self.chunks))

        pool = min(len(self.chunks), max(k * 4, 20))
        dense_rank = np.argsort(-dense)[:pool]
        fused: dict[int, float] = {}
        for rank, idx in enumerate(dense_rank):
            fused[int(idx)] = fused.get(int(idx), 0.0) + 1.0 / (RRF_K + rank + 1)
        if keyword.any():
            kw_rank = [i for i in np.argsort(-keyword)[:pool] if keyword[i] > 0]
            for rank, idx in enumerate(kw_rank):
                fused[int(idx)] = fused.get(int(idx), 0.0) + 1.0 / (RRF_K + rank + 1)

        ordered = sorted(fused.items(), key=lambda kv: kv[1], reverse=True)
        hits: list[Hit] = []
        seen_text: set[str] = set()
        for idx, score in ordered:
            chunk = self.chunks[idx]
            key = chunk.content[-200:]
            if key in seen_text:
                continue
            seen_text.add(key)
            hits.append(Hit(chunk=chunk, score=score, dense=float(dense[idx]), keyword=float(keyword[idx])))
            if len(hits) >= k:
                break
        return hits


def confident(hits: list[Hit], min_dense: float) -> bool:
    """Enough evidence to answer: a close semantic match, or a strong keyword match."""
    if not hits:
        return False
    best_dense = max(h.dense for h in hits)
    best_kw = max(h.keyword for h in hits)
    return best_dense >= min_dense or (best_kw >= 4.0 and best_dense >= min_dense - 0.12)
