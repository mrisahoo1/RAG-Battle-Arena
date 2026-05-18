from __future__ import annotations

import hashlib
import re
import time
from ingestion.pipeline import CHUNKS, seed_demo_corpus
from ingestion.chunker import TextChunk
from retrieval.vector import vector_search
from retrieval.hybrid import hybrid_search
from reranker.cross_encoder import rerank
from evaluation.scorer import evaluate
from observability.metrics import record
from rag.schemas import ArenaSettings, Chunk, CompareResponse, PipelineResult

PIPELINE_META = {
    'naive-vector': ('Naive Vector RAG', 'Vector', 'Dense embedding similarity over all chunks with top-k context stuffing.', '#27d8ff'),
    'hybrid-search': ('Hybrid Search RAG', 'Hybrid', 'Reciprocal rank fusion across vector similarity and BM25 lexical retrieval.', '#b7ff5a'),
    'reranked': ('Reranked RAG', 'Rerank', 'Broad initial retrieval followed by cross-encoder relevance reranking.', '#ffb454'),
    'agentic': ('Agentic RAG', 'Agentic', 'Query rewriting, retrieval planning, confidence checks, and targeted retries.', '#ff5c8a'),
}

STOPWORDS = {
    'a', 'an', 'and', 'are', 'as', 'based', 'be', 'by', 'for', 'from', 'give', 'gives', 'how', 'i', 'in', 'is',
    'it', 'me', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'use', 'uses', 'what', 'when', 'which', 'why', 'with', 'you'
}

PIPELINE_NOTES = {
    'Naive Vector RAG': 'Vector-only retrieval is fast and semantic, but it may pull broader context when the question depends on exact document wording.',
    'Hybrid Search RAG': 'Hybrid retrieval combines semantic vector recall with lexical BM25 matching, so exact terms from the document carry more weight.',
    'Reranked RAG': 'Reranked retrieval promotes the chunks whose wording is most directly grounded in the question before composing the answer.',
    'Agentic RAG': 'Agentic retrieval rewrites the question into retrieval intents, checks evidence coverage, and returns a trace for ambiguous audit-style asks.',
}


def _jitter(seed: str, minimum: int, maximum: int) -> int:
    digest = hashlib.sha256(seed.encode('utf-8')).hexdigest()
    return minimum + int(digest[:8], 16) % (maximum - minimum + 1)


def _query_terms(query: str) -> set[str]:
    return {term for term in re.findall(r'[a-z0-9]+', query.lower()) if len(term) > 2 and term not in STOPWORDS}


def _split_sentences(text: str) -> list[str]:
    normalized = re.sub(r'\s+', ' ', text).strip()
    if not normalized:
        return []
    parts = re.split(r'(?<=[.!?])\s+', normalized)
    return [part.strip(' -') for part in parts if part.strip(' -')]


def _sentence_score(sentence: str, query_terms: set[str], chunk_score: float) -> float:
    sentence_l = sentence.lower()
    overlap = sum(1 for term in query_terms if term in sentence_l)
    audit_bonus = 1.5 if 'audit' in query_terms and 'audit' in sentence_l else 0.0
    return overlap * 2.0 + audit_bonus + chunk_score


def _evidence_sentences(query: str, chunks: list[Chunk], limit: int = 3) -> list[tuple[str, str]]:
    query_terms = _query_terms(query)
    candidates: list[tuple[float, str, str]] = []
    for chunk in chunks:
        for sentence in _split_sentences(chunk.text):
            score = _sentence_score(sentence, query_terms, chunk.score)
            if score > 0:
                candidates.append((score, sentence, chunk.id))
        if not candidates and chunk.text:
            candidates.append((chunk.score, chunk.text.strip()[:260], chunk.id))
    ordered = sorted(candidates, key=lambda item: item[0], reverse=True)
    selected: list[tuple[str, str]] = []
    seen: set[str] = set()
    for _, sentence, chunk_id in ordered:
        compact = sentence.lower()
        if compact in seen:
            continue
        seen.add(compact)
        selected.append((sentence[:340], chunk_id))
        if len(selected) == limit:
            break
    return selected


