import { Card2026 } from '@/components/public-2026/ui/Card2026';

type ArticleCard2026Props = { title: string; description: string; label: string };

export function ArticleCard2026({ title, description, label }: ArticleCard2026Props) {
  return (
    <Card2026 className="h-full bg-dm-bg-warm/90">
      <span className="rounded-full bg-[var(--dm-gold-100)] px-3 py-1 text-xs font-bold text-[var(--dm-gold-700)]">{label}</span>
      <h3 className="mt-4 text-xl font-bold text-dm-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-dm-text-soft">{description}</p>
    </Card2026>
  );
}
