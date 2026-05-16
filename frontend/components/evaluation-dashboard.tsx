'use client';

import { Award, ShieldCheck } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from 'recharts';
import { demoCompare } from '@/lib/mock-data';
import { ChartShell } from '@/components/chart-shell';

export function EvaluationDashboard() {
  const { evaluation, results, winner } = demoCompare;
  const winnerResult = results.find((result) => result.id === winner)!;
  const bars = results.map((result) => ({
    name: result.shortName,
    confidence: Math.round(result.retrievalConfidence * 100),
    risk: Math.round(result.hallucinationRisk * 100),
    latency: Math.round(result.latencyMs / 25)
  }));

  return (
    <div className="space-y-5">
      <section className="glass-panel signal-border rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-signal">Evaluation winner</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{winnerResult.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Highest combined groundedness, faithfulness, precision, and hallucination-risk control for the current corpus.</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-signal/30 bg-signal/12 text-signal shadow-glow">
            <Award className="h-8 w-8" />
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-lg p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-signal" />
            <h2 className="text-lg font-semibold text-white">LLM-as-judge radar</h2>
          </div>
          <ChartShell className="mt-5 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={evaluation}>
                <PolarGrid stroke="rgba(148,163,184,.2)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#070b12', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                <Radar name="Vector" dataKey="naive" stroke="#27d8ff" fill="#27d8ff" fillOpacity={0.12} />
                <Radar name="Hybrid" dataKey="hybrid" stroke="#b7ff5a" fill="#b7ff5a" fillOpacity={0.10} />
                <Radar name="Rerank" dataKey="reranked" stroke="#ffb454" fill="#ffb454" fillOpacity={0.10} />
                <Radar name="Agentic" dataKey="agentic" stroke="#ff5c8a" fill="#ff5c8a" fillOpacity={0.10} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartShell>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Risk, confidence, latency</h2>
          <ChartShell className="mt-5 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars}>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#070b12', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                <Bar dataKey="confidence" fill="#27d8ff" radius={[5, 5, 0, 0]} />
                <Bar dataKey="risk" fill="#ff5c8a" radius={[5, 5, 0, 0]} />
                <Bar dataKey="latency" fill="#ffb454" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>
        </div>
      </section>
    </div>
  );
}


