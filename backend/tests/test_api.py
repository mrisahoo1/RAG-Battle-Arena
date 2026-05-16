from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_documents_endpoint_seeds_demo_corpus():
    response = client.get('/documents')
    assert response.status_code == 200
    documents = response.json()
    assert len(documents) >= 1
    assert documents[0]['status'] == 'ready'
    assert documents[0]['chunkCount'] > 0


def test_compare_returns_four_pipelines_and_metrics():
    response = client.post('/compare', json={'query': 'Which RAG architecture is most grounded and why?'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['query'] == 'Which RAG architecture is most grounded and why?'
    assert len(payload['results']) == 4
    assert {item['id'] for item in payload['results']} == {'naive-vector', 'hybrid-search', 'reranked', 'agentic'}
    assert payload['winner'] in {'naive-vector', 'hybrid-search', 'reranked', 'agentic'}
    assert len(payload['evaluation']) >= 6
    for result in payload['results']:
        assert result['answer']
        assert result['retrievedChunks']
        assert result['latencyMs'] > 0
        assert result['tokenUsage'] > 0
        assert result['citations']


def test_retrieval_debug_returns_trace_for_selected_pipeline():
    response = client.post('/retrieval-debug', json={'query': 'Explain reranking', 'pipeline': 'reranked'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['pipeline'] == 'reranked'
    assert payload['chunks']
    assert payload['trace']
    assert payload['promptTemplate']


def test_metrics_endpoint_returns_observability_snapshot():
    response = client.get('/metrics')
    assert response.status_code == 200
    payload = response.json()
    assert payload['requests'] >= 1
    assert payload['avgLatencyMs'] > 0
    assert payload['chunkCount'] > 0
