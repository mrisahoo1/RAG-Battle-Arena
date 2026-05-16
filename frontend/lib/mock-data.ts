import type { Chunk, CompareResponse, DocumentRecord, EvaluationMetric, ObservabilitySnapshot, PipelineResult } from '@/types/rag';

const chunks: Chunk[] = [
  {
    id: 'chunk-001',
    documentId: 'doc-rag-ops',
    title: 'Retrieval architecture decision memo',
    text: 'Hybrid retrieval combines semantic vector search with sparse lexical matching so exact entities and acronyms are not lost during embedding lookup.',
    score: 0.91,
    vectorScore: 0.89,
    bm25Score: 0.84,
    rerankScore: 0.94,
    position: 2,
    tokens: 86
  },
  {
    id: 'chunk-014',
    documentId: 'doc-rag-ops',
    title: 'Reranking incident analysis',
    text: 'Cross encoder reranking improved grounding for compliance questions by moving policy-specific evidence above broad conceptual chunks.',
    score: 0.87,
    vectorScore: 0.81,
    bm25Score: 0.78,
    rerankScore: 0.96,
    position: 14,
    tokens: 72
  },
  {
    id: 'chunk-027',
    documentId: 'doc-eval',
    title: 'Evaluation rubric',
    text: 'Faithfulness should be scored by checking whether every material claim in the answer can be traced to retrieved context and citations.',
    score: 0.83,
    vectorScore: 0.85,
    bm25Score: 0.62,
    rerankScore: 0.88,
    position: 27,
    tokens: 64
  },
  {
    id: 'chunk-039',
    documentId: 'doc-agentic',
    title: 'Agentic retrieval planner',
    text: 'The agentic planner rewrites ambiguous user questions into subqueries, selects filters, and retries retrieval when confidence is below threshold.',
    score: 0.79,
    vectorScore: 0.76,
    bm25Score: 0.73,
    rerankScore: 0.82,
    position: 39,
    tokens: 91
  }
];

export const demoDocuments: DocumentRecord[] = [
  { id: 'doc-rag-ops', name: 'RAG production architecture memo.pdf', type: 'pdf', status: 'ready', chunkCount: 46, tokenCount: 18420, createdAt: '2026-05-16T11:20:00Z' },
  { id: 'doc-eval', name: 'Evaluation rubric and risk controls.docx', type: 'docx', status: 'ready', chunkCount: 28, tokenCount: 9360, createdAt: '2026-05-16T11:24:00Z' },
  { id: 'doc-agentic', name: 'Agentic retrieval planning notes.txt', type: 'txt', status: 'ready', chunkCount: 19, tokenCount: 6210, createdAt: '2026-05-16T11:31:00Z' }
];

export const evaluationMetrics: EvaluationMetric[] = [
  { metric: 'Relevance', naive: 72, hybrid: 84, reranked: 89, agentic: 92 },
  { metric: 'Faithfulness', naive: 68, hybrid: 81, reranked: 91, agentic: 88 },
  { metric: 'Groundedness', naive: 64, hybrid: 80, reranked: 93, agentic: 86 },
  { metric: 'Precision', naive: 66, hybrid: 83, reranked: 90, agentic: 87 },
  { metric: 'Recall', naive: 70, hybrid: 88, reranked: 84, agentic: 91 },
  { metric: 'Risk Control', naive: 58, hybrid: 76, reranked: 89, agentic: 85 }
];

export const observabilitySnapshot: ObservabilitySnapshot = {
  requests: 128,
  avgLatencyMs: 1430,
  p95LatencyMs: 3280,
  tokens: 184920,
  estimatedCost: 3.84,
  cacheHitRate: 0.37,
  chunkCount: 93,
  embeddingMs: 420,
  retrievalMs: 180,
  rerankMs: 460,
  generationMs: 1320
};

