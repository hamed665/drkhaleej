import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DiscoveryPage2026 } from '@/components/public-2026/pages/DiscoveryPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: { title: 'Find doctors in Oman | DrMuscat', description: 'Browse doctor profiles by specialty, city, area, and care need without fake rankings or medical claims.' },
  ar: { title: 'ابحث عن أطباء في عُمان | دكتور مسقط', description: 'تصفح ملفات الأطباء حسب التخصص والمدينة والمنطقة دون تقييمات مزيفة أو ادعاءات طبية.' },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/doctors', title: copy.title, description: copy.description });
}

export default async function PublicDiscoveryPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <DiscoveryPage2026 locale={locale} country={country} kind="doctors" />;
}
