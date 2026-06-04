import Link from 'next/link';
import type { ReactNode } from 'react';

type Button2026Props = { children: ReactNode; href: string; variant?: 'primary' | 'secondary'; className?: string };

export function Button2026({ children, href, variant = 'primary', className = '' }: Button2026Props) {
  const variantClass =
    variant === 'primary'
      ? 'bg-dm-brand text-white shadow-dm-md hover:bg-dm-brand-strong'
      : 'border border-dm-border bg-white text-dm-brand-strong hover:bg-dm-bg-soft';

  return (
    <Link
      href={href}
      className={`dm2026-button inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition ${variantClass} ${className}`}
    >
      {children}
    </Link>
  );
}
