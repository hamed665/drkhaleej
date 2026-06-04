import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocationSelect2026 } from '@/components/public-2026/search/LocationSelect2026';
import { home2026CopyByLocale } from '@/components/public-2026/home/HomeCopy2026';
import { PublicPageShell } from '@/components/public/public-page-shell';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

type RouteCopy = {
  title: string;
  description: string;
  badge: string;
  panelHeading: string;
  panelBody: string;
  gridTitle: string;
  gridItems: readonly string[];
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    title: 'Search Healthcare in Oman',
    description: 'Search is being prepared for structured provider data workflows in upcoming phases.',
    badge: 'Public discovery route',
    panelHeading: 'Provider data preparation in progress',
    panelBody: 'Search is being prepared for structured provider data workflows in upcoming phases.',
    gridTitle: 'Planned route structure',
    gridItems: ['Bilingual route foundation', 'SEO-safe metadata baseline', 'Responsive public page skeleton']
  },
  ar: {
    title: 'البحث عن الرعاية الصحية في عُمان',
    description: 'يتم تجهيز البحث لدعم تدفقات بيانات مقدمي الخدمة المنظمة في المراحل القادمة.',
    badge: 'مسار استكشاف عام',
    panelHeading: 'جاري تجهيز بيانات مقدمي الخدمة',
    panelBody: 'يتم تجهيز البحث لدعم تدفقات بيانات مقدمي الخدمة المنظمة.',
    gridTitle: 'الهيكل المخطط للمسار',
    gridItems: ['أساس مسار ثنائي اللغة', 'خط أساس آمن لبيانات SEO', 'هيكل صفحة عامة متجاوب']
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = copyByLocale[locale];

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: '/search',
    title: copy.title,
    description: copy.description
  });
}

export default async function PublicRoutePage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const copy = copyByLocale[locale];
  const homeCopy = home2026CopyByLocale[locale];

  return (
    <>
      <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={copy.title}
      heroDescription={copy.description}
      panelHeading={copy.panelHeading}
      panelBody={copy.panelBody}
        gridTitle={copy.gridTitle}
        gridItems={copy.gridItems}
      />
      <section className="dm2026-search-route-location" dir={localeDirection(locale)} aria-label={homeCopy.location.countryHelp}>
        <div className="dm2026-search-route-card">
          <h2>{homeCopy.hero.searchLabel}</h2>
          <LocationSelect2026 locale={locale} copy={homeCopy.location} />
        </div>
      </section>
    </>
  );
}
