import type { ReactNode } from 'react';

type Container2026Props = { children: ReactNode; className?: string };

export function Container2026({ children, className = '' }: Container2026Props) {
  return <div className={`dm2026-container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
