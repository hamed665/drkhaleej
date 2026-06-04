import Link from 'next/link';
import { Card2026 } from '@/components/public-2026/ui/Card2026';

type CategoryCard2026Props = { title: string; description: string; href: string; tone: 'teal' | 'mint' | 'gold' | 'blue' };

const toneClass = { teal: 'bg-dm-brand', mint: 'bg-[var(--dm-brand-mint)]', gold: 'bg-dm-accent-gold', blue: 'bg-[var(--dm-brand-aqua)]' } as const;

export function CategoryCard2026({ title, description, href, tone }: CategoryCard2026Props) {
  return (
    <Link href={href} className="dm2026-category-link block h-full text-inherit no-underline">
      <Card2026 className="h-full transition hover:-translate-y-1 hover:shadow-dm-md">
        <span className={`mb-5 block h-12 w-12 rounded-2xl ${toneClass[tone]}`} aria-hidden="true" />
        <h3 className="text-xl font-bold text-dm-text">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-dm-text-soft">{description}</p>
      </Card2026>
    </Link>
  );
}
