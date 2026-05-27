import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    title: 'Pharmacies in Oman',
    description: 'Pharmacy discovery pages are being prepared for structured provider data.',
    badge: 'Public discovery route',
    panelHeading: 'Provider data preparation in progress',
    panelBody: 'Pharmacy discovery pages are being prepared for structured provider data.',
    gridTitle: 'Planned route structure',
    gridItems: ['Bilingual route foundation', 'SEO-safe metadata baseline', 'Responsive public page skeleton']
  },
  ar: {
    title: 'الصيدليات في عُمان',
    description: 'يتم تجهيز صفحات اكتشاف الصيدليات لعرض بيانات مقدمي الخدمة المنظمة في مراحل قادمة.',
    badge: 'مسار استكشاف عام',
    panelHeading: 'جاري تجهيز بيانات مقدمي الخدمة',
    panelBody: 'يتم تجهيز صفحات اكتشاف الصيدليات لعرض بيانات مقدمي الخدمة المنظمة.',
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
    pathname: '/pharmacies',
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

  return (
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
  );
}