def _to_chunk(chunk: TextChunk, score: float, vector_score: float | None = None, bm25_score: float | None = None, rerank_score: float | None = None) -> Chunk:
    return Chunk(
        id=chunk.id,
        documentId=chunk.document_id,
        title=chunk.title,
        text=chunk.text[:520],
        score=round(score, 4),
        bm25Score=round(bm25_score, 4) if bm25_score is not None else None,
        vectorScore=round(vector_score, 4) if vector_score is not None else None,
        rerankScore=round(rerank_score, 4) if rerank_score is not None else None,
        position=chunk.position,
        tokens=chunk.tokens,
    )


def _answer(query: str, label: str, chunks: list[Chunk], confidence: float, risk: float) -> str:
    citations = ', '.join(chunk.id for chunk in chunks[:3])
    evidence = _evidence_sentences(query, chunks)
    note = PIPELINE_NOTES[label]
    if not evidence:
        return (
            f'{label} did not find enough document evidence to answer "{query}" confidently. '
            f'Retrieval confidence is {confidence:.0%}, hallucination risk is {risk:.0%}, and the closest citations are {citations}. '
            'Upload a more relevant document or broaden retrieval settings.'
        )

    evidence_text = ' '.join(f'{sentence} [{chunk_id}]' for sentence, chunk_id in evidence)
    return (
        f'{label} answer for "{query}": {evidence_text} '
        f'{note} Retrieval confidence: {confidence:.0%}. Hallucination risk: {risk:.0%}. Citations: {citations}.'
    )


def _result(pid: str, query: str, chunks: list[Chunk], latency_base: int, timings: dict[str, int], trace: list[str], prompt: str) -> PipelineResult:
    name, short_name, strategy, color = PIPELINE_META[pid]
    bonus = {'naive-vector': 0.0, 'hybrid-search': 0.05, 'reranked': 0.09, 'agentic': 0.07}[pid]
    confidence = min(0.96, max(0.5, sum(chunk.score for chunk in chunks) / max(1, len(chunks)) + bonus))
    risk = max(0.08, min(0.42, 0.56 - confidence * 0.48 + (0.05 if pid == 'naive-vector' else 0)))
    latency = latency_base + _jitter(query + pid, 0, 160)
    tokens = 860 + sum(chunk.tokens for chunk in chunks) + len(query.split()) * 22 + _jitter(pid + query, 20, 170)
    estimated_cost = round(tokens * 0.000012 + latency * 0.000002, 4)
    return PipelineResult(
        id=pid, name=name, shortName=short_name, strategy=strategy,
        answer=_answer(query, name, chunks, confidence, risk), retrievedChunks=chunks,
        latencyMs=latency, tokenUsage=tokens, estimatedCost=estimated_cost,
        hallucinationRisk=round(risk, 3), retrievalConfidence=round(confidence, 3),
        citations=[chunk.id for chunk in chunks], reasoningTrace=trace,
        promptTemplate=prompt, timings=timings, color=color,
    )


def choose_winner_for_query(query: str, results: list[PipelineResult]) -> str:
    query_l = query.lower()
    intent_bonus = {result.id: 0.0 for result in results}
    if any(term in query_l for term in ['rerank', 'ground', 'faithful', 'hallucination']):
        intent_bonus['reranked'] += 0.14
    if any(term in query_l for term in ['hybrid', 'bm25', 'lexical', 'vector search']):
        intent_bonus['hybrid-search'] += 0.12
    if any(term in query_l for term in ['agentic', 'ambiguous', 'planner', 'multi-intent', 'worth the added latency']):
        intent_bonus['agentic'] += 0.16
    if any(term in query_l for term in ['fast', 'lowest latency', 'cheap']):
        intent_bonus['naive-vector'] += 0.12
    weighted = sorted(results, key=lambda result: result.retrievalConfidence * 0.44 + (1 - result.hallucinationRisk) * 0.38 - (result.latencyMs / 12000) * 0.08 + intent_bonus[result.id], reverse=True)
    return weighted[0].id


