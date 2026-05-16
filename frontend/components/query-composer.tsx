'use client';

import { Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useArenaStore } from '@/store/arena-store';

export function QueryComposer() {
  const { query, setQuery, runComparison, isRunning } = useArenaStore();

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-lg p-3">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-h-14 flex-1 items-center gap-3 rounded-md border border-white/10 bg-black/25 px-4">
          <Sparkles className="h-5 w-5 text-signal" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void runComparison();
            }}
            className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-600"
            placeholder="Ask the same question across all RAG pipelines..."
          />
        </div>
        <button
          onClick={() => void runComparison()}
          disabled={isRunning}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-white px-5 font-semibold text-ink transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="h-4 w-4" /> {isRunning ? 'Running comparison' : 'Run battle'}
        </button>
      </div>
    </motion.div>
  );
}
