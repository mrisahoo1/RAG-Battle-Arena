from __future__ import annotations

import math
import re
from collections import Counter
from ingestion.chunker import TextChunk

TOKEN_RE = re.compile(r'[a-zA-Z0-9_]+')


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall(text.lower())


def bm25_search(query: str, chunks: list[TextChunk], top_k: int, k1: float = 1.5, b: float = 0.75) -> list[tuple[TextChunk, float]]:
    tokenized_docs = [tokenize(chunk.text) for chunk in chunks]
    query_terms = tokenize(query)
    avg_len = sum(len(doc) for doc in tokenized_docs) / max(1, len(tokenized_docs))
    document_frequency = Counter(term for doc in tokenized_docs for term in set(doc))
    scores: list[tuple[TextChunk, float]] = []
    for chunk, doc in zip(chunks, tokenized_docs):
        frequencies = Counter(doc)
        score = 0.0
        for term in query_terms:
            if term not in frequencies:
                continue
            idf = math.log(1 + (len(chunks) - document_frequency[term] + 0.5) / (document_frequency[term] + 0.5))
            numerator = frequencies[term] * (k1 + 1)
            denominator = frequencies[term] + k1 * (1 - b + b * len(doc) / max(1, avg_len))
            score += idf * numerator / denominator
        scores.append((chunk, min(1.0, score / 8)))
    return sorted(scores, key=lambda item: item[1], reverse=True)[:top_k]
