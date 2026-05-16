import { formatCurrency, formatMs } from '@/lib/utils';

export function MetricPill({ label, value, kind = 'text' }: { label: string; value: number | string; kind?: 'text' | 'ms' | 'cost' | 'percent' }) {
  const formatted = kind === 'ms' && typeof value === 'number'
    ? formatMs(value)
    : kind === 'cost' && typeof value === 'number'
      ? formatCurrency(value)
      : kind === 'percent' && typeof value === 'number'
        ? `${Math.round(value * 100)}%`
        : value;

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{formatted}</p>
    </div>
  );
}
