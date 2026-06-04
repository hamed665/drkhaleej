import type { ReactNode } from 'react';

type Badge2026Props = { children: ReactNode; className?: string };

export function Badge2026({ children, className = '' }: Badge2026Props) {
  return (
    <span className={`dm2026-badge inline-flex w-fit items-center rounded-full border border-dm-border bg-white/80 px-3 py-1 text-xs font-semibold text-dm-brand-strong shadow-dm-sm ${className}`}>
      {children}
    </span>
  );
}
