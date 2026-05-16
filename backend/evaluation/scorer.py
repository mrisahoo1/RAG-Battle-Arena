from __future__ import annotations

from rag.schemas import EvaluationMetric, PipelineResult


def evaluate(results: list[PipelineResult]) -> list[EvaluationMetric]:
    lookup = {result.id: result for result in results}

    def score(pid: str, metric: str) -> int:
        result = lookup[pid]
        confidence = result.retrievalConfidence * 100
        risk = (1 - result.hallucinationRisk) * 100
        citations = min(100, len(result.citations) * 28)
        if metric == 'Relevance':
            return round(confidence * 0.72 + citations * 0.28)
        if metric == 'Faithfulness':
            return round(risk * 0.7 + citations * 0.3)
        if metric == 'Groundedness':
            return round(risk * 0.62 + confidence * 0.38)
        if metric == 'Precision':
            return round(confidence * 0.55 + risk * 0.45)
        if metric == 'Recall':
            return round(confidence * 0.48 + min(100, len(result.retrievedChunks) * 32) * 0.52)
        return round(risk)

    metrics = ['Relevance', 'Faithfulness', 'Groundedness', 'Precision', 'Recall', 'Risk Control']
    return [EvaluationMetric(metric=metric, naive=score('naive-vector', metric), hybrid=score('hybrid-search', metric), reranked=score('reranked', metric), agentic=score('agentic', metric)) for metric in metrics]


def choose_winner(results: list[PipelineResult]) -> str:
    weighted = sorted(results, key=lambda result: result.retrievalConfidence * 0.48 + (1 - result.hallucinationRisk) * 0.42 - (result.latencyMs / 10000) * 0.1, reverse=True)
    return weighted[0].id