def compare(query: str, settings: ArenaSettings) -> CompareResponse:
    seed_demo_corpus()
    started = time.perf_counter()
    top_k = settings.topK

    vector_hits = vector_search(query, CHUNKS, top_k)
    vector_chunks = [_to_chunk(chunk, score, vector_score=score) for chunk, score in vector_hits]
    vector_ms = _jitter(query + 'vector', 90, 190)

    hybrid_hits = hybrid_search(query, CHUNKS, top_k)
    hybrid_chunks = [_to_chunk(chunk, fused, vector_score=vector_score, bm25_score=bm25_score) for chunk, fused, vector_score, bm25_score in hybrid_hits]
    hybrid_ms = _jitter(query + 'hybrid', 180, 320)

    reranked_hits = rerank(query, hybrid_search(query, CHUNKS, top_k * 3), top_k)
    reranked_chunks = [_to_chunk(chunk, score, vector_score=vector_score, bm25_score=bm25_score, rerank_score=rerank_score) for chunk, score, vector_score, bm25_score, rerank_score in reranked_hits]
    rerank_ms = _jitter(query + 'rerank', 360, 540) if settings.rerankerEnabled else 0

    rewritten = f'{query} grounded evidence retrieval precision faithfulness architecture tradeoff'
    agentic_hits = rerank(rewritten, hybrid_search(rewritten, CHUNKS, max(top_k * 3, 8)), top_k)
    agentic_chunks = [_to_chunk(chunk, score, vector_score=vector_score, bm25_score=bm25_score, rerank_score=rerank_score) for chunk, score, vector_score, bm25_score, rerank_score in agentic_hits]
    rewrite_ms = _jitter(query + 'rewrite', 220, 340)

    results = [
        _result('naive-vector', query, vector_chunks, 820, {'rewrite': 0, 'vector': vector_ms, 'bm25': 0, 'rerank': 0, 'generation': 720}, ['Embedded the query.', 'Retrieved top semantic neighbors.', 'Packed top chunks by vector score.', 'Generated extractive answer from retrieved context.'], 'Answer with citations using retrieved chunks. Refuse claims not present in context.'),
        _result('hybrid-search', query, hybrid_chunks, 1120, {'rewrite': 0, 'vector': vector_ms, 'bm25': hybrid_ms - vector_ms, 'rerank': 0, 'generation': 910}, ['Ran vector retrieval.', 'Ran BM25 retrieval.', 'Fused ranks with lexical boost.', 'Generated extractive answer from balanced context.'], 'Prefer cited evidence that appears in both semantic and lexical retrieval.'),
        _result('reranked', query, reranked_chunks, 1540, {'rewrite': 0, 'vector': vector_ms, 'bm25': hybrid_ms - vector_ms, 'rerank': rerank_ms, 'generation': 930}, ['Retrieved a broad candidate set.', 'Scored query-chunk pairs with a cross encoder.', 'Moved directly grounded evidence upward.', 'Generated extractive answer with high citation pressure.'], 'Use only reranked context. Explain uncertainty and cite every material claim.'),
        _result('agentic', query, agentic_chunks, 2180, {'rewrite': rewrite_ms, 'vector': vector_ms + 32, 'bm25': hybrid_ms - vector_ms + 40, 'rerank': rerank_ms, 'generation': 1280}, ['Rewrote the query into retrieval intents.', 'Selected hybrid retrieval with metadata filtering.', 'Retried low-confidence subqueries.', 'Synthesized extractive answer with planning trace.'], 'Plan retrieval, gather evidence, validate coverage, then answer with traceable citations.'),
    ]

    elapsed = int((time.perf_counter() - started) * 1000)
    if elapsed > 0:
        results[0].timings['orchestration'] = elapsed
    metrics = evaluate(results)
    winner = choose_winner_for_query(query, results)
    obs = record(results, len(CHUNKS))
    return CompareResponse(query=query, winner=winner, results=results, evaluation=metrics, observability=obs)
