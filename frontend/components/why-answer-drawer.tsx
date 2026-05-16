'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useArenaStore } from '@/store/arena-store';

export function WhyAnswerDrawer() {
  const { activePipeline, setActivePipeline, comparison } = useArenaStore();
  const result = comparison.results.find((item) => item.id === activePipeline);

  return (
    <AnimatePresence>
      {result ? (
        <motion.div className="fixed inset-0 z-50 bg-black/62 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 240 }}
            className="ml-auto h-full w-full max-w-2xl overflow-auto border-l border-white/10 bg-[#070b12] p-6 shadow-panel scrollbar-thin"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-signal">Why this answer?</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{result.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">This trace shows the context, prompt, decisions, and cost profile that produced the answer.</p>
              </div>
              <button onClick={() => setActivePipeline(null)} className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/7" aria-label="Close explanation">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h3 className="font-semibold text-white">Prompt template</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-md bg-black/35 p-4 text-sm leading-6 text-slate-300">{result.promptTemplate}</pre>
              </section>
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h3 className="font-semibold text-white">Reasoning trace</h3>
                <div className="mt-4 space-y-3">
                  {result.reasoningTrace.map((trace, index) => (
                    <div key={trace} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/12 text-xs text-signal">{index + 1}</span>
                      <p className="text-sm leading-6 text-slate-300">{trace}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h3 className="font-semibold text-white">Retrieved context</h3>
                <div className="mt-4 space-y-3">
                  {result.retrievedChunks.map((chunk) => (
                    <div key={chunk.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{chunk.title}</p>
                        <span className="text-xs text-signal">score {chunk.score.toFixed(2)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{chunk.text}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h3 className="font-semibold text-white">Timing breakdown</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(result.timings).map(([key, value]) => (
                    <div key={key} className="rounded-md border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{value} ms</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
