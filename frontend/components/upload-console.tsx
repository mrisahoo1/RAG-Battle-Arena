'use client';

import { FileText, Loader2, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useArenaStore } from '@/store/arena-store';

const stages = ['Parse', 'Chunk', 'Embed', 'Index'];

export function UploadConsole() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents, uploadProgress, simulateUpload } = useArenaStore();
  const activeStage = Math.min(stages.length - 1, Math.floor(uploadProgress / 25));

  return (
    <section className="glass-panel signal-border rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Corpus</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Document ingestion</h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-signal px-3 py-2 text-sm font-semibold text-ink transition hover:bg-cyan-200"
        >
          <UploadCloud className="h-4 w-4" /> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void simulateUpload(file.name);
          }}
        />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div className="h-full rounded-full bg-signal" animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.35 }} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {stages.map((stage, index) => (
          <div key={stage} className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-2 text-center">
            <p className={index <= activeStage ? 'text-xs font-medium text-signal' : 'text-xs text-slate-500'}>{stage}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 max-h-[260px] space-y-3 overflow-auto pr-1 scrollbar-thin">
        {documents.map((document) => (
          <div key={document.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-white/7 p-2 text-slate-300"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{document.name}</p>
                <p className="mt-1 text-xs text-slate-500">{document.chunkCount} chunks · {document.tokenCount.toLocaleString('en-US')} tokens</p>
              </div>
              {document.status !== 'ready' ? <Loader2 className="h-4 w-4 animate-spin text-signal" /> : <span className="rounded-full bg-lime/12 px-2 py-1 text-xs text-lime">ready</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

