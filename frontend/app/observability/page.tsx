import { ObservabilityDashboard } from '@/components/observability-dashboard';
import { SectionHeader } from '@/components/section-header';

export default function ObservabilityPage() {
  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Runtime telemetry" title="Track the latency, cost, cache, and model timing profile of every RAG strategy." description="Surface production tradeoffs that matter: retrieval timing, embedding latency, token consumption, p95 response time, and cache effectiveness." />
      <ObservabilityDashboard />
    </div>
  );
}
