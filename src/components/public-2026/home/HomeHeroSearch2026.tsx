import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { Badge2026 } from '@/components/public-2026/ui/Badge2026';
import { SearchHero2026 } from '@/components/public-2026/search/SearchHero2026';

type HomeHeroSearch2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy };

export function HomeHeroSearch2026({ locale, country, copy }: HomeHeroSearch2026Props) {
  return (
    <section className="dm2026-home-hero overflow-hidden py-10 sm:py-14 lg:py-16" aria-labelledby="dm2026-home-title">
      <div className="mx-auto max-w-5xl text-center">
        <Badge2026 className="mx-auto border-dm-accent-gold/40 bg-dm-bg-warm text-dm-brand-strong">{copy.hero.eyebrow}</Badge2026>
        <h1 id="dm2026-home-title" className="mt-5 text-4xl font-extrabold tracking-tight text-dm-text sm:text-5xl lg:text-6xl">
          {copy.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-dm-text-soft sm:text-xl">{copy.hero.subtitle}</p>
      </div>
      <SearchHero2026 locale={locale} country={country} copy={{ hero: copy.hero, location: copy.location }} />
    </section>
  );
}
