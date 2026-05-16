from __future__ import annotations

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ingestion.pipeline import DOCUMENTS, CHUNKS, ingest_upload, seed_demo_corpus
from observability.metrics import snapshot
from rag.pipelines import compare
from rag.schemas import ArenaSettings, CompareResponse, DocumentRecord, QueryRequest, RetrievalDebugRequest

app = FastAPI(title='RAG Battle Arena API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup() -> None:
    seed_demo_corpus()


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': 'rag-battle-arena'}


@app.post('/upload', response_model=DocumentRecord)
async def upload(file: UploadFile = File(...), chunk_strategy: str = Form('recursive'), chunk_size: int = Form(720), overlap: int = Form(96)) -> DocumentRecord:
    return await ingest_upload(file, chunk_strategy, chunk_size, overlap)


@app.post('/query', response_model=CompareResponse)
def query(request: QueryRequest) -> CompareResponse:
    return compare(request.query, request.settings)


@app.post('/compare', response_model=CompareResponse)
def compare_pipelines(request: QueryRequest) -> CompareResponse:
    return compare(request.query, request.settings)


@app.post('/evaluate')
def evaluate(request: QueryRequest) -> dict[str, object]:
    response = compare(request.query, request.settings)
    return {'winner': response.winner, 'evaluation': response.evaluation}


@app.get('/metrics')
def metrics():
    return snapshot(chunk_count=len(CHUNKS))


@app.get('/documents', response_model=list[DocumentRecord])
def documents() -> list[DocumentRecord]:
    seed_demo_corpus()
    return DOCUMENTS


@app.post('/retrieval-debug')
def retrieval_debug(request: RetrievalDebugRequest) -> dict[str, object]:
    response = compare(request.query, request.settings)
    result = next(item for item in response.results if item.id == request.pipeline)
    return {
        'pipeline': result.id,
        'query': request.query,
        'chunks': result.retrievedChunks,
        'trace': result.reasoningTrace,
        'promptTemplate': result.promptTemplate,
        'timings': result.timings,
        'citations': result.citations,
    }
