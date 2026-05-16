# RAG Battle Arena Design

## Goal
Build a production-grade RAG observability and evaluation platform that compares four retrieval-augmented generation architectures side-by-side: Naive Vector RAG, Hybrid Search RAG, Reranked RAG, and Agentic RAG.

## Product Experience
The application opens directly into an enterprise AI command center. Users can upload documents, watch ingestion progress, ask one question, and compare four independent RAG pipelines across answer quality, chunks retrieved, latency, cost, confidence, hallucination risk, and retrieval behavior.

## Architecture
The repository is a two-service monorepo.

- `frontend/` contains the Next.js TypeScript app, Tailwind styling, shadcn-style local UI primitives, Framer Motion interactions, Zustand state, and Recharts dashboards.
- `backend/` contains the FastAPI service, ingestion pipeline, retrieval engines, reranker, evaluation metrics, observability store, and API routers.
- `docker-compose.yml` runs PostgreSQL with pgvector, the backend, and the frontend for local production simulation.

The frontend deploys to Vercel. The backend deploys separately to Railway or Render because FastAPI document parsing, embeddings, reranking models, and long ingestion jobs are not a strong fit for Vercel serverless execution.

## Backend Behavior
The backend includes deterministic demo providers that work without paid keys. When environment variables are present, the code path can be connected to OpenAI embeddings/completions and PostgreSQL/pgvector storage. This keeps the public demo usable while still demonstrating production-ready integration boundaries.

## Core Pages
- Arena: upload, ingestion timeline, four-pipeline comparison, answer cards, why-this-answer drawer.
- Retrieval Lab: chunk explorer, retrieval path visualization, similarity graph, reranking explanation, heatmaps.
- Evaluation: radar charts, metric comparison, overall winner.
- Observability: latency, token cost, cache hits, timing breakdowns, chunk count, model timing.
- Architecture: animated SVG diagrams for ingestion, retrieval, reranking, and agentic flow.

## API Contract
The backend exposes:
- `POST /upload`
- `POST /query`
- `POST /compare`
- `POST /evaluate`
- `GET /metrics`
- `GET /documents`
- `POST /retrieval-debug`

## Quality Bar
The UI should feel like premium enterprise observability software, not a tutorial chatbot. The implementation must include real state, API contracts, mock/demo data, diagrams, Docker support, deployment configs, and a recruiter-grade README.
