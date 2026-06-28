import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { buildOmanWilayatLocationPath } from '@/config/geo/oman-location-paths';
import { isOmanCountryRoute } from '@/lib/geo/oman-country-adapter';
import { getOmanGeoPublicationGates } from '@/lib/geo/oman-publication-gates';
import { getOmanGeoReadiness } from '@/lib/geo/oman-readiness';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoGatedMetadata } from '@/lib/seo/oman-geo-gated-metadata';

type Params = {
  locale: string;
  country: string;
  governorateSlug: string;
  wilayatSlug: string;
};

function getParentLabel(locale: 'en' | 'ar', governorateSlug: string): string | null {
  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === governorateSlug);
  return governorate ? (locale === 'ar' ? governorate.labelAr : governorate.labelEn) : null;
}

function resolveWilayat(governorateSlug: string, wilayatSlug: string): (typeof OMAN_WILAYATS)[number] | null {
  return OMAN_WILAYATS.find((item) => item.slug === wilayatSlug && item.governorateSlug === governorateSlug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, governorateSlug, wilayatSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    return {};
  }

  const wilayat = resolveWilayat(governorateSlug, wilayatSlug);

  if (!wilayat) {
    return {};
  }

  const parentLabel = getParentLabel(locale, governorateSlug);

  return buildOmanGeoGatedMetadata({
    locale,
    country,
    entity: 'wilayat',
    item: wilayat,
    pathname: buildOmanWilayatLocationPath({
      locale,
      country,
      governorateSlug,
      wilayatSlug: wilayat.slug,
    }),
    ...(parentLabel ? { parentLabel } : {}),
  });
}

export default async function OmanWilayatLocationPage({ params }: { params: Promise<Params> }) {
  const { locale, country, governorateSlug, wilayatSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    notFound();
  }

  const wilayat = resolveWilayat(governorateSlug, wilayatSlug);

  if (!wilayat) {
    notFound();
  }

  const parentLabel = getParentLabel(locale, governorateSlug);
  const readiness = getOmanGeoReadiness({ entity: 'wilayat', slug: wilayat.slug, locale });
  const publicationGates = getOmanGeoPublicationGates({
    entity: 'wilayat',
    slug: wilayat.slug,
    locale,
    readiness,
  });

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="wilayat"
      item={wilayat}
      editorialContent={readiness.editorialContent}
      providerInventory={readiness.providerInventory}
      indexPromotionEligibility={readiness.indexPromotionEligibility}
      readiness={readiness}
      publicationGates={publicationGates}
      {...(parentLabel ? { parentLabel } : {})}
    />
  );
}
