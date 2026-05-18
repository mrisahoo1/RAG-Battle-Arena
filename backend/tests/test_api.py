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


def test_uploaded_document_is_used_for_grounded_answers():
    audit_text = (
        'Use Case: Audit Control Monitoring. '
        'Application: Continuous audit exception review for finance controls and procurement approvals. '
        'The audit application ranks risky transactions and cites the control evidence used by reviewers.'
    )
    upload = client.post('/upload', files={'file': ('audit-use-case.txt', audit_text.encode('utf-8'), 'text/plain')})
    assert upload.status_code == 200
    document_id = upload.json()['id']

    response = client.post('/compare', json={'query': 'Which use case gives me an application for Audit based use case ?'})
    assert response.status_code == 200
    payload = response.json()
    answers = ' '.join(result['answer'] for result in payload['results'])
    retrieved_document_ids = {chunk['documentId'] for result in payload['results'] for chunk in result['retrievedChunks']}

    assert document_id in retrieved_document_ids
    assert 'Audit Control Monitoring' in answers
    assert 'Continuous audit exception review' in answers
    assert 'It decomposed the request into retrieval intents' not in answers
