from __future__ import annotations

import shutil
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile
from rag.schemas import DocumentRecord
from ingestion.chunker import fixed_chunk, recursive_chunk, semantic_chunk, TextChunk, estimate_tokens
from ingestion.parser import parse_document

UPLOAD_DIR = Path(__file__).resolve().parents[2] / 'data' / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DOCUMENTS: list[DocumentRecord] = []
CHUNKS: list[TextChunk] = []

DEMO_CHUNKS = [
    ('demo-rag-ops', 'Retrieval architecture decision memo', 'Hybrid retrieval combines semantic vector search with sparse lexical matching so exact entities, IDs, error codes, and acronyms are not lost during embedding lookup. The practical benefit is better recall than BM25 alone and better precision than dense-only retrieval when user questions contain operational terms.'),
    ('demo-rag-ops', 'Naive vector retrieval baseline', 'Naive vector RAG embeds the user query and retrieves the nearest chunks by cosine similarity. It is fast and simple, but broad semantic matches can crowd out exact evidence, which raises hallucination risk for compliance, legal, and support workflows.'),
    ('demo-rag-ops', 'Reranking incident analysis', 'Cross encoder reranking improved groundedness for policy questions by moving directly relevant evidence above broad conceptual chunks. The reranker compares the query and candidate chunk together, so final context is more precise before generation.'),
    ('demo-rag-ops', 'Agentic retrieval planner', 'The agentic planner rewrites ambiguous questions into subqueries, selects retrieval strategies, applies metadata filters, and retries when confidence is below threshold. It is useful when the question has multiple intents or needs a diagnostic trace.'),
    ('demo-eval', 'Evaluation rubric', 'Faithfulness is scored by checking whether every material answer claim can be traced to retrieved context and citations. Groundedness penalizes unsupported synthesis, while answer relevance checks whether the response directly resolves the user question.'),
    ('demo-eval', 'Retrieval precision and recall', 'Retrieval precision measures the share of selected chunks that are actually useful. Retrieval recall estimates whether the relevant evidence in the corpus was found. Hybrid retrieval usually improves recall, while reranking improves precision.'),
    ('demo-obs', 'Latency and cost tradeoffs', 'Naive vector retrieval has the lowest latency. Hybrid search adds sparse retrieval and rank fusion. Reranked RAG adds cross encoder cost. Agentic RAG adds query rewriting, planning, retries, and validation, so it should be reserved for high-value ambiguous requests.'),
    ('demo-obs', 'Production observability', 'Production RAG systems should expose embedding time, retrieval time, reranking time, generation time, token usage, estimated cost, cache hits, selected chunks, confidence, and hallucination risk for every request.'),
    ('demo-ingestion', 'Chunking strategies', 'Fixed chunking is predictable but can split concepts. Recursive chunking preserves paragraph structure. Semantic chunking attempts to keep related sentences together, improving citation quality and reducing context fragmentation.'),
    ('demo-ingestion', 'Document ingestion pipeline', 'A robust ingestion pipeline parses PDFs, DOCX, and TXT files, chunks text, generates embeddings, stores metadata, indexes vectors, and reports progress for parsing, chunking, embedding, and indexing stages.'),
]


def seed_demo_corpus() -> None:
    if CHUNKS:
        return
    document_counts: dict[str, int] = {}
    token_counts: dict[str, int] = {}
    for index, (document_id, title, text) in enumerate(DEMO_CHUNKS, start=1):
        chunk = TextChunk(
            id=f'{document_id}-chunk-{index:03d}',
            document_id=document_id,
            title=title,
            text=text,
            position=index,
            tokens=estimate_tokens(text),
        )
        CHUNKS.append(chunk)
        document_counts[document_id] = document_counts.get(document_id, 0) + 1
        token_counts[document_id] = token_counts.get(document_id, 0) + chunk.tokens
    names = {
        'demo-rag-ops': 'Demo RAG architecture operations.txt',
        'demo-eval': 'Demo evaluation rubric.txt',
        'demo-obs': 'Demo observability and tradeoffs.txt',
        'demo-ingestion': 'Demo ingestion pipeline.txt',
    }
    for document_id, name in names.items():
        DOCUMENTS.append(DocumentRecord(id=document_id, name=name, type='txt', status='ready', chunkCount=document_counts[document_id], tokenCount=token_counts[document_id], createdAt=datetime.now(timezone.utc)))


async def ingest_upload(file: UploadFile, chunk_strategy: str = 'recursive', chunk_size: int = 720, overlap: int = 96) -> DocumentRecord:
    document_id = f'doc-{uuid4().hex[:10]}'
    suffix = Path(file.filename or 'upload.txt').suffix.lower() or '.txt'
    target = UPLOAD_DIR / f'{document_id}{suffix}'
    with target.open('wb') as handle:
        shutil.copyfileobj(file.file, handle)

    text = parse_document(target)
    if chunk_strategy == 'fixed':
        chunks = fixed_chunk(text, document_id, file.filename or target.name, chunk_size, overlap)
    elif chunk_strategy == 'semantic':
        chunks = semantic_chunk(text, document_id, file.filename or target.name, chunk_size, overlap)
    else:
        chunks = recursive_chunk(text, document_id, file.filename or target.name, chunk_size, overlap)

    CHUNKS.extend(chunks)
    record = DocumentRecord(
        id=document_id,
        name=file.filename or target.name,
        type='pdf' if suffix == '.pdf' else 'docx' if suffix == '.docx' else 'txt',
        status='ready',
        chunkCount=len(chunks),
        tokenCount=sum(estimate_tokens(chunk.text) for chunk in chunks),
        createdAt=datetime.now(timezone.utc),
    )
    DOCUMENTS.insert(0, record)
    return record
