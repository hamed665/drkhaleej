import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuardedImportProfilePage } from '@/components/public/import-profile/GuardedImportProfilePage';
import { PublicDoctorDetail } from '@/components/public/public-doctor-detail';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { getPublicDoctorBySlug } from '@/lib/catalog/public-queries';
import type { PublicDoctorDetail as PublicDoctorDetailData } from '@/lib/catalog/public-types';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';
import { getPublicImportDoctorProfile } from '@/server/public/import-doctor-profile-guard';

type Params = { locale: string; country: string; doctorSlug: string };

type RouteCopy = {
  badge: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: 'Public doctor profile',
    fallbackTitle: 'Doctor Profile | DrKhaleej',
    fallbackDescription: 'View public doctor profile information in Oman on DrKhaleej.'
  },
  ar: {
    badge: 'ملف طبيب عام',
    fallbackTitle: 'ملف طبيب | DrKhaleej',
    fallbackDescription: 'اطلع على معلومات عامة عن ملفات الأطباء في عُمان عبر DrKhaleej.'
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
  return `${name} | DrKhaleej`;
}

function metadataDescription(locale: SupportedLocale, doctor: PublicDoctorDetailData, fallback: string): string {
  const bio = preferredText(locale, doctor.bioEn, doctor.bioAr);
  if (!bio) return fallback;

  const normalizedBio = bio.replace(/\s+/g, ' ').trim();
  if (normalizedBio.length <= 155) return normalizedBio;
  return `${normalizedBio.slice(0, 152).trim()}...`;
}

function importProfileDescription(name: string): string {
  return `${name} on DrKhaleej. Public healthcare discovery in Oman only; not medical advice, booking, or emergency care.`;
}

function buildNoindexFallbackMetadata(input: {
  locale: SupportedLocale;
  country: SupportedCountry;
  doctorSlug: string;
  title: string;
  description: string;
}): Metadata {
  return {
    ...buildLocalizedMetadata({
      locale: input.locale,
      country: input.country,
      pathname: `/doctor/${input.doctorSlug}`,
      title: input.title,
      description: input.description
    }),
    robots: { index: false, follow: true }
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, doctorSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  const result = await getPublicDoctorBySlug({ slug: doctorSlug, country });

  if (result.ok && result.data) {
    return buildLocalizedMetadata({
      locale,
      country,
      pathname: `/doctor/${doctorSlug}`,
      title: metadataTitle(doctorDisplayName(locale, result.data)),
      description: metadataDescription(locale, result.data, copy.fallbackDescription)
    });
  }

  const importResult = await getPublicImportDoctorProfile({ locale, country, doctorSlug });
  if (importResult.ok) {
    return buildLocalizedMetadata({
      locale,
      country,
      pathname: `/doctor/${doctorSlug}`,
      title: metadataTitle(importResult.profile.name),
      description: importProfileDescription(importResult.profile.name)
    });
  }

  return buildNoindexFallbackMetadata({
    locale,
    country,
    doctorSlug,
    title: copy.fallbackTitle,
    description: copy.fallbackDescription
  });
}

export default async function PublicDoctorDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, doctorSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await getPublicDoctorBySlug({ slug: doctorSlug, country });

  if (result.ok && result.data) {
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

  const importResult = await getPublicImportDoctorProfile({ locale, country, doctorSlug });
  if (importResult.ok) {
    return <GuardedImportProfilePage profile={importResult.profile} locale={locale} />;
  }

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

  notFound();
}
