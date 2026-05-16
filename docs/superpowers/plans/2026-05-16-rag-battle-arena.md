# RAG Battle Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete RAG comparison platform with a premium Next.js frontend, FastAPI backend, Docker support, and deployment documentation.

**Architecture:** Two-service monorepo. The frontend renders the interactive arena and dashboards; the backend owns ingestion, retrieval simulation, evaluation, and observability APIs. Demo providers make the app usable without paid keys, while env vars enable production integrations.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Framer Motion, Zustand, Recharts, FastAPI, Python 3.11, LangChain-compatible boundaries, BM25, reranking abstractions, PostgreSQL/pgvector, Docker, Vercel, Railway/Render.

---

### Task 1: Documentation Artifacts
**Files:**
- Create: `docs/superpowers/specs/2026-05-16-rag-battle-arena-design.md`
- Create: `docs/superpowers/plans/2026-05-16-rag-battle-arena.md`

- [x] Capture approved design, architecture, APIs, deployment decision, and quality bar.
- [x] Capture task-level implementation plan.

### Task 2: Frontend Shell
**Files:**
- Create: `frontend/package.json`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`
- Create: `frontend/app/globals.css`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/next.config.mjs`

- [ ] Build the dark command-center layout and app routes.
- [ ] Configure Tailwind, Next.js, TypeScript, and lint scripts.

### Task 3: Frontend Components and State
**Files:**
- Create: `frontend/components/*`
- Create: `frontend/store/arena-store.ts`
- Create: `frontend/services/api.ts`
- Create: `frontend/types/rag.ts`

- [ ] Implement upload rail, comparison cards, visualizations, settings, and why-answer drawer.
- [ ] Use deterministic fallback demo data when the backend is unavailable.

### Task 4: Backend Service
**Files:**
- Create: `backend/api/main.py`
- Create: `backend/rag/*`
- Create: `backend/ingestion/*`
- Create: `backend/retrieval/*`
- Create: `backend/reranker/*`
- Create: `backend/evaluation/*`
- Create: `backend/observability/*`

- [ ] Implement ingestion, retrieval, reranking, evaluation, metrics, and debug endpoints.
- [ ] Keep model/database providers swappable via env vars.

### Task 5: Deployment and Docs
**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `railway.toml`
- Create: `render.yaml`
- Create: `frontend/vercel.json`
- Create: `.env.example`
- Create: `README.md`

- [ ] Document architecture, setup, deployment, APIs, roadmap, and screenshots guidance.
- [ ] Provide local and cloud deployment paths.

### Task 6: Verification and Deploy
**Files:**
- Modify as needed after build checks.

- [ ] Install dependencies if needed.
- [ ] Run frontend build and backend syntax checks.
- [ ] Commit and push.
- [ ] Deploy frontend preview to Vercel using the vercel-deploy skill.
