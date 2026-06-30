import type { ReactNode } from 'react';

type PublicCenterDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PublicCenterDetailSection({ title, description, children }: PublicCenterDetailSectionProps) {
  return (
    <section className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/30 p-4 shadow-[0_18px_50px_rgba(15,118,110,0.08)] ring-1 ring-white/80 sm:p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold leading-7 tracking-[-0.01em] text-slate-950 sm:text-xl">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px]">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
