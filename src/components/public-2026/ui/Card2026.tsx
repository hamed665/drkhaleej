import type { ReactNode } from 'react';

type Card2026Props = { children: ReactNode; className?: string };

export function Card2026({ children, className = '' }: Card2026Props) {
  return (
    <div className={`dm2026-card rounded-[1.75rem] border border-dm-border bg-white/85 p-5 shadow-dm-sm backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
