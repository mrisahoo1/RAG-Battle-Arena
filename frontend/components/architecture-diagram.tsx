'use client';

import { motion } from 'framer-motion';

const flows = [
  { title: 'Ingestion flow', steps: ['Upload', 'Parse', 'Chunk', 'Embed', 'pgvector'] },
  { title: 'Retrieval flow', steps: ['Question', 'Vector', 'BM25', 'Fusion', 'Context'] },
  { title: 'Reranking flow', steps: ['Candidates', 'Cross encoder', 'Rank delta', 'Final top-k'] },
  { title: 'Agentic flow', steps: ['Rewrite', 'Plan', 'Retrieve', 'Validate', 'Answer'] }
];

export function ArchitectureDiagram() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {flows.map((flow, flowIndex) => (
        <section key={flow.title} className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">{flow.title}</h2>
          <div className="mt-6 overflow-x-auto pb-2">
            <svg width="720" height="180" viewBox="0 0 720 180" className="min-w-[720px]">
              <defs>
                <linearGradient id={`g-${flowIndex}`} x1="0" x2="1">
                  <stop offset="0" stopColor="#27d8ff" />
                  <stop offset="1" stopColor="#b7ff5a" />
                </linearGradient>
              </defs>
              {flow.steps.map((step, index) => {
                const x = 36 + index * 135;
                return (
                  <g key={step}>
                    {index < flow.steps.length - 1 ? (
                      <motion.path
                        d={`M ${x + 92} 90 C ${x + 116} 90, ${x + 118} 90, ${x + 135} 90`}
                        stroke={`url(#g-${flowIndex})`}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="6 8"
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', delay: index * 0.15 }}
                      />
                    ) : null}
                    <motion.rect
                      x={x}
                      y="48"
                      width="96"
                      height="84"
                      rx="8"
                      fill="rgba(255,255,255,.04)"
                      stroke="rgba(255,255,255,.16)"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: flowIndex * 0.08 + index * 0.08 }}
                    />
                    <text x={x + 48} y="94" fill="#eef6ff" fontSize="13" textAnchor="middle" dominantBaseline="middle">{step}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>
      ))}
    </div>
  );
}
