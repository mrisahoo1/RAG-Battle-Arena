import { demoCompare, demoDocuments, observabilitySnapshot } from '@/lib/mock-data';
import type { ArenaSettings, CompareResponse, DocumentRecord, ObservabilitySnapshot } from '@/types/rag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiError = Error & { status?: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw Object.assign(new Error('Backend URL is not configured'), { status: 0 }) as ApiError;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const error = Object.assign(new Error(`Request failed: ${response.status}`), { status: response.status }) as ApiError;
    throw error;
  }

  return response.json() as Promise<T>;
}

export async function comparePipelines(query: string, settings: ArenaSettings): Promise<CompareResponse> {
  try {
    return await request<CompareResponse>('/compare', {
      method: 'POST',
      body: JSON.stringify({ query, settings })
    });
  } catch {
    return {
      ...demoCompare,
      query,
      results: demoCompare.results.map((result, index) => ({
        ...result,
        latencyMs: result.latencyMs + index * 37 + Math.floor(query.length * 1.8),
        tokenUsage: result.tokenUsage + Math.min(320, query.length * 8)
      }))
    };
  }
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  try {
    return await request<DocumentRecord[]>('/documents');
  } catch {
    return demoDocuments;
  }
}

export async function fetchMetrics(): Promise<ObservabilitySnapshot> {
  try {
    return await request<ObservabilitySnapshot>('/metrics');
  } catch {
    return observabilitySnapshot;
  }
}
