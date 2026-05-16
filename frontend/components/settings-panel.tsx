'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useArenaStore } from '@/store/arena-store';

export function SettingsPanel() {
  const { settings, setSettings } = useArenaStore();

  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-signal" />
        <h2 className="text-lg font-semibold text-white">AI playground</h2>
      </div>
      <div className="mt-5 space-y-5">
        <Control label="Chunk size" value={settings.chunkSize} min={320} max={1400} step={20} onChange={(value) => setSettings({ chunkSize: value })} />
        <Control label="Overlap" value={settings.overlap} min={0} max={260} step={8} onChange={(value) => setSettings({ overlap: value })} />
        <Control label="Top-k" value={settings.topK} min={2} max={12} step={1} onChange={(value) => setSettings({ topK: value })} />
        <Control label="Temperature" value={settings.temperature} min={0} max={1} step={0.05} onChange={(value) => setSettings({ temperature: value })} />
        <div>
          <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Embedding model</label>
          <select value={settings.embeddingModel} onChange={(event) => setSettings({ embeddingModel: event.target.value })} className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none">
            <option>text-embedding-3-large</option>
            <option>text-embedding-3-small</option>
            <option>sentence-transformers/all-mpnet-base-v2</option>
          </select>
        </div>
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-3">
          <span className="text-sm text-slate-300">Cross encoder reranker</span>
          <button onClick={() => setSettings({ rerankerEnabled: !settings.rerankerEnabled })} className={settings.rerankerEnabled ? 'rounded-full bg-signal px-3 py-1 text-xs font-bold text-ink' : 'rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400'}>
            {settings.rerankerEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</label>
        <span className="text-sm font-semibold text-white">{value}</span>
      </div>
      <input className="mt-2 w-full accent-signal" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}
