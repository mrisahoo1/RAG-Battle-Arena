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


def seed_demo_corpus() -> None:
    if CHUNKS:
        return
    demo_text = '''Hybrid retrieval combines semantic vector search with sparse lexical matching so exact entities and acronyms survive retrieval. Cross encoder reranking improves grounding by promoting chunks that directly answer the question. Agentic retrieval planners rewrite ambiguous questions into subqueries, select filters, and retry retrieval when confidence falls below threshold. Faithfulness should be scored by checking whether material claims can be traced to retrieved context.'''
    chunks = recursive_chunk(demo_text * 10, 'demo-rag-ops', 'Demo RAG operations corpus', 120, 20)
    CHUNKS.extend(chunks)
    DOCUMENTS.append(DocumentRecord(id='demo-rag-ops', name='Demo RAG operations corpus.txt', type='txt', status='ready', chunkCount=len(chunks), tokenCount=sum(chunk.tokens for chunk in chunks), createdAt=datetime.now(timezone.utc)))


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
