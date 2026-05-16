'use client';

import { GitCompare, Network, Search } from 'lucide-react';
import { demoCompare, heatmapRows } from '@/lib/mock-data';
import { RetrievalVisualizer } from '@/components/retrieval-visualizer';

export function RetrievalLab() {
  const chunks = demoCompare.results.flatMap((result) => result.retrievedChunks.map((chunk) => ({ ...chunk, pipeline: result.shortName, color: result.color })));

  return (
    <div className="space-y-5">
      <RetrievalVisualizer results={demoCompare.results} />
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-lg p-5">
          <div className="flex items-center gap-2"><Search className="h-4 w-4 text-signal" /><h2 className="text-lg font-semibold text-white">Chunk explorer</h2></div>
          <div className="mt-5 space-y-3">
            {chunks.slice(0, 8).map((chunk) => (
              <div key={`${chunk.pipeline}-${chunk.id}`} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{chunk.title}</p>
                  <span className="rounded-full px-2 py-1 text-xs" style={{ color: chunk.color, backgroundColor: `${chunk.color}18` }}>{chunk.pipeline}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{chunk.text}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <span>Vector {(chunk.vectorScore ?? chunk.score).toFixed(2)}</span>
                  <span>BM25 {(chunk.bm25Score ?? chunk.score).toFixed(2)}</span>
                  <span>Rerank {(chunk.rerankScore ?? chunk.score).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <div className="flex items-center gap-2"><GitCompare className="h-4 w-4 text-signal" /><h2 className="text-lg font-semibold text-white">Reranking explanation</h2></div>
          <div className="mt-5 space-y-4">
            {heatmapRows.map((row, index) => (
              <div key={row.label} className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{row.label}</p>
                  <span className="text-xs text-slate-500">rank delta {index === 0 ? '+2' : index === 1 ? '+5' : '-1'}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-signal" style={{ width: `${row.rerank}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">The reranker promotes this chunk when direct query-to-evidence alignment beats broad semantic similarity.</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-signal/25 bg-signal/8 p-4">
            <div className="flex items-center gap-2 text-signal"><Network className="h-4 w-4" /><p className="font-semibold">Retrieval insight</p></div>
            <p className="mt-2 text-sm leading-6 text-slate-300">Hybrid retrieval improves recall, but reranking improves the final context contract by reducing irrelevant-but-similar chunks before generation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
