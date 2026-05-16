from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class TextChunk:
    id: str
    document_id: str
    title: str
    text: str
    position: int
    tokens: int


def estimate_tokens(text: str) -> int:
    return max(1, int(len(text.split()) * 1.32))


def fixed_chunk(text: str, document_id: str, title: str, chunk_size: int = 720, overlap: int = 96) -> list[TextChunk]:
    words = text.split()
    if not words:
        return []
    chunks: list[TextChunk] = []
    step = max(1, chunk_size - overlap)
    for index, start in enumerate(range(0, len(words), step)):
        window = words[start:start + chunk_size]
        if not window:
            break
        content = ' '.join(window)
        chunks.append(TextChunk(f'{document_id}-chunk-{index + 1:03d}', document_id, title, content, index + 1, estimate_tokens(content)))
        if start + chunk_size >= len(words):
            break
    return chunks


def recursive_chunk(text: str, document_id: str, title: str, chunk_size: int = 720, overlap: int = 96) -> list[TextChunk]:
    paragraphs = [part.strip() for part in re.split(r'\n\s*\n', text) if part.strip()]
    packed: list[str] = []
    current: list[str] = []
    current_words = 0
    for paragraph in paragraphs or [text]:
        words = paragraph.split()
        if current and current_words + len(words) > chunk_size:
            packed.append('\n\n'.join(current))
            carry = ' '.join(' '.join(current).split()[-overlap:]) if overlap else ''
            current = [carry] if carry else []
            current_words = len(carry.split())
        current.append(paragraph)
        current_words += len(words)
    if current:
        packed.append('\n\n'.join(current))
    return [TextChunk(f'{document_id}-chunk-{i + 1:03d}', document_id, title, chunk, i + 1, estimate_tokens(chunk)) for i, chunk in enumerate(packed)]


def semantic_chunk(text: str, document_id: str, title: str, chunk_size: int = 720, overlap: int = 48) -> list[TextChunk]:
    sentences = [sentence.strip() for sentence in re.split(r'(?<=[.!?])\s+', text) if sentence.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_words = 0
    for sentence in sentences or [text]:
        words = sentence.split()
        if current and current_words + len(words) > chunk_size:
            chunks.append(' '.join(current))
            current = current[-3:] if overlap else []
            current_words = sum(len(item.split()) for item in current)
        current.append(sentence)
        current_words += len(words)
    if current:
        chunks.append(' '.join(current))
    return [TextChunk(f'{document_id}-chunk-{i + 1:03d}', document_id, title, chunk, i + 1, estimate_tokens(chunk)) for i, chunk in enumerate(chunks)]
