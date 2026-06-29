import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCenterDetail } from '@/components/public/public-center-detail';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { getPublicCenterBySlug } from '@/lib/catalog/public-eligible-queries';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string; centerSlug: string };

type RouteCopy = {
  badge: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: 'Public center profile',
    fallbackTitle: 'Medical Center Profile | DrMuscat',
    fallbackDescription: 'View public medical center information in Oman on DrMuscat.'
  },
  ar: {
    badge: 'ملف مركز عام',
    fallbackTitle: 'ملف مركز طبي | DrMuscat',
    fallbackDescription: 'اطلع على معلومات عامة عن المراكز الطبية في عُمان عبر DrMuscat.'
  }
};

function preferredText(locale: SupportedLocale, en: string | null, ar: string | null): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

function metadataTitle(locale: SupportedLocale, name: string): string {
  return locale === 'ar' ? `${name} | DrMuscat` : `${name} | DrMuscat`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, centerSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  const result = await getPublicCenterBySlug({ slug: centerSlug, country });

  if (!result.ok || !result.data) {
    return buildLocalizedMetadata({
      locale,
      country,
      pathname: `/center/${centerSlug}`,
      title: copy.fallbackTitle,
      description: copy.fallbackDescription
    });
  }

  const centerName = preferredText(locale, result.data.nameEn, result.data.nameAr) ?? result.data.nameEn;
  const description =
    preferredText(locale, result.data.shortDescriptionEn, result.data.shortDescriptionAr) ??
    preferredText(locale, result.data.descriptionEn, result.data.descriptionAr) ??
    copy.fallbackDescription;

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: `/center/${centerSlug}`,
    title: metadataTitle(locale, centerName),
    description
  });
}

export default async function PublicCenterDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, centerSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await getPublicCenterBySlug({ slug: centerSlug, country });

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

  const centerName = preferredText(locale, result.data.nameEn, result.data.nameAr) ?? result.data.nameEn;
  const description =
    preferredText(locale, result.data.shortDescriptionEn, result.data.shortDescriptionAr) ??
    preferredText(locale, result.data.descriptionEn, result.data.descriptionAr) ??
    copy.fallbackDescription;

  return (
    <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={centerName}
      heroDescription={description}
      content={<PublicCenterDetail locale={locale} center={result.data} />}
    />
  );
}
