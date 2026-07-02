import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PublicSearchResultsPage } from '@/components/public/public-search-results-page';
import {
  isSupportedCountry,
  isSupportedLocale,
  type SupportedCountry,
  type SupportedLocale,
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };
type SearchParams = Record<string, string | string[] | undefined>;
type SearchCopy = {
  title: string;
  description: string;
};

const explicitSearchRobots: Metadata['robots'] = { index: false, follow: true };

const copyByLocale: Record<SupportedLocale, SearchCopy> = {
  en: {
    title: 'Search Healthcare in Oman',
    description: 'Search reviewed public doctors, clinics, hospitals, labs, pharmacies, services and areas in Oman. Public discovery only; confirm details directly with providers.',
  },
  ar: {
    title: 'البحث عن الرعاية الصحية في عُمان',
    description: 'ابحث في بيانات عامة تمت مراجعتها للأطباء والعيادات والمستشفيات والمختبرات والصيدليات والخدمات والمناطق في عُمان. اكتشاف عام فقط، ويجب تأكيد التفاصيل مباشرة مع مقدمي الخدمة.',
  },
};

function firstSearchParamValue(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue ? rawValue.trim().slice(0, 80) : '';
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  const metadata = buildLocalizedMetadata({ locale, country, pathname: '/search', title: copy.title, description: copy.description });

  return { ...metadata, robots: explicitSearchRobots };
}

export default async function PublicSearchPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const submitted = await searchParams;

  return (
    <PublicSearchResultsPage
      locale={locale as SupportedLocale}
      country={country as SupportedCountry}
      query={firstSearchParamValue(submitted.q)}
    />
  );
}
