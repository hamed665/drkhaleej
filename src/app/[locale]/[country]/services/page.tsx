import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DiscoveryPage2026 } from '@/components/public-2026/pages/DiscoveryPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: { title: 'Explore healthcare services in Oman | DrMuscat', description: 'Browse healthcare, dental, wellness, diagnostics, pharmacy, and veterinary discovery categories.' },
  ar: { title: 'استكشف خدمات الرعاية الصحية في عُمان | دكتور مسقط', description: 'تصفح فئات اكتشاف الرعاية الصحية والأسنان والعافية والتشخيص والصيدليات والبيطرة.' },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/services', title: copy.title, description: copy.description });
}

export default async function PublicDiscoveryPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <DiscoveryPage2026 locale={locale} country={country} kind="services" />;
}
