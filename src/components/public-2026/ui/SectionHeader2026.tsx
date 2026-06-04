import { Badge2026 } from '@/components/public-2026/ui/Badge2026';

type SectionHeader2026Props = { eyebrow: string; title: string; subtitle?: string; id?: string; centered?: boolean };

export function SectionHeader2026({ eyebrow, title, subtitle, id, centered = false }: SectionHeader2026Props) {
  return (
    <div className={`dm2026-section-header max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <Badge2026>{eyebrow}</Badge2026>
      <h2 id={id} className="mt-4 text-3xl font-bold tracking-tight text-dm-text sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-base leading-7 text-dm-text-soft sm:text-lg">{subtitle}</p> : null}
    </div>
  );
}
