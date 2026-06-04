import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { AreaCard2026 } from '@/components/public-2026/cards/AreaCard2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type BrowseAreas2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy['areas'] };

export function BrowseAreas2026({ locale, country, copy }: BrowseAreas2026Props) {
  const searchHref = publicDiscoveryRoute(locale, country, 'search');

  return (
    <section className="dm2026-areas py-10" aria-labelledby="dm2026-areas-title">
      <SectionHeader2026 id="dm2026-areas-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.areas.map((area) => <AreaCard2026 key={area} title={area} href={searchHref} label={copy.exploreLabel} />)}
      </div>
    </section>
  );
}
