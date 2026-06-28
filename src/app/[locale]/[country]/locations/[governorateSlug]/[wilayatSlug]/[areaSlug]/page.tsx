import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_AREAS, OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { buildOmanAreaLocationPath } from '@/config/geo/oman-location-paths';
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
  areaSlug: string;
};

function buildParentLabel(locale: 'en' | 'ar', area: (typeof OMAN_AREAS)[number]): string | null {
  const wilayat = OMAN_WILAYATS.find((item) => item.slug === area.wilayatSlug);
  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === area.governorateSlug);
  const parentParts = [
    wilayat ? (locale === 'ar' ? wilayat.labelAr : wilayat.labelEn) : null,
    governorate ? (locale === 'ar' ? governorate.labelAr : governorate.labelEn) : null,
  ].filter(Boolean);

  return parentParts.length > 0 ? parentParts.join(' · ') : null;
}

function resolveArea(governorateSlug: string, wilayatSlug: string, areaSlug: string): (typeof OMAN_AREAS)[number] | null {
  return (
    OMAN_AREAS.find(
      (item) => item.slug === areaSlug && item.governorateSlug === governorateSlug && item.wilayatSlug === wilayatSlug
    ) ?? null
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, governorateSlug, wilayatSlug, areaSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    return {};
  }

  const area = resolveArea(governorateSlug, wilayatSlug, areaSlug);

  if (!area) {
    return {};
  }

  const parentLabel = buildParentLabel(locale, area);

  return buildOmanGeoGatedMetadata({
    locale,
    country,
    entity: 'area',
    item: area,
    pathname: buildOmanAreaLocationPath({
      locale,
      country,
      governorateSlug,
      wilayatSlug,
      areaSlug: area.slug,
    }),
    ...(parentLabel ? { parentLabel } : {}),
  });
}

export default async function OmanAreaLocationPage({ params }: { params: Promise<Params> }) {
  const { locale, country, governorateSlug, wilayatSlug, areaSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    notFound();
  }

  const area = resolveArea(governorateSlug, wilayatSlug, areaSlug);

  if (!area) {
    notFound();
  }

  const parentLabel = buildParentLabel(locale, area);
  const readiness = getOmanGeoReadiness({ entity: 'area', slug: area.slug, locale });
  const publicationGates = getOmanGeoPublicationGates({
    entity: 'area',
    slug: area.slug,
    locale,
    readiness,
  });

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="area"
      item={area}
      editorialContent={readiness.editorialContent}
      providerInventory={readiness.providerInventory}
      indexPromotionEligibility={readiness.indexPromotionEligibility}
      readiness={readiness}
      publicationGates={publicationGates}
      {...(parentLabel ? { parentLabel } : {})}
    />
  );
}
