import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { ProviderPreviewCard2026 } from '@/components/public-2026/cards/ProviderPreviewCard2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type FeaturedProviders2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy['featured'] };

export function FeaturedProviders2026({ locale, country, copy }: FeaturedProviders2026Props) {
  return (
    <section className="dm2026-featured py-10" aria-labelledby="dm2026-featured-title">
      <SectionHeader2026 id="dm2026-featured-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {copy.cards.map((card) => (
          <ProviderPreviewCard2026 key={card.title} {...card} href={publicDiscoveryRoute(locale, country, card.slug)} />
        ))}
      </div>
    </section>
  );
}
