import Link from 'next/link';
import type { ReactNode } from 'react';

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

function DentalScene() {
  return (
    <svg className="dm2026-discovery-card__svg dm2026-discovery-card__svg--hero" viewBox="0 0 140 108" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__aura dm2026-discovery-card__aura--wide" d="M24 49c5-30 36-44 67-35 31 9 46 41 31 67-14 25-52 33-79 15C25 84 20 67 24 49Z" />
      <path className="dm2026-discovery-card__aura dm2026-discovery-card__aura--tight" d="M39 36c11-18 44-22 64-5 19 16 14 45-3 58-16 13-44 13-62-3-18-16-19-35 1-50Z" />
      <path className="dm2026-discovery-card__tooth-glass dm2026-discovery-card__tooth-glass--breathe" d="M44 30c8-9 20-10 29-4 9-6 22-5 30 5 14 17 4 46-10 58-9 8-14-14-21-14s-12 22-21 14C36 77 30 47 44 30Z" />
      <path className="dm2026-discovery-card__tooth-edge" d="M48 33c7-7 17-7 25-2 8-5 18-5 25 3" />
      <path className="dm2026-discovery-card__tooth-core" d="M55 42c6 6 14 8 23 5 7-2 12-1 17 3" />
      <path className="dm2026-discovery-card__enamel-sweep" d="M48 61c18-13 39-18 63-12" />
      <path className="dm2026-discovery-card__chrome-arc dm2026-discovery-card__chrome-arc--one" d="M28 42c8-17 24-28 45-30" />
      <path className="dm2026-discovery-card__chrome-arc dm2026-discovery-card__chrome-arc--two" d="M106 27c12 10 18 24 16 40" />
      <path className="dm2026-discovery-card__sparkle dm2026-discovery-card__sparkle--one" d="M113 22v12M107 28h12" />
      <path className="dm2026-discovery-card__sparkle dm2026-discovery-card__sparkle--two" d="M35 76v9M30.5 80.5h9" />
      <circle className="dm2026-discovery-card__micro-glint dm2026-discovery-card__micro-glint--one" cx="94" cy="39" r="2" />
      <circle className="dm2026-discovery-card__micro-glint dm2026-discovery-card__micro-glint--two" cx="56" cy="52" r="1.8" />
    </svg>
  );
}

function BeautyScene() {
  return (
    <svg className="dm2026-discovery-card__svg dm2026-discovery-card__svg--hero" viewBox="0 0 140 108" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__aura dm2026-discovery-card__aura--wide" d="M30 26c20-19 62-21 85 3 20 22 8 61-28 76-32 13-71-9-78-39-3-15 4-30 21-40Z" />
      <path className="dm2026-discovery-card__beauty-glow" d="M42 24c19-14 51-12 70 5 18 17 20 45 2 66" />
      <path className="dm2026-discovery-card__beauty-contour dm2026-discovery-card__beauty-contour--primary" d="M74 18c-22 11-33 31-29 50 3 17 16 27 35 31" />
      <path className="dm2026-discovery-card__beauty-contour dm2026-discovery-card__beauty-contour--secondary" d="M83 30c11 10 13 30-2 46-5 5-10 8-16 10" />
      <path className="dm2026-discovery-card__beauty-contour dm2026-discovery-card__beauty-contour--soft" d="M56 51c8 3 19 2 28-2" />
      <path className="dm2026-discovery-card__beauty-contour dm2026-discovery-card__beauty-contour--soft" d="M58 66c8 5 18 5 28 0" />
      <path className="dm2026-discovery-card__serum-drop dm2026-discovery-card__serum-drop--float" d="M107 32c8 10 13 19 13 27a13 13 0 0 1-26 0c0-8 5-17 13-27Z" />
      <path className="dm2026-discovery-card__serum-highlight" d="M101 55c4 4 10 5 15 1" />
      <path className="dm2026-discovery-card__enamel-sweep dm2026-discovery-card__enamel-sweep--beauty" d="M43 36c28-14 58-12 86 7" />
      <circle className="dm2026-discovery-card__micro-glint dm2026-discovery-card__micro-glint--one" cx="98" cy="28" r="2" />
      <circle className="dm2026-discovery-card__micro-glint dm2026-discovery-card__micro-glint--two" cx="52" cy="80" r="1.7" />
    </svg>
  );
}

function OffersScene() {
  return (
    <svg className="dm2026-discovery-card__svg dm2026-discovery-card__svg--hero" viewBox="0 0 140 108" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__aura dm2026-discovery-card__aura--gold dm2026-discovery-card__aura--wide" d="M25 35c19-26 66-32 93-9 23 20 17 57-8 78-28 23-77 13-93-17-10-19-7-39 8-52Z" />
      <path className="dm2026-discovery-card__jewel-shadow" d="M70 92 27 47l17-25h69l17 25Z" />
      <path className="dm2026-discovery-card__jewel dm2026-discovery-card__jewel--breathe" d="M43 22h70l17 25-60 61-60-61Z" />
      <path className="dm2026-discovery-card__jewel-facet" d="M43 22 58 47 70 22 84 47 113 22M10 47h120M58 47l12 61 14-61M43 22 10 47M113 22l17 25" />
      <path className="dm2026-discovery-card__jewel-core" d="M58 47h26l-14 34Z" />
      <path className="dm2026-discovery-card__jewel-shine" d="M36 41c19-11 42-16 70-13" />
      <path className="dm2026-discovery-card__jewel-ray dm2026-discovery-card__jewel-ray--one" d="M72 9v10M67 14h10" />
      <path className="dm2026-discovery-card__jewel-ray dm2026-discovery-card__jewel-ray--two" d="M119 29v10M114 34h10" />
      <path className="dm2026-discovery-card__jewel-ray dm2026-discovery-card__jewel-ray--three" d="M28 67v9M23.5 71.5h9" />
      <circle className="dm2026-discovery-card__champagne-glint dm2026-discovery-card__champagne-glint--one" cx="101" cy="51" r="2.3" />
      <circle className="dm2026-discovery-card__champagne-glint dm2026-discovery-card__champagne-glint--two" cx="49" cy="37" r="1.8" />
    </svg>
  );
}

