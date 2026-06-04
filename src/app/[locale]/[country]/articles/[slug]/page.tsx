import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleDetailPage2026 } from '@/components/public-2026/pages/ArticlesPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string; slug: string };

const copyByLocale = {
  en: {
    title: 'Health guide | DrMuscat',
    description: 'General DrMuscat healthcare discovery article for Oman. Not medical advice.',
  },
  ar: {
    title: 'دليل صحي | دكتور مسقط',
    description: 'مقال عام من دكتور مسقط لاكتشاف الرعاية الصحية في عُمان. ليس نصيحة طبية.',
  },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: `/articles/${slug}`, title: copy.title, description: copy.description });
}

export default async function ArticleDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, slug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <ArticleDetailPage2026 locale={locale} country={country} slug={slug} />;
}
