from __future__ import annotations

from ingestion.chunker import TextChunk
from retrieval.bm25 import bm25_search
from retrieval.vector import vector_search


def reciprocal_rank_fusion(vector_hits: list[tuple[TextChunk, float]], bm25_hits: list[tuple[TextChunk, float]], top_k: int) -> list[tuple[TextChunk, float, float, float]]:
    scores: dict[str, dict[str, float | TextChunk]] = {}
    for rank, (chunk, score) in enumerate(vector_hits, start=1):
        entry = scores.setdefault(chunk.id, {'chunk': chunk, 'vector': 0.0, 'bm25': 0.0, 'rrf': 0.0})
        entry['vector'] = score
        entry['rrf'] = float(entry['rrf']) + 1 / (60 + rank)
    for rank, (chunk, score) in enumerate(bm25_hits, start=1):
        entry = scores.setdefault(chunk.id, {'chunk': chunk, 'vector': 0.0, 'bm25': 0.0, 'rrf': 0.0})
        entry['bm25'] = score
        entry['rrf'] = float(entry['rrf']) + 1 / (60 + rank)
    fused = sorted(scores.values(), key=lambda item: float(item['rrf']), reverse=True)[:top_k]
    max_score = max((float(item['rrf']) for item in fused), default=1.0)
    return [(item['chunk'], float(item['rrf']) / max_score, float(item['vector']), float(item['bm25'])) for item in fused]  # type: ignore[arg-type]


def hybrid_search(query: str, chunks: list[TextChunk], top_k: int) -> list[tuple[TextChunk, float, float, float]]:
    vector_hits = vector_search(query, chunks, top_k * 3)
    bm25_hits = bm25_search(query, chunks, top_k * 3)
    return reciprocal_rank_fusion(vector_hits, bm25_hits, top_k)
