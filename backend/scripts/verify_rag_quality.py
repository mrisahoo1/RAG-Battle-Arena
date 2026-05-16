from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient
from api.main import app

QUERIES = [
    ("Which RAG architecture is most grounded for enterprise answers and why?", "reranked"),
    ("How does hybrid retrieval help compared to naive vector search?", "hybrid-search"),
    ("Why does reranking reduce hallucination risk?", "reranked"),
    ("When should agentic RAG be worth the added latency?", "agentic"),
]

REQUIRED_TERMS = {
    "naive-vector": ["semantic", "vector"],
    "hybrid-search": ["lexical", "semantic"],
    "reranked": ["rerank", "ground"],
    "agentic": ["retrieval", "trace"],
}


def pipeline_quality(result: dict) -> dict:
    answer = result["answer"].lower()
    chunks = result["retrievedChunks"]
    required = REQUIRED_TERMS[result["id"]]
    term_hits = sum(1 for term in required if term in answer)
    citation_score = min(1.0, len(result["citations"]) / max(1, len(chunks)))
    chunk_score = min(1.0, len(chunks) / 3)
    confidence = float(result["retrievalConfidence"])
    risk_control = 1 - float(result["hallucinationRisk"])
    trace_score = min(1.0, len(result["reasoningTrace"]) / 4)
    diversity_score = min(1.0, len({chunk["documentId"] for chunk in chunks}) / 2)
    score = round((term_hits / len(required)) * 18 + citation_score * 16 + chunk_score * 16 + confidence * 22 + risk_control * 14 + trace_score * 6 + diversity_score * 8, 2)
    return {
        "score": score,
        "termHits": term_hits,
        "citationCoverage": round(citation_score, 3),
        "chunkCount": len(chunks),
        "documentDiversity": len({chunk["documentId"] for chunk in chunks}),
        "confidence": confidence,
        "hallucinationRisk": result["hallucinationRisk"],
        "latencyMs": result["latencyMs"],
        "tokens": result["tokenUsage"],
        "topChunks": [chunk["id"] for chunk in chunks[:3]],
    }


def main() -> int:
    client = TestClient(app)
    all_reports: list[dict] = []
    failures: list[str] = []

    for query, expected_winner in QUERIES:
        response = client.post("/compare", json={"query": query})
        if response.status_code != 200:
            failures.append(f"{query}: expected 200, got {response.status_code}")
            continue
        payload = response.json()
        report = {"query": query, "winner": payload["winner"], "expectedWinner": expected_winner, "pipelines": {}}
        if payload["winner"] != expected_winner:
            failures.append(f"{query}: expected winner {expected_winner}, got {payload['winner']}")
        all_top_chunks = set()
        for result in payload["results"]:
            quality = pipeline_quality(result)
            all_top_chunks.update(quality["topChunks"])
            report["pipelines"][result["id"]] = {
                "name": result["name"],
                "answer": result["answer"],
                "quality": quality,
                "trace": result["reasoningTrace"],
            }
            if quality["score"] < 76:
                failures.append(f"{query} / {result['id']}: quality score below 76 ({quality['score']})")
            if quality["chunkCount"] < 3:
                failures.append(f"{query} / {result['id']}: expected at least 3 retrieved chunks, got {quality['chunkCount']}")
            if not result["citations"]:
                failures.append(f"{query} / {result['id']}: missing citations")
        if len(all_top_chunks) < 4:
            failures.append(f"{query}: retrieval collapsed to too few distinct chunks ({len(all_top_chunks)})")
        evaluation = payload["evaluation"]
        if len(evaluation) < 6:
            failures.append(f"{query}: expected at least 6 evaluation metrics")
        all_reports.append(report)

    print(json.dumps(all_reports, indent=2))
    if failures:
        print("\nQUALITY FAILURES:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("\nAll RAG response quality checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
