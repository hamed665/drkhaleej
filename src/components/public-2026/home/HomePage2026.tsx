import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { localeDirection } from '@/lib/i18n/config';
import { publicProviderRoute } from '@/lib/routes/public';
import { BrowseAreas2026 } from '@/components/public-2026/sections/BrowseAreas2026';
import { BrowseCategories2026 } from '@/components/public-2026/sections/BrowseCategories2026';
import { FaqSection2026 } from '@/components/public-2026/sections/FaqSection2026';
import { FeaturedCentersCarousel2026 } from '@/components/public-2026/sections/FeaturedCentersCarousel2026';
import { FeaturedProviders2026 } from '@/components/public-2026/sections/FeaturedProviders2026';
import { HomeArticles2026 } from '@/components/public-2026/sections/HomeArticles2026';
import { PublicDisclaimer2026 } from '@/components/public-2026/sections/PublicDisclaimer2026';
import { TrustAndSafety2026 } from '@/components/public-2026/sections/TrustAndSafety2026';
import { Button2026 } from '@/components/public-2026/ui/Button2026';
import { Container2026 } from '@/components/public-2026/ui/Container2026';
import { FloatingActions2026 } from '@/components/public-2026/home/FloatingActions2026';
import { HomeHeroSearch2026 } from '@/components/public-2026/home/HomeHeroSearch2026';
import { HomeTrustBar2026 } from '@/components/public-2026/home/HomeTrustBar2026';
import { home2026CopyByLocale } from '@/components/public-2026/home/HomeCopy2026';

type HomePage2026Props = { locale: SupportedLocale; country: SupportedCountry };

export function HomePage2026({ locale, country }: HomePage2026Props) {
  const copy = home2026CopyByLocale[locale];
  const dir = localeDirection(locale);
  const providerHref = publicProviderRoute(locale, country);

  return (
    <main className="dm2026-home relative min-w-0 overflow-x-hidden" dir={dir} data-country={country} data-locale={locale}>
      <Container2026>
        <HomeHeroSearch2026 locale={locale} country={country} copy={copy} />
        <HomeTrustBar2026 items={copy.trustBar} />
        <FeaturedCentersCarousel2026 locale={locale} country={country} copy={copy.carousel} actions={copy.actions} />
        <FeaturedProviders2026 locale={locale} country={country} copy={copy.featured} actions={copy.actions} />
        <BrowseCategories2026 locale={locale} country={country} copy={copy.categories} />
        <BrowseAreas2026 locale={locale} country={country} copy={copy.areas} />
        <HomeArticles2026 copy={copy.articles} />
        <TrustAndSafety2026 copy={copy.safety} />
        <FaqSection2026 copy={copy.faq} />
        <section className="dm2026-provider-cta my-10 rounded-[2rem] border border-dm-border bg-[linear-gradient(135deg,var(--dm-teal-800),var(--dm-teal-600))] p-6 text-white shadow-dm-lg sm:p-8 lg:p-10" aria-labelledby="dm2026-provider-title">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--dm-gold-300)]">{copy.providerCta.eyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 id="dm2026-provider-title" className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.providerCta.title}</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-white/85">{copy.providerCta.subtitle}</p>
              <p className="mt-3 text-sm text-white/70">{copy.providerCta.note}</p>
            </div>
            <Button2026 href={providerHref} variant="secondary" className="bg-white text-dm-brand-strong hover:bg-dm-bg-soft">
              {copy.providerCta.cta}
            </Button2026>
          </div>
        </section>
        <PublicDisclaimer2026>{copy.disclaimer}</PublicDisclaimer2026>
      </Container2026>
      <FloatingActions2026 locale={locale} copy={copy.floating} />
    </main>
  );
}
