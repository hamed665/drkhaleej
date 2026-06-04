import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SignInPage2026 } from '@/components/public-2026/pages/PublicAuthPages2026';
import { isSupportedCountry, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale = {
  en: {
    title: 'Sign in | DrMuscat',
    description: 'Frontend sign-in preview for DrMuscat healthcare discovery in Oman.',
  },
  ar: {
    title: 'تسجيل الدخول | دكتور مسقط',
    description: 'معاينة واجهة تسجيل الدخول لاكتشاف الرعاية الصحية في دكتور مسقط في عُمان.',
  },
} as const satisfies Record<SupportedLocale, { title: string; description: string }>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/sign-in', title: copy.title, description: copy.description });
}

export default async function SignInPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();
  return <SignInPage2026 locale={locale} country={country} />;
}
