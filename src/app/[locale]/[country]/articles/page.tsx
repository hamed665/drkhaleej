import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticlesIndexPage2026 } from '@/components/public-2026/pages/ArticlesPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: {
    title: 'Health guides and articles | DrMuscat',
    description: 'General healthcare discovery guides for Oman from DrMuscat. Not medical advice.',
  },
  ar: {
    title: 'أدلة ومقالات صحية | دكتور مسقط',
    description: 'أدلة عامة لاكتشاف الرعاية الصحية في عُمان من دكتور مسقط. ليست نصيحة طبية.',
  },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/articles', title: copy.title, description: copy.description });
}

export default async function ArticlesPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <ArticlesIndexPage2026 locale={locale} country={country} />;
}
