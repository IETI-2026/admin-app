import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, rightSlot, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-indigo-100/40 backdrop-blur-sm">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </header>
      {children}
    </section>
  );
}
