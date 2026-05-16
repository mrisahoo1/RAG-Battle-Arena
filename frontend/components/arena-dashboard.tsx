'use client';

import { useEffect } from 'react';
import { SectionHeader } from '@/components/section-header';
import { UploadConsole } from '@/components/upload-console';
import { QueryComposer } from '@/components/query-composer';
import { PipelineCard } from '@/components/pipeline-card';
import { RetrievalVisualizer } from '@/components/retrieval-visualizer';
import { SettingsPanel } from '@/components/settings-panel';
import { ObservabilityStrip } from '@/components/observability-strip';
import { WhyAnswerDrawer } from '@/components/why-answer-drawer';
import { useArenaStore } from '@/store/arena-store';

export function ArenaDashboard() {
  const { comparison, hydrateDocuments } = useArenaStore();

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="glass-panel signal-border rounded-lg p-6 md:p-8">
          <SectionHeader
            eyebrow="Enterprise RAG observability"
            title="Compare retrieval architectures side-by-side, with evidence instead of vibes."
            description="Upload a corpus, ask one question, and watch four independent RAG pipelines expose their chunks, citations, reranking decisions, latency, cost, and risk profile."
          />
          <div className="mt-8">
            <QueryComposer />
          </div>
        </div>
        <UploadConsole />
      </section>

      <ObservabilityStrip snapshot={comparison.observability} />

      <section className="grid gap-4 xl:grid-cols-[1fr_310px]">
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {comparison.results.map((result, index) => <PipelineCard key={result.id} result={result} index={index} />)}
        </div>
        <SettingsPanel />
      </section>

      <RetrievalVisualizer results={comparison.results} />
      <WhyAnswerDrawer />
    </div>
  );
}
