import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { CategoryCard2026 } from '@/components/public-2026/cards/CategoryCard2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type BrowseCategories2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy['categories'] };

export function BrowseCategories2026({ locale, country, copy }: BrowseCategories2026Props) {
  return (
    <section className="dm2026-categories py-10" aria-labelledby="dm2026-categories-title">
      <SectionHeader2026 id="dm2026-categories-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} centered />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.cards.map((card) => (
          <CategoryCard2026 key={card.slug} {...card} href={publicDiscoveryRoute(locale, country, card.slug)} />
        ))}
      </div>
    </section>
  );
}
