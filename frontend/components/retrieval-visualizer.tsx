'use client';

import { ArrowRight, Layers3 } from 'lucide-react';
import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import type { PipelineResult } from '@/types/rag';
import { ChartShell } from '@/components/chart-shell';
import { heatmapRows } from '@/lib/mock-data';

export function RetrievalVisualizer({ results }: { results: PipelineResult[] }) {
  const scatter = results.flatMap((result, pipelineIndex) =>
    result.retrievedChunks.map((chunk, chunkIndex) => ({
      x: chunk.position,
      y: Math.round(chunk.score * 100),
      z: Math.max(40, chunk.tokens),
      name: `${result.shortName} · ${chunk.id}`,
      pipelineIndex,
      fill: result.color,
      chunkIndex
    }))
  );

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-signal" />
          <h2 className="text-lg font-semibold text-white">Embedding similarity graph</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">Chunk position versus retrieval score across the four architectures.</p>
        <ChartShell className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="x" name="chunk" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis dataKey="y" name="score" stroke="#64748b" tickLine={false} axisLine={false} />
              <ZAxis dataKey="z" range={[70, 340]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#070b12', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
              {results.map((result) => (
                <Scatter key={result.id} name={result.shortName} data={scatter.filter((item) => item.fill === result.color)} fill={result.color} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>
      <div className="glass-panel rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white">Initial retrieval to reranking</h2>
        <div className="mt-5 space-y-4">
          {['Initial retrieval', 'Fusion and filtering', 'Cross encoder rerank', 'Final context'].map((stage, index) => (
            <div key={stage} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-signal">{index + 1}</div>
              <div className="flex-1 rounded-md border border-white/10 bg-black/20 p-3">
                <p className="font-medium text-white">{stage}</p>
                <p className="mt-1 text-sm text-slate-500">{index === 0 ? 'Retrieve a wider candidate pool' : index === 1 ? 'Blend vector and lexical signals' : index === 2 ? 'Promote directly grounded evidence' : 'Pack cited chunks into prompt'}</p>
              </div>
              {index < 3 ? <ArrowRight className="hidden h-4 w-4 text-slate-600 md:block" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Chunk heatmap</p>
          <div className="space-y-2">
            {heatmapRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[70px_1fr_1fr_1fr] items-center gap-2 text-xs">
                <span className="text-slate-500">{row.label}</span>
                <Heat value={row.vector} label="Vector" />
                <Heat value={row.bm25} label="BM25" />
                <Heat value={row.rerank} label="Rerank" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Heat({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative h-8 overflow-hidden rounded-md border border-white/10 bg-white/[0.035]">
      <div className="absolute inset-y-0 left-0 bg-signal/35" style={{ width: `${value}%` }} />
      <span className="relative z-10 flex h-full items-center justify-between px-2 text-slate-200"><span>{label}</span><span>{value}</span></span>
    </div>
  );
}


