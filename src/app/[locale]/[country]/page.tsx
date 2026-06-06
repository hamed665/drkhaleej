import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomePage2026HeaderHero } from '@/components/home/HomePage2026HeaderHero';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  SupportedCountry,
  SupportedLocale
} from '@/lib/i18n/config';

type Params = { locale: string; country: string };

type HomeMetadataCopy = {
  metadataTitle: string;
  metadataDescription: string;
};

const homeMetadataByLocale: Record<SupportedLocale, HomeMetadataCopy> = {
  en: {
    metadataTitle: 'DrMuscat Oman | Healthcare Discovery in Muscat',
    metadataDescription:
      'Find healthcare options in Oman with DrMuscat public discovery for doctors, clinics, labs, pharmacies, services and care areas.'
  },
  ar: {
    metadataTitle: 'DrMuscat عُمان | اكتشاف الرعاية الصحية في مسقط',
    metadataDescription:
      'استكشف خيارات الرعاية الصحية في عُمان عبر DrMuscat لاكتشاف الأطباء والعيادات والمختبرات والصيدليات والخدمات والمناطق.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = homeMetadataByLocale[locale as SupportedLocale];

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

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);

  return (
    <main className="home-foundation dm2026-home-page" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <HomePage2026HeaderHero locale={safeLocale} country={safeCountry} dir={dir} />
    </main>
  );
}
