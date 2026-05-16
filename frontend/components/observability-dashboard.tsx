'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { latencySeries, observabilitySnapshot } from '@/lib/mock-data';
import { ObservabilityStrip } from '@/components/observability-strip';
import { ChartShell } from '@/components/chart-shell';

const timeline = [
  { t: '09:00', latency: 980, tokens: 9400, cache: 22 },
  { t: '10:00', latency: 1260, tokens: 18200, cache: 29 },
  { t: '11:00', latency: 1430, tokens: 25100, cache: 31 },
  { t: '12:00', latency: 1190, tokens: 21900, cache: 42 },
  { t: '13:00', latency: 1680, tokens: 30100, cache: 37 },
  { t: '14:00', latency: 1320, tokens: 28600, cache: 44 }
];

export function ObservabilityDashboard() {
  return (
    <div className="space-y-5">
      <ObservabilityStrip snapshot={observabilitySnapshot} />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Latency and token consumption</h2>
          <ChartShell className="mt-5 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
                <XAxis dataKey="t" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#070b12', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="latency" stroke="#27d8ff" fill="#27d8ff" fillOpacity={0.15} />
                <Area type="monotone" dataKey="tokens" stroke="#ffb454" fill="#ffb454" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartShell>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Pipeline timing breakdown</h2>
          <ChartShell className="mt-5 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencySeries}>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#070b12', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                <Bar dataKey="retrieval" stackId="a" fill="#27d8ff" radius={[0, 0, 4, 4]} />
                <Bar dataKey="rerank" stackId="a" fill="#ffb454" />
                <Bar dataKey="generation" stackId="a" fill="#b7ff5a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>
        </div>
      </section>
    </div>
  );
}