export const demoResults: PipelineResult[] = [
  {
    id: 'naive-vector',
    name: 'Naive Vector RAG',
    shortName: 'Vector',
    strategy: 'Dense embedding similarity over all chunks with top-k context stuffing.',
    answer: 'Vector RAG finds semantically related chunks quickly, but it may miss exact policy terms or acronyms. In this run, it identified the general hybrid search rationale and evaluation rubric, then generated a broad answer with moderate grounding.',
    retrievedChunks: [chunks[0], chunks[2], chunks[3]],
    latencyMs: 920,
    tokenUsage: 1690,
    estimatedCost: 0.018,
    hallucinationRisk: 0.34,
    retrievalConfidence: 0.72,
    citations: ['chunk-001', 'chunk-027', 'chunk-039'],
    reasoningTrace: ['Embedded the query.', 'Retrieved top semantic neighbors.', 'Packed top chunks by vector score.', 'Generated answer from unreranked context.'],
    promptTemplate: 'Answer with citations using the retrieved chunks. Refuse claims not present in context.',
    timings: { rewrite: 0, vector: 146, bm25: 0, rerank: 0, generation: 774 },
    color: '#27d8ff'
  },
  {
    id: 'hybrid-search',
    name: 'Hybrid Search RAG',
    shortName: 'Hybrid',
    strategy: 'Reciprocal rank fusion across vector similarity and BM25 lexical retrieval.',
    answer: 'Hybrid search performs better when the query contains concrete terms such as reranking, faithfulness, and retrieval confidence. It preserves exact-match evidence while still finding semantically related architecture notes.',
    retrievedChunks: [chunks[0], chunks[1], chunks[2]],
    latencyMs: 1180,
    tokenUsage: 1880,
    estimatedCost: 0.022,
    hallucinationRisk: 0.22,
    retrievalConfidence: 0.84,
    citations: ['chunk-001', 'chunk-014', 'chunk-027'],
    reasoningTrace: ['Ran vector retrieval.', 'Ran BM25 retrieval.', 'Fused ranks with lexical boost.', 'Generated answer from balanced context.'],
    promptTemplate: 'Answer as an evaluator. Prefer cited evidence that appears in both semantic and lexical retrieval.',
    timings: { rewrite: 0, vector: 152, bm25: 96, rerank: 0, generation: 932 },
    color: '#b7ff5a'
  },
  {
    id: 'reranked',
    name: 'Reranked RAG',
    shortName: 'Rerank',
    strategy: 'Broad initial retrieval followed by cross-encoder relevance reranking.',
    answer: 'Reranked RAG is the most grounded for this question. It first collects a wider candidate set, then promotes the chunks with direct evidence about hybrid retrieval, reranking impact, and faithfulness scoring before generation.',
    retrievedChunks: [chunks[1], chunks[0], chunks[2]],
    latencyMs: 1640,
    tokenUsage: 2030,
    estimatedCost: 0.026,
    hallucinationRisk: 0.13,
    retrievalConfidence: 0.91,
    citations: ['chunk-014', 'chunk-001', 'chunk-027'],
    reasoningTrace: ['Retrieved 12 candidates.', 'Scored query-chunk pairs with a cross encoder.', 'Moved policy-specific evidence above generic chunks.', 'Generated with high citation pressure.'],
    promptTemplate: 'Use only the reranked context. Explain uncertainty and cite every material claim.',
    timings: { rewrite: 0, vector: 161, bm25: 88, rerank: 471, generation: 920 },
    color: '#ffb454'
  },
  {
    id: 'agentic',
    name: 'Agentic RAG',
    shortName: 'Agentic',
    strategy: 'Query rewriting, retrieval planning, confidence checks, and targeted retries.',
    answer: 'Agentic RAG gives the richest diagnostic answer. It decomposes the question into architecture, evidence, and tradeoff subqueries, then uses confidence checks to decide whether to retry retrieval before generation.',
    retrievedChunks: [chunks[3], chunks[0], chunks[1]],
    latencyMs: 2320,
    tokenUsage: 2460,
    estimatedCost: 0.034,
    hallucinationRisk: 0.18,
    retrievalConfidence: 0.88,
    citations: ['chunk-039', 'chunk-001', 'chunk-014'],
    reasoningTrace: ['Rewrote the query into three retrieval intents.', 'Selected hybrid retrieval with metadata filtering.', 'Retried when one subquery had low confidence.', 'Synthesized answer with planning trace.'],
    promptTemplate: 'Plan retrieval, gather evidence, validate coverage, then answer with traceable citations.',
    timings: { rewrite: 290, vector: 188, bm25: 112, rerank: 424, generation: 1306 },
    color: '#ff5c8a'
  }
];

export const demoCompare: CompareResponse = {
  query: 'Which RAG architecture performs best for grounded enterprise answers and why?',
  winner: 'reranked',
  results: demoResults,
  evaluation: evaluationMetrics,
  observability: observabilitySnapshot
};

export const latencySeries = [
  { name: 'Vector', retrieval: 146, rerank: 0, generation: 774 },
  { name: 'Hybrid', retrieval: 248, rerank: 0, generation: 932 },
  { name: 'Rerank', retrieval: 249, rerank: 471, generation: 920 },
  { name: 'Agentic', retrieval: 300, rerank: 424, generation: 1306 }
];

export const heatmapRows = chunks.map((chunk, index) => ({
  label: chunk.id,
  vector: Math.round((chunk.vectorScore ?? chunk.score) * 100),
  bm25: Math.round((chunk.bm25Score ?? chunk.score) * 100),
  rerank: Math.round((chunk.rerankScore ?? chunk.score) * 100),
  position: index + 1
}));
