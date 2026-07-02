import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCenterDetail } from '@/components/public/public-center-detail';
import { PublicContactActions } from '@/components/public/public-contact-actions';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { getPublicCenterBySlug } from '@/lib/catalog/public-eligible-queries';
import { isPublicProfileIndexEligible } from '@/lib/catalog/public-profile-index-eligibility';
import {
  buildPublicCenterProfileSummary,
  buildPublicProfileMetaDescription,
} from '@/lib/catalog/public-profile-summary';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';
import { applyProfileMetadataIndexGate } from '@/lib/seo/profile-metadata-index-gate';

const publicBrandName = 'DrKhaleej';

type Params = { locale: string; country: string; centerSlug: string };

type RouteCopy = {
  badge: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: 'Public center profile',
    fallbackTitle: `Medical Center Profile | ${publicBrandName}`,
    fallbackDescription: `View public medical center information in Oman on ${publicBrandName}.`
  },
  ar: {
    badge: 'ملف مركز عام',
    fallbackTitle: `ملف مركز طبي | ${publicBrandName}`,
    fallbackDescription: `اطلع على معلومات عامة عن المراكز الطبية في عُمان عبر ${publicBrandName}.`
  }
};

function preferredText(locale: SupportedLocale, en: string | null, ar: string | null): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

function metadataTitle(name: string): string {
  return `${name} | ${publicBrandName}`;
}

function buildNoindexFallbackMetadata(input: {
  locale: SupportedLocale;
  country: SupportedCountry;
  centerSlug: string;
  title: string;
  description: string;
}): Metadata {
  return {
    ...buildLocalizedMetadata({
      locale: input.locale,
      country: input.country,
      pathname: `/center/${input.centerSlug}`,
      title: input.title,
      description: input.description
    }),
    robots: { index: false, follow: true }
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, centerSlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  const result = await getPublicCenterBySlug({ slug: centerSlug, country });

  if (!result.ok || !result.data) {
    return buildNoindexFallbackMetadata({
      locale,
      country,
      centerSlug,
      title: copy.fallbackTitle,
      description: copy.fallbackDescription
    });
  }

  const centerName = preferredText(locale, result.data.nameEn, result.data.nameAr) ?? result.data.nameEn;
  const profileSummary = buildPublicCenterProfileSummary(locale, result.data);
  const metadata = buildLocalizedMetadata({
    locale,
    country,
    pathname: `/center/${centerSlug}`,
    title: metadataTitle(centerName),
    description: buildPublicProfileMetaDescription(profileSummary)
  });
  const indexEligibility = isPublicProfileIndexEligible(result.data, {
    kind: 'center',
    locale,
    fromPublicEligibleQuery: true,
  });

  return applyProfileMetadataIndexGate(metadata, indexEligibility);
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
  const profileSummary = buildPublicCenterProfileSummary(locale, result.data);
  const description =
    preferredText(locale, result.data.shortDescriptionEn, result.data.shortDescriptionAr) ??
    preferredText(locale, result.data.descriptionEn, result.data.descriptionAr) ??
    profileSummary;
  const actionKey = `${'contact'}Actions` as const;
  const approvedHeroActions = result.data[actionKey];
  const heroActions = approvedHeroActions.length > 0
    ? <PublicContactActions actions={approvedHeroActions} locale={locale} />
    : null;

  return (
    <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={centerName}
      heroDescription={description}
      heroActions={heroActions}
      content={<PublicCenterDetail locale={locale} center={result.data} />}
    />
  );
}