function DoctorsScene() {
  return (
    <svg className="dm2026-discovery-card__svg" viewBox="0 0 120 96" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__halo" d="M24 34c16-16 55-18 70 2 13 18 0 44-23 51-28 8-58-28-47-53Z" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--soft" d="M35 27v22c0 13 20 13 20 0V27" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--pulse" d="M55 50c4 22 33 18 33-2" />
      <circle className="dm2026-discovery-card__dot" cx="88" cy="48" r="6" />
      <path className="dm2026-discovery-card__pulse" d="M25 71h17l5-10 8 18 7-12h28" />
    </svg>
  );
}

function LabsScene() {
  return (
    <svg className="dm2026-discovery-card__svg" viewBox="0 0 120 96" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__halo" d="M29 23c17-15 53-15 68 3 17 22-8 54-34 57-28 3-56-34-34-60Z" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--float" d="M47 22h30M55 22v30L42 74c-3 5 1 10 7 10h30c6 0 10-5 7-10L69 52V22" />
      <path className="dm2026-discovery-card__fluid" d="M47 69c9 5 22-4 34 2l4 8H43Z" />
      <circle className="dm2026-discovery-card__molecule dm2026-discovery-card__molecule--one" cx="86" cy="29" r="3" />
      <circle className="dm2026-discovery-card__molecule dm2026-discovery-card__molecule--two" cx="93" cy="42" r="4" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--soft" d="M87 32l5 8" />
    </svg>
  );
}

function PetScene() {
  return (
    <svg className="dm2026-discovery-card__svg" viewBox="0 0 120 96" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__halo" d="M25 31c15-19 52-21 69-2 17 19 1 51-22 58-29 9-59-29-47-56Z" />
      <path className="dm2026-discovery-card__paw" d="M45 60c3-9 17-9 21 0 3 8-3 16-11 16s-13-8-10-16Z" />
      <circle className="dm2026-discovery-card__toe dm2026-discovery-card__toe--one" cx="43" cy="45" r="5" />
      <circle className="dm2026-discovery-card__toe dm2026-discovery-card__toe--two" cx="56" cy="38" r="5" />
      <circle className="dm2026-discovery-card__toe dm2026-discovery-card__toe--three" cx="69" cy="45" r="5" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--soft" d="M88 36v20M78 46h20" />
      <path className="dm2026-discovery-card__pulse" d="M75 69h8l4-7 5 12 4-6h8" />
    </svg>
  );
}

function HospitalsScene() {
  return (
    <svg className="dm2026-discovery-card__svg" viewBox="0 0 120 96" aria-hidden="true" focusable="false">
      <path className="dm2026-discovery-card__halo" d="M24 25c17-17 55-17 72 1 18 21-2 53-28 59-30 6-58-33-44-60Z" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--float" d="M38 82V35h44v47M49 82V57h22v25" />
      <path className="dm2026-discovery-card__line dm2026-discovery-card__line--soft" d="M60 43v18M51 52h18M45 35V24h30v11" />
      <path className="dm2026-discovery-card__beacon" d="M33 26c7-8 19-12 31-10 12 1 21 7 26 15" />
      <path className="dm2026-discovery-card__shine" d="M44 68h10M76 68h10" />
    </svg>
  );
}

const sceneById: Record<DiscoveryCardTone, ReactNode> = {
  dental: <DentalScene />,
  beauty: <BeautyScene />,
  offers: <OffersScene />,
  doctors: <DoctorsScene />,
  labs: <LabsScene />,
  pet: <PetScene />,
  hospitals: <HospitalsScene />
};

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
              const className = `dm2026-discovery-card dm2026-discovery-card--${card.size} dm2026-discovery-card--${card.id} dm2026-card-glass`;
              const content = (
                <>
                  <span className="dm2026-discovery-card__scene" aria-hidden="true">{sceneById[card.id]}</span>
                  <span className="dm2026-discovery-card__copy">
                    <strong>{card.title[locale]}</strong>
                    <span>{card.description[locale]}</span>
                  </span>
                  <span className="dm2026-discovery-card__cta">{copy.cta}</span>
                </>
              );

              if (card.routeSlug) {
                return (
                  <Link key={card.id} className={className} href={publicDiscoveryRoute(locale, country, card.routeSlug)}>
                    {content}
                  </Link>
                );
              }

              return (
                <article key={card.id} className={className}>
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
