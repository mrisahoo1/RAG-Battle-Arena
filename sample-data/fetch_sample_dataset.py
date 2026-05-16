from __future__ import annotations

import urllib.request
from pathlib import Path

DATASETS = [
    {
        "name": "nist-ai-rmf-1.0.pdf",
        "url": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
        "why": "Official AI risk framework with dense governance text and tables."
    },
    {
        "name": "rag-pdf-experience-report.pdf",
        "url": "https://arxiv.org/pdf/2410.15944",
        "why": "RAG from PDFs experience report for ingestion and parsing demonstrations."
    },
    {
        "name": "vdocrag-visually-rich-documents.pdf",
        "url": "https://arxiv.org/pdf/2504.09795",
        "why": "Visually rich document RAG paper with figures and multimodal motivation."
    },
    {
        "name": "rag-survey.pdf",
        "url": "https://arxiv.org/pdf/2407.13193",
        "why": "Broad RAG survey covering retrievers, fusion, reranking, and evaluation."
    }
]


def main() -> None:
    output_dir = Path(__file__).resolve().parent / "downloads"
    output_dir.mkdir(parents=True, exist_ok=True)
    for item in DATASETS:
        target = output_dir / item["name"]
        if target.exists() and target.stat().st_size > 0:
            print(f"skip {target.name} - already downloaded")
            continue
        print(f"download {item['name']} - {item['why']}")
        urllib.request.urlretrieve(item["url"], target)
    print(f"sample dataset ready at {output_dir}")


if __name__ == "__main__":
    main()
