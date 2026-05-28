import type { ReactNode } from 'react';

type PublicCenterDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PublicCenterDetailSection({ title, description, children }: PublicCenterDetailSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm sm:p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold leading-7 text-slate-950">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
