'use client';

import { ChevronDown, ChevronUp, CircleDollarSign, Clock, ShieldAlert, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { PipelineResult } from '@/types/rag';
import { MetricPill } from '@/components/metric-pill';
import { useArenaStore } from '@/store/arena-store';

export function PipelineCard({ result, index }: { result: PipelineResult; index: number }) {
  const [expanded, setExpanded] = useState(index < 2);
  const setActivePipeline = useArenaStore((state) => state.setActivePipeline);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-panel signal-border flex min-h-[620px] flex-col rounded-lg p-4"
      style={{ boxShadow: `0 0 42px ${result.color}16` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: result.color }} />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{result.shortName}</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">{result.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{result.strategy}</p>
        </div>
        <button onClick={() => setExpanded((value) => !value)} className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/7" aria-label="Toggle pipeline details">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MetricPill label="Latency" value={result.latencyMs} kind="ms" />
        <MetricPill label="Cost" value={result.estimatedCost} kind="cost" />
        <MetricPill label="Risk" value={result.hallucinationRisk} kind="percent" />
        <MetricPill label="Confidence" value={result.retrievalConfidence} kind="percent" />
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Generated answer</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">{result.answer}</p>
      </div>

      {expanded ? (
        <div className="mt-5 flex-1 space-y-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Retrieved chunks</p>
            <div className="space-y-3">
              {result.retrievedChunks.map((chunk) => (
                <div key={chunk.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">{chunk.title}</p>
                    <span className="rounded-full bg-signal/12 px-2 py-1 text-xs text-signal">{Math.round(chunk.score * 100)}%</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{chunk.text}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-600">{chunk.id} · {chunk.tokens} tokens</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Trace</p>
            <ol className="space-y-2">
              {result.reasoningTrace.map((item, step) => (
                <li key={item} className="flex gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs text-signal">{step + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 text-slate-400">
        <span className="flex items-center gap-1 text-xs"><Clock className="h-3.5 w-3.5" /> {result.timings.generation} ms</span>
        <span className="flex items-center gap-1 text-xs"><Target className="h-3.5 w-3.5" /> {result.tokenUsage}</span>
        <span className="flex items-center gap-1 text-xs"><ShieldAlert className="h-3.5 w-3.5" /> {Math.round(result.hallucinationRisk * 100)}</span>
        <span className="flex items-center gap-1 text-xs"><CircleDollarSign className="h-3.5 w-3.5" /> {result.estimatedCost.toFixed(3)}</span>
      </div>
      <button onClick={() => setActivePipeline(result.id)} className="mt-4 rounded-md border border-signal/35 bg-signal/10 px-3 py-2 text-sm font-semibold text-signal transition hover:bg-signal/18">
        Explain why this answer
      </button>
    </motion.article>
  );
}
