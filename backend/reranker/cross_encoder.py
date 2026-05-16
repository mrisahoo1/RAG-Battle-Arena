from __future__ import annotations

from retrieval.bm25 import tokenize
from ingestion.chunker import TextChunk


def rerank(query: str, candidates: list[tuple[TextChunk, float, float, float]], top_k: int) -> list[tuple[TextChunk, float, float, float, float]]:
    query_terms = set(tokenize(query))
    ranked: list[tuple[TextChunk, float, float, float, float]] = []
    for chunk, fused, vector_score, bm25_score in candidates:
        chunk_terms = set(tokenize(chunk.text))
        overlap = len(query_terms & chunk_terms) / max(1, len(query_terms))
        directness = 0.22 if any(term in chunk.text.lower() for term in ['faithfulness', 'rerank', 'hybrid', 'confidence', 'ground']) else 0
        rerank_score = min(1.0, fused * 0.46 + overlap * 0.42 + directness)
        ranked.append((chunk, rerank_score, vector_score, bm25_score, rerank_score))
    return sorted(ranked, key=lambda item: item[1], reverse=True)[:top_k]
