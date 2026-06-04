import Link from 'next/link';

type AreaCard2026Props = { title: string; href: string; label: string };

export function AreaCard2026({ title, href, label }: AreaCard2026Props) {
  return (
    <Link href={href} className="dm2026-area-card rounded-[1.5rem] border border-dm-border bg-white/85 p-5 text-inherit no-underline shadow-dm-sm transition hover:-translate-y-1 hover:shadow-dm-md">
      <span className="text-sm font-bold text-dm-accent-gold">{label}</span>
      <h3 className="mt-2 text-xl font-bold text-dm-text">{title}</h3>
    </Link>
  );
}
