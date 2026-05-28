import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicDoctorDetail } from '@/components/public/public-doctor-detail';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { getPublicDoctorBySlug } from '@/lib/catalog/public-queries';
import type { PublicDoctorDetail as PublicDoctorDetailData } from '@/lib/catalog/public-types';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string; doctorSlug: string };

type RouteCopy = {
  badge: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: 'Public doctor profile',
    fallbackTitle: 'Doctor Profile | DrMuscat',
    fallbackDescription: 'View public doctor profile information in Oman on DrMuscat.'
  },
  ar: {
    badge: 'ملف طبيب عام',
    fallbackTitle: 'ملف طبيب | DrMuscat',
    fallbackDescription: 'اطلع على معلومات عامة عن ملفات الأطباء في عُمان عبر DrMuscat.'
  }
};

function preferredText(locale: SupportedLocale, en: string | null, ar: string | null): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

function doctorDisplayName(locale: SupportedLocale, doctor: PublicDoctorDetailData): string {
  return (
    preferredText(locale, doctor.displayNameEn, doctor.displayNameAr) ??
    preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ??
    doctor.fullNameEn
  );
}

function metadataTitle(name: string): string {
  return `${name} | DrMuscat`;
}

function metadataDescription(locale: SupportedLocale, doctor: PublicDoctorDetailData, fallback: string): string {
  const bio = preferredText(locale, doctor.bioEn, doctor.bioAr);
  if (!bio) return fallback;

  const normalizedBio = bio.replace(/\s+/g, ' ').trim();
  if (normalizedBio.length <= 155) return normalizedBio;
  return `${normalizedBio.slice(0, 152).trim()}...`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, doctorSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  const result = await getPublicDoctorBySlug({ slug: doctorSlug, country });

  if (!result.ok || !result.data) {
    return buildLocalizedMetadata({
      locale,
      country,
      pathname: `/doctor/${doctorSlug}`,
      title: copy.fallbackTitle,
      description: copy.fallbackDescription
    });
  }

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: `/doctor/${doctorSlug}`,
    title: metadataTitle(doctorDisplayName(locale, result.data)),
    description: metadataDescription(locale, result.data, copy.fallbackDescription)
  });
}

export default async function PublicDoctorDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, doctorSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await getPublicDoctorBySlug({ slug: doctorSlug, country });

  if (!result.ok) {
    return (
      <PublicPageShell
        dir={localeDirection(locale)}
        heroBadge={copy.badge}
        heroTitle={copy.fallbackTitle}
        heroDescription={copy.fallbackDescription}
        content={<PublicListingError locale={locale} />}
      />
    );
  }

  if (!result.data) notFound();

  const doctorName = doctorDisplayName(locale, result.data);
  const description = metadataDescription(locale, result.data, copy.fallbackDescription);

  return (
    <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={doctorName}
      heroDescription={description}
      content={<PublicDoctorDetail locale={locale} doctor={result.data} />}
    />
  );
}
