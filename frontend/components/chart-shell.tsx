'use client';

import { useEffect, useState } from 'react';

export function ChartShell({ className, children }: { className: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={className}>
      {mounted ? children : <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-white/10 bg-white/[0.025] text-sm text-slate-500">Preparing chart telemetry</div>}
    </div>
  );
}
