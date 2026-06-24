import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_AREAS, OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { getOmanGeoPublicationGates } from '@/lib/geo/oman-publication-gates';
import { getOmanGeoReadiness } from '@/lib/geo/oman-readiness';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoNoindexMetadata } from '@/lib/seo/geo-route-metadata';

type Params = {
  locale: string;
  country: string;
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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, areaSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    return {};
  }

  const area = OMAN_AREAS.find((item) => item.slug === areaSlug);

  if (!area) {
    return {};
  }

  const parentLabel = buildParentLabel(locale, area);

  return buildOmanGeoNoindexMetadata({
    locale,
    country,
    entity: 'area',
    item: area,
    pathname: `/oman/areas/${area.slug}`,
    ...(parentLabel ? { parentLabel } : {}),
  });
}

export default async function OmanAreaPage({ params }: { params: Promise<Params> }) {
  const { locale, country, areaSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    notFound();
  }

  const area = OMAN_AREAS.find((item) => item.slug === areaSlug);

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
