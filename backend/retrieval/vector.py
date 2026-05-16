from __future__ import annotations

import hashlib
import math
from ingestion.chunker import TextChunk


def embed_text(text: str, dimensions: int = 64) -> list[float]:
    vector = [0.0] * dimensions
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode('utf-8')).digest()
        index = digest[0] % dimensions
        sign = 1 if digest[1] % 2 == 0 else -1
        vector[index] += sign * (1 + len(token) / 12)
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def vector_search(query: str, chunks: list[TextChunk], top_k: int) -> list[tuple[TextChunk, float]]:
    query_vector = embed_text(query)
    scored = [(chunk, max(0.0, cosine(query_vector, embed_text(chunk.text)))) for chunk in chunks]
    return sorted(scored, key=lambda item: item[1], reverse=True)[:top_k]
