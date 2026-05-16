from __future__ import annotations

from pathlib import Path


def parse_document(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == '.txt':
        return path.read_text(encoding='utf-8', errors='ignore')
    if suffix == '.pdf':
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError('PDF parsing requires pypdf. Install backend requirements.') from exc
        reader = PdfReader(str(path))
        return '\n\n'.join(page.extract_text() or '' for page in reader.pages)
    if suffix == '.docx':
        try:
            from docx import Document
        except ImportError as exc:
            raise RuntimeError('DOCX parsing requires python-docx. Install backend requirements.') from exc
        document = Document(str(path))
        return '\n\n'.join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
    raise ValueError(f'Unsupported file type: {suffix}')
