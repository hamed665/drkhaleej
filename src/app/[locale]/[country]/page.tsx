import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomePage2026 } from '@/components/public-2026/home/HomePage2026';
import { home2026CopyByLocale } from '@/components/public-2026/home/HomeCopy2026';
import {
  isSupportedCountry,
  isSupportedLocale,
  SupportedCountry,
  SupportedLocale
} from '@/lib/i18n/config';

type Params = { locale: string; country: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = home2026CopyByLocale[locale as SupportedLocale];

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical: `/${locale}/${country}`
    }
  };
}

export default async function LocaleCountryHome({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  return <HomePage2026 locale={locale as SupportedLocale} country={country as SupportedCountry} />;
}
