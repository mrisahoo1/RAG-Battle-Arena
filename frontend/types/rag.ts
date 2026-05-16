export type PipelineId = 'naive-vector' | 'hybrid-search' | 'reranked' | 'agentic';

export type Chunk = {
  id: string;
  documentId: string;
  title: string;
  text: string;
  score: number;
  bm25Score?: number;
  vectorScore?: number;
  rerankScore?: number;
  position: number;
  tokens: number;
};

export type PipelineResult = {
  id: PipelineId;
  name: string;
  shortName: string;
  strategy: string;
  answer: string;
  retrievedChunks: Chunk[];
  latencyMs: number;
  tokenUsage: number;
  estimatedCost: number;
  hallucinationRisk: number;
  retrievalConfidence: number;
  citations: string[];
  reasoningTrace: string[];
  promptTemplate: string;
  timings: Record<string, number>;
  color: string;
};

export type EvaluationMetric = {
  metric: string;
  naive: number;
  hybrid: number;
  reranked: number;
  agentic: number;
};

export type DocumentRecord = {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  status: 'queued' | 'parsing' | 'chunking' | 'embedding' | 'indexing' | 'ready' | 'failed';
  chunkCount: number;
  tokenCount: number;
  createdAt: string;
};

export type ArenaSettings = {
  chunkSize: number;
  overlap: number;
  embeddingModel: string;
  topK: number;
  temperature: number;
  retrievalMode: 'balanced' | 'precision' | 'recall';
  rerankerEnabled: boolean;
  metadataFilter: string;
};

export type CompareResponse = {
  query: string;
  winner: PipelineId;
  results: PipelineResult[];
  evaluation: EvaluationMetric[];
  observability: ObservabilitySnapshot;
};

export type ObservabilitySnapshot = {
  requests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  tokens: number;
  estimatedCost: number;
  cacheHitRate: number;
  chunkCount: number;
  embeddingMs: number;
  retrievalMs: number;
  rerankMs: number;
  generationMs: number;
};
