import Link from 'next/link';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';

type SearchQuickLinks2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy['hero'] };

export function SearchQuickLinks2026({ locale, country, copy }: SearchQuickLinks2026Props) {
  return (
    <div className="dm2026-quick-links" aria-label={copy.quickLinksLabel}>
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {copy.chips.map((chip) => (
          <Link
            key={chip.slug}
            href={publicDiscoveryRoute(locale, country, chip.slug)}
            className="dm2026-chip shrink-0 rounded-full border border-dm-border bg-white/90 px-4 py-2 text-sm font-bold text-dm-brand-strong shadow-dm-sm transition hover:bg-dm-bg-soft"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
