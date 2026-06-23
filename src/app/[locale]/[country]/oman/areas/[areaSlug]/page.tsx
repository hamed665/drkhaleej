import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_AREAS, OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoNoindexMetadata } from '@/lib/seo/geo-route-metadata';

type Params = {
  locale: string;
  country: string;
  areaSlug: string;
};

function buildParentParts(locale: 'en' | 'ar', area: (typeof OMAN_AREAS)[number]): string[] {
  const wilayat = OMAN_WILAYATS.find((item) => item.slug === area.wilayatSlug);
  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === area.governorateSlug);
  const parentParts: string[] = [];

  if (wilayat) {
    parentParts.push(locale === 'ar' ? wilayat.labelAr : wilayat.labelEn);
  }

  if (governorate) {
    parentParts.push(locale === 'ar' ? governorate.labelAr : governorate.labelEn);
  }

  return parentParts;
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

  const parentParts = buildParentParts(locale, area);
  const parentLabel = parentParts.length > 0 ? parentParts.join(' · ') : null;

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

  const parentParts = buildParentParts(locale, area);
  const parentLabel = parentParts.length > 0 ? parentParts.join(' · ') : null;

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="area"
      item={area}
      {...(parentLabel ? { parentLabel } : {})}
    />
  );
}
