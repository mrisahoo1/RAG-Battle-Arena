'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Boxes, Gauge, GitBranch, Radar, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Arena', icon: Swords },
  { href: '/retrieval-lab', label: 'Retrieval Lab', icon: GitBranch },
  { href: '/evaluation', label: 'Evaluation', icon: Radar },
  { href: '/observability', label: 'Observability', icon: Activity },
  { href: '/architecture', label: 'Architecture', icon: Boxes }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-ink/82 px-4 py-5 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-signal/35 bg-signal/12 text-signal shadow-glow">
            <Swords className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.26em] text-slate-400">RAG</span>
            <span className="block text-lg font-semibold text-white">Battle Arena</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/7 hover:text-white',
                  active && 'bg-signal/12 text-white shadow-[inset_2px_0_0_#27d8ff]'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-md border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <Gauge className="h-3.5 w-3.5" /> Live Demo Mode
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">Deterministic local providers keep the arena demoable. Add env vars to connect production models and pgvector.</p>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/82 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold text-white">RAG Battle Arena</Link>
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn('rounded-md p-2 text-slate-400', pathname === item.href && 'bg-signal/15 text-signal')} aria-label={item.label}>
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </header>
      <main className="relative lg:pl-64">
        <div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
