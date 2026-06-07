import Link from 'next/link';

import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { PublicDiscoverySlug, publicDiscoveryRoute } from '@/lib/routes/public';

type HomeDiscoveryCategories2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type DiscoveryCardTone = 'dental' | 'beauty' | 'offers' | 'doctors' | 'labs' | 'pet' | 'hospitals';
type DiscoveryCardSize = 'large' | 'medium';

type DiscoveryCard = {
  id: DiscoveryCardTone;
  size: DiscoveryCardSize;
  title: Record<SupportedLocale, string>;
  description: Record<SupportedLocale, string>;
  routeSlug?: PublicDiscoverySlug;
};

const discoveryCopy: Record<SupportedLocale, { title: string; subtitle: string; cta: string; ariaLabel: string }> = {
  en: {
    title: 'Explore care categories',
    subtitle: 'Browse the care paths people search most across Oman.',
    cta: 'Explore',
    ariaLabel: 'Explore care categories'
  },
  ar: {
    title: 'استكشف فئات الرعاية',
    subtitle: 'تصفّح أكثر مسارات الرعاية بحثاً في عُمان.',
    cta: 'استكشف',
    ariaLabel: 'استكشف فئات الرعاية'
  }
};

const discoveryCards: readonly DiscoveryCard[] = [
  {
    id: 'dental',
    size: 'large',
    title: { en: 'Dental', ar: 'الأسنان' },
    description: {
      en: 'Browse clinics, specialists and dental care.',
      ar: 'تصفّح العيادات والاختصاصيين ورعاية الأسنان.'
    }
  },
  {
    id: 'beauty',
    size: 'large',
    title: { en: 'Beauty & Aesthetics', ar: 'الجمال والتجميل' },
    description: {
      en: 'Explore skin, laser and aesthetic care profiles.',
      ar: 'استكشف ملفات الجلدية والليزر والرعاية التجميلية.'
    }
  },
  {
    id: 'offers',
    size: 'large',
    title: { en: 'Special Offers', ar: 'العروض الخاصة' },
    description: {
      en: 'Browse approved packages and provider special offers.',
      ar: 'تصفّح الباقات والعروض الخاصة المعتمدة من مقدّمي الخدمة.'
    }
  },
  {
    id: 'doctors',
    size: 'medium',
    title: { en: 'Doctors', ar: 'الأطباء' },
    description: {
      en: 'Find care profiles across major specialties.',
      ar: 'اعثر على ملفات الرعاية عبر التخصصات الرئيسية.'
    },
    routeSlug: 'doctors'
  },
  {
    id: 'labs',
    size: 'medium',
    title: { en: 'Labs', ar: 'المختبرات' },
    description: {
      en: 'Browse diagnostics and test service profiles.',
      ar: 'تصفّح ملفات التشخيص وخدمات الفحوصات.'
    },
    routeSlug: 'labs'
  },
  {
    id: 'pet',
    size: 'medium',
    title: { en: 'Pet Clinic', ar: 'العيادات البيطرية' },
    description: {
      en: 'Discover trusted veterinary care profiles.',
      ar: 'اكتشف ملفات رعاية بيطرية موثوقة.'
    }
  },
  {
    id: 'hospitals',
    size: 'medium',
    title: { en: 'Hospitals', ar: 'المستشفيات' },
    description: {
      en: 'Explore hospital profiles and care services.',
      ar: 'استكشف ملفات المستشفيات وخدمات الرعاية.'
    }
  }
];

