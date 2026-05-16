from __future__ import annotations

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

PipelineId = Literal['naive-vector', 'hybrid-search', 'reranked', 'agentic']


class ArenaSettings(BaseModel):
    chunkSize: int = Field(default=720, ge=120, le=2400)
    overlap: int = Field(default=96, ge=0, le=600)
    embeddingModel: str = 'text-embedding-3-large'
    topK: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.2, ge=0, le=2)
    retrievalMode: Literal['balanced', 'precision', 'recall'] = 'balanced'
    rerankerEnabled: bool = True
    metadataFilter: str = 'all documents'


class QueryRequest(BaseModel):
    query: str
    settings: ArenaSettings = Field(default_factory=ArenaSettings)


class Chunk(BaseModel):
    id: str
    documentId: str
    title: str
    text: str
    score: float
    bm25Score: float | None = None
    vectorScore: float | None = None
    rerankScore: float | None = None
    position: int
    tokens: int


class PipelineResult(BaseModel):
    id: PipelineId
    name: str
    shortName: str
    strategy: str
    answer: str
    retrievedChunks: list[Chunk]
    latencyMs: int
    tokenUsage: int
    estimatedCost: float
    hallucinationRisk: float
    retrievalConfidence: float
    citations: list[str]
    reasoningTrace: list[str]
    promptTemplate: str
    timings: dict[str, int]
    color: str


class EvaluationMetric(BaseModel):
    metric: str
    naive: int
    hybrid: int
    reranked: int
    agentic: int


class ObservabilitySnapshot(BaseModel):
    requests: int
    avgLatencyMs: int
    p95LatencyMs: int
    tokens: int
    estimatedCost: float
    cacheHitRate: float
    chunkCount: int
    embeddingMs: int
    retrievalMs: int
    rerankMs: int
    generationMs: int


class CompareResponse(BaseModel):
    query: str
    winner: PipelineId
    results: list[PipelineResult]
    evaluation: list[EvaluationMetric]
    observability: ObservabilitySnapshot


class DocumentRecord(BaseModel):
    id: str
    name: str
    type: Literal['pdf', 'docx', 'txt']
    status: Literal['queued', 'parsing', 'chunking', 'embedding', 'indexing', 'ready', 'failed']
    chunkCount: int
    tokenCount: int
    createdAt: datetime


class RetrievalDebugRequest(BaseModel):
    query: str
    pipeline: PipelineId = 'reranked'
    settings: ArenaSettings = Field(default_factory=ArenaSettings)
