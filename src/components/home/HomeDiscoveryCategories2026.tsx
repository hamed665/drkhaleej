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
          <path className="dm2026-discovery-card__emboss-shadow" d="M30 23c7-8 16-9 24-4.5C62 14 71 15 78 23c12 15 5 39-8 51-8 8-13-12-22-12S34 82 26 74c-13-12-8-36 4-51Z" />
          <path className="dm2026-discovery-card__emboss-form dm2026-discovery-card__emboss-form--hero" d="M30 20c7-8 16-9 24-4.5C62 11 71 12 78 20c12 15 5 39-8 51-8 8-13-12-22-12S34 79 26 71c-13-12-8-36 4-51Z" />
          <path className="dm2026-discovery-card__emboss-groove" d="M36 27c5-5 12-6 18-2.5 6-3.5 13-2.5 18 2.5" />
          <path className="dm2026-discovery-card__emboss-groove dm2026-discovery-card__emboss-groove--fine" d="M39 42c8 4 18 5 28 0M42 56c5 2 9 2 12 0" />
        </>
      ) : null}

      {id === 'beauty' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M52 14c-17 5-28 20-28 38 0 18 12 30 31 36 17-7 27-22 28-39 1-17-10-30-31-35Z" />
          <path className="dm2026-discovery-card__emboss-form dm2026-discovery-card__emboss-form--hero" d="M52 11c-17 5-28 20-28 38 0 18 12 30 31 36 17-7 27-22 28-39 1-17-10-30-31-35Z" />
          <path className="dm2026-discovery-card__emboss-groove dm2026-discovery-card__emboss-groove--face" d="M57 21c-10 8-15 20-13 33 2 13 11 22 26 26" />
          <path className="dm2026-discovery-card__emboss-groove dm2026-discovery-card__emboss-groove--fine" d="M51 47c6 2 12 1 18-2M52 62c6 3 13 3 20-1" />
          <path className="dm2026-discovery-card__emboss-form dm2026-discovery-card__emboss-form--drop" d="M75 28c5.5 7 8.5 12.5 8.5 18a8.5 8.5 0 0 1-17 0c0-5.5 3-11 8.5-18Z" />
        </>
      ) : null}

      {id === 'offers' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M28 25h40l12 16-32 35-32-35Z" />
          <path className="dm2026-discovery-card__emboss-form dm2026-discovery-card__emboss-form--hero" d="M28 22h40l12 16-32 35-32-35Z" />
          <path className="dm2026-discovery-card__emboss-groove" d="M28 22 38 38 48 22 58 38 68 22M16 38h64M38 38l10 35 10-35" />
          <path className="dm2026-discovery-card__emboss-mark" d="M74 20v8M70 24h8" />
        </>
      ) : null}

      {id === 'doctors' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M48 15c16 6 27 15 27 31 0 17-11 30-27 37-16-7-27-20-27-37 0-16 11-25 27-31Z" />
          <path className="dm2026-discovery-card__emboss-form dm2026-discovery-card__emboss-form--hero" d="M48 12c16 6 27 15 27 31 0 17-11 30-27 37-16-7-27-20-27-37 0-16 11-25 27-31Z" />
          <path className="dm2026-discovery-card__emboss-groove dm2026-discovery-card__emboss-groove--medical" d="M48 27v22M37 38h22" />
          <path className="dm2026-discovery-card__emboss-mark" d="M24 63h14l5-9 7 17 7-12h16" />
        </>
      ) : null}

      {id === 'labs' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M36 21h25M43 21v28L31 71c-3 5 1 9 6 9h28c5 0 9-4 6-9L55 49V21" />
          <path className="dm2026-discovery-card__emboss-groove" d="M36 18h25M43 18v28L31 68c-3 5 1 9 6 9h28c5 0 9-4 6-9L55 46V18" />
          <path className="dm2026-discovery-card__emboss-form" d="M36 63c8 4 19-3 30 2l3 8H33Z" />
          <path className="dm2026-discovery-card__emboss-mark" d="M73 27a3 3 0 1 0 0 .1M81 40a4 4 0 1 0 0 .1M75 30l5 8" />
        </>
      ) : null}

      {id === 'pet' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M35 58c3-9 17-9 20 0 3 8-3 15-10 15S32 66 35 58Z" />
          <path className="dm2026-discovery-card__emboss-form" d="M35 55c3-9 17-9 20 0 3 8-3 15-10 15S32 63 35 55Z" />
          <circle className="dm2026-discovery-card__emboss-dot" cx="33" cy="40" r="5" />
          <circle className="dm2026-discovery-card__emboss-dot" cx="46" cy="33" r="5" />
          <circle className="dm2026-discovery-card__emboss-dot" cx="59" cy="40" r="5" />
          <path className="dm2026-discovery-card__emboss-mark" d="M73 32v19M64 41.5h18" />
        </>
      ) : null}

      {id === 'hospitals' ? (
        <>
          <path className="dm2026-discovery-card__emboss-shadow" d="M28 78V33h40v45M39 78V54h18v24M48 41v17M40 49.5h16M35 33V23h26v10" />
          <path className="dm2026-discovery-card__emboss-groove" d="M28 75V30h40v45M39 75V51h18v24M48 38v17M40 46.5h16M35 30V20h26v10" />
          <path className="dm2026-discovery-card__emboss-form" d="M31 75h34" />
          <path className="dm2026-discovery-card__emboss-mark" d="M25 25c7-7 16-10 28-9 10 1 18 6 23 13" />
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
