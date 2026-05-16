import { Activity, Boxes, Clock, Coins, Database, Zap } from 'lucide-react';
import type { ObservabilitySnapshot } from '@/types/rag';
import { formatCurrency, formatMs } from '@/lib/utils';

export function ObservabilityStrip({ snapshot }: { snapshot: ObservabilitySnapshot }) {
  const items = [
    { label: 'Requests', value: snapshot.requests.toLocaleString('en-US'), icon: Activity },
    { label: 'Avg latency', value: formatMs(snapshot.avgLatencyMs), icon: Clock },
    { label: 'Token spend', value: snapshot.tokens.toLocaleString('en-US'), icon: Zap },
    { label: 'Est. cost', value: formatCurrency(snapshot.estimatedCost), icon: Coins },
    { label: 'Cache hits', value: `${Math.round(snapshot.cacheHitRate * 100)}%`, icon: Database },
    { label: 'Chunks indexed', value: snapshot.chunkCount.toLocaleString('en-US'), icon: Boxes }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="glass-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
            <item.icon className="h-4 w-4 text-signal" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </section>
  );
}

