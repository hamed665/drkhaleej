import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomePage2026HeaderHero } from '@/components/home/HomePage2026HeaderHero';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';
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
  openGraphTitle: string;
  openGraphDescription: string;
};

const homeMetadataByLocale: Record<SupportedLocale, HomeMetadataCopy> = {
  en: {
    metadataTitle: 'DrKhaleej | Healthcare Discovery in Oman',
    metadataDescription:
      'Explore doctors, clinics, labs, pharmacies, beauty centers, pet clinics, wellness providers and offers in Oman. Public discovery only, not medical advice.',
    openGraphTitle: 'DrKhaleej | Healthcare Discovery in Oman',
    openGraphDescription:
      'Explore healthcare, beauty, wellness and pet care providers across Oman. Public discovery only, not medical advice.'
  },
  ar: {
    metadataTitle: 'DrKhaleej | اكتشاف الرعاية الصحية في عُمان',
    metadataDescription:
      'استكشف الأطباء والعيادات والمختبرات والصيدليات ومراكز التجميل والعيادات البيطرية ومقدمي خدمات الرفاهية والعروض في عُمان. اكتشاف عام فقط، وليس نصيحة طبية.',
    openGraphTitle: 'DrKhaleej | اكتشاف الرعاية الصحية في عُمان',
    openGraphDescription:
      'استكشف مقدمي الرعاية الصحية والتجميل والرفاهية ورعاية الحيوانات الأليفة في عُمان. اكتشاف عام فقط، وليس نصيحة طبية.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = homeMetadataByLocale[locale as SupportedLocale];

  const localizedMetadata = buildLocalizedMetadata({
    locale: locale as SupportedLocale,
    country: country as SupportedCountry,
    title: copy.metadataTitle,
    description: copy.metadataDescription
  });

  return {
    ...localizedMetadata,
    openGraph: {
      ...localizedMetadata.openGraph,
      title: copy.openGraphTitle,
      description: copy.openGraphDescription
    },
    twitter: {
      ...localizedMetadata.twitter,
      title: copy.openGraphTitle,
      description: copy.openGraphDescription
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
