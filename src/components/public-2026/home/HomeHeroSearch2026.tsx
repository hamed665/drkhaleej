import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { Badge2026 } from '@/components/public-2026/ui/Badge2026';
import { SearchHero2026 } from '@/components/public-2026/search/SearchHero2026';

type HomeHeroSearch2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Home2026Copy };

export function HomeHeroSearch2026({ locale, country, copy }: HomeHeroSearch2026Props) {
  return (
    <section className="dm2026-home-hero relative overflow-hidden py-8 sm:py-12 lg:py-16" aria-labelledby="dm2026-home-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(91,190,177,0.22),rgba(201,162,75,0.10)_42%,transparent_72%)] blur-2xl" aria-hidden="true" />
      <div className="mx-auto max-w-5xl text-center">
        <Badge2026 className="mx-auto border-dm-accent-gold/40 bg-dm-bg-warm text-dm-brand-strong">{copy.hero.eyebrow}</Badge2026>
        <h1 id="dm2026-home-title" className="dm2026-hero-title mx-auto mt-4 max-w-4xl text-[2.35rem] font-bold tracking-[-0.035em] text-dm-text sm:text-5xl lg:text-[3.65rem] lg:leading-[1.02]">
          {copy.hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-dm-text-soft sm:text-lg">{copy.hero.subtitle}</p>
      </div>
      <SearchHero2026 locale={locale} country={country} copy={{ hero: copy.hero, location: copy.location }} />
    </section>
  );
}
