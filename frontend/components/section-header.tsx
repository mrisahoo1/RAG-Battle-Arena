export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal">{eyebrow}</p>
      <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">{description}</p> : null}
    </div>
  );
}
