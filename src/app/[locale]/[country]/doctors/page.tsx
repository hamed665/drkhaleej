import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DoctorsPage2026 } from '@/components/public/doctors-page-2026';
import { listPublicDoctors } from '@/lib/catalog/public-queries';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };
type RouteCopy = { title: string; description: string };

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    title: 'Find Doctors in Oman | DrMuscat',
    description:
      'Search public doctor listings in Oman with a premium bilingual discovery page, safe profile links, articles, sponsored slots, and offer-ready sections.'
  },
  ar: {
    title: 'ابحث عن أطباء في عُمان | DrMuscat',
    description:
      'ابحث في قوائم الأطباء العامة في عُمان من خلال صفحة اكتشاف مميزة ثنائية اللغة مع روابط ملفات آمنة ومقالات ومساحات إعلانات وعروض جاهزة.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const copy = copyByLocale[safeLocale];

  return buildLocalizedMetadata({
    locale: safeLocale,
    country: safeCountry,
    pathname: '/doctors',
    title: copy.title,
    description: copy.description
  });
}

export default async function PublicDoctorsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const result = await listPublicDoctors({ country: safeCountry });

  return <DoctorsPage2026 country={safeCountry} dir={localeDirection(safeLocale)} locale={safeLocale} result={result} />;
}
