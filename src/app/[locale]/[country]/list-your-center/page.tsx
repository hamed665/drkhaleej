import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ListYourCenterPage2026 } from '@/components/public-2026/pages/ListYourCenterPage2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: {
    title: 'List your center | DrMuscat',
    description: 'Request a reviewed frontend listing placeholder for healthcare providers in Oman.',
  },
  ar: {
    title: 'أدرج مركزك | دكتور مسقط',
    description: 'اطلب إدراجًا تمهيديًا تتم مراجعته لمقدمي الرعاية الصحية في عُمان.',
  },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/list-your-center', title: copy.title, description: copy.description });
}

export default async function ListYourCenterPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <ListYourCenterPage2026 locale={locale} country={country} />;
}
