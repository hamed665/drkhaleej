import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RegisterPage2026 } from '@/components/public-2026/pages/PublicAuthPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: {
    title: 'Create account | DrMuscat',
    description: 'Frontend registration preview with public role selection for DrMuscat in Oman.',
  },
  ar: {
    title: 'إنشاء حساب | دكتور مسقط',
    description: 'معاينة واجهة إنشاء الحساب مع اختيار الدور العام لدكتور مسقط في عُمان.',
  },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/register', title: copy.title, description: copy.description });
}

export default async function RegisterPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <RegisterPage2026 locale={locale} country={country} />;
}