function EmbossedSymbol({ id }: { id: DiscoveryCardTone }) {
  return (
    <svg className="dm2026-discovery-card__embossed-svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      {id === 'dental' ? (
        <>
          <path className="dm2026-symbol__cast dm2026-symbol__cast--dental" d="M27 22c6-9 16-11 25-6 9-5 19-3 25 6 10 14 6 37-6 50-5 6-10 2-13-10-2-8-5-13-10-13s-8 5-10 13c-3 12-8 16-13 10-12-13-16-36-6-50Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero dm2026-symbol__mass--dental" d="M27 19c6-9 16-11 25-6 9-5 19-3 25 6 10 14 6 37-6 50-5 6-10 2-13-10-2-8-5-13-10-13s-8 5-10 13c-3 12-8 16-13 10-12-13-16-36-6-50Z" />
          <path className="dm2026-symbol__ridge dm2026-symbol__ridge--dental" d="M32 28c5-5 13-6 20-2 7-4 15-3 21 2" />
          <path className="dm2026-symbol__carve dm2026-symbol__carve--dental" d="M37 40c8 4 16 4 22 0M36 51c4-4 8-6 12-6s8 2 12 6M42 60c1-6 3-10 6-10s5 4 6 10" />
        </>
      ) : null}

      {id === 'beauty' ? (
        <>
          <path className="dm2026-symbol__cast dm2026-symbol__cast--beauty" d="M36 25c9-12 27-17 41-6 12 10 14 29 5 43-8 13-23 21-40 15-12-4-20-14-21-27-1-9 4-18 15-25Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero dm2026-symbol__mass--beauty" d="M35 22c10-12 28-16 42-5 12 10 14 29 5 43-8 13-24 21-41 15-12-4-20-14-21-27-1-9 4-19 15-26Z" />
          <path className="dm2026-symbol__profile dm2026-symbol__profile--beauty" d="M61 20c-8 5-13 12-14 20 5 1 10 3 12 7-2 4-6 5-10 6 2 9 9 15 20 19" />
          <path className="dm2026-symbol__profile dm2026-symbol__profile--detail" d="M54 34c5-2 10-2 15 1M53 57c5 3 10 3 16 0" />
          <path className="dm2026-symbol__mark dm2026-symbol__mark--beauty" d="M31 34c6-8 15-13 27-15M29 46c5-5 11-8 19-9" />
        </>
      ) : null}

      {id === 'offers' ? (
        <>
          <path className="dm2026-symbol__cast" d="M28 24h40l13 17-33 36-33-36Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero" d="M28 21h40l13 17-33 36-33-36Z" />
          <path className="dm2026-symbol__ridge" d="M28 21 38 38 48 21 58 38 68 21M15 38h66M38 38l10 36 10-36" />
          <path className="dm2026-symbol__mark" d="M74 19v8M70 23h8" />
        </>
      ) : null}

      {id === 'doctors' ? (
        <>
          <path className="dm2026-symbol__cast" d="M27 19v22c0 15 21 15 21 0V19M48 41c2 19 28 23 36 6" />
          <path className="dm2026-symbol__ridge dm2026-symbol__ridge--doctor" d="M27 16v22c0 15 21 15 21 0V16M48 38c2 19 28 23 36 6" />
          <circle className="dm2026-symbol__mass dm2026-symbol__mass--doctor" cx="84" cy="44" r="6.5" />
          <path className="dm2026-symbol__mark dm2026-symbol__mark--pulse" d="M21 68h15l5-10 7 18 7-12h21" />
          <path className="dm2026-symbol__carve" d="M22 23h10M43 23h10" />
        </>
      ) : null}

      {id === 'labs' ? (
        <>
          <path className="dm2026-symbol__cast" d="M35 20h27M43 20v28L31 70c-3 6 1 10 7 10h28c6 0 10-4 7-10L55 48V20" />
          <path className="dm2026-symbol__ridge" d="M35 17h27M43 17v28L31 67c-3 6 1 10 7 10h28c6 0 10-4 7-10L55 45V17" />
          <path className="dm2026-symbol__mass" d="M36 62c9 5 20-3 31 2l4 9H33Z" />
          <path className="dm2026-symbol__mark" d="M74 26a3.5 3.5 0 1 0 0 .1M82 40a4.5 4.5 0 1 0 0 .1M76 30l5 8" />
        </>
      ) : null}

      {id === 'pet' ? (
        <>
          <path className="dm2026-symbol__cast" d="M34 57c4-10 18-10 22 0 3 9-3 16-11 16s-14-7-11-16Z" />
          <path className="dm2026-symbol__mass" d="M34 54c4-10 18-10 22 0 3 9-3 16-11 16s-14-7-11-16Z" />
          <circle className="dm2026-symbol__dot" cx="32" cy="39" r="5.4" />
          <circle className="dm2026-symbol__dot" cx="46" cy="32" r="5.4" />
          <circle className="dm2026-symbol__dot" cx="60" cy="39" r="5.4" />
          <path className="dm2026-symbol__mark" d="M74 31v20M64 41h20" />
        </>
      ) : null}

      {id === 'hospitals' ? (
        <>
          <path className="dm2026-symbol__cast" d="M28 78V32h40v46M39 78V53h18v25M48 40v18M39 49h18M35 32V21h26v11" />
          <path className="dm2026-symbol__ridge" d="M28 75V29h40v46M39 75V50h18v25M48 37v18M39 46h18M35 29V18h26v11" />
          <path className="dm2026-symbol__mass" d="M31 75h34" />
          <path className="dm2026-symbol__mark" d="M24 25c7-7 17-10 29-9 11 1 19 6 24 13" />
        </>
      ) : null}
    </svg>
  );
}

export function HomeDiscoveryCategories2026({ locale, country, dir }: HomeDiscoveryCategories2026Props) {
  const copy = discoveryCopy[locale];

  return (
    <section className="dm2026-discovery-categories" dir={dir} aria-labelledby="dm2026-discovery-categories-title" data-country={country}>
      <div className="dm2026-container">
        <div className="dm2026-discovery-categories__module dm2026-glass">
          <span className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--teal" aria-hidden="true" />
          <span className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--gold" aria-hidden="true" />

          <header className="dm2026-discovery-categories__header">
            <span className="dm2026-badge dm2026-discovery-categories__badge">{copy.cta}</span>
            <div>
              <h2 id="dm2026-discovery-categories-title">{copy.title}</h2>
              <p>{copy.subtitle}</p>
            </div>
          </header>

          <div className="dm2026-discovery-categories__grid" aria-label={copy.ariaLabel}>
            {discoveryCards.map((card) => {
              const variant = card.size === 'large' ? 'hero' : 'secondary';
              const className = `dm2026-discovery-card dm2026-discovery-card--${variant} dm2026-discovery-card--${card.size} dm2026-discovery-card--${card.id} dm2026-card-glass`;
              const content = (
                <>
                  <span className="dm2026-discovery-card__visual" aria-hidden="true">
                    <span className="dm2026-discovery-card__visual-plate">
                      <EmbossedSymbol id={card.id} />
                    </span>
                  </span>
                  <span className="dm2026-discovery-card__copy">
                    <strong>{card.title[locale]}</strong>
                    <span>{card.description[locale]}</span>
                  </span>
                  <span className="dm2026-discovery-card__cta">{copy.cta}</span>
                </>
              );

              if (card.routeSlug) {
                return (
                  <Link key={card.id} className={className} data-card-variant={variant} href={publicDiscoveryRoute(locale, country, card.routeSlug)}>
                    {content}
                  </Link>
                );
              }

              return (
                <article key={card.id} className={className} data-card-variant={variant}>
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
