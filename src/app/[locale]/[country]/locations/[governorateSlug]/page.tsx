import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { buildOmanGovernorateLocationPath } from '@/config/geo/oman-location-paths';
import { OMAN_GOVERNORATES } from '@/config/geo/oman';
import { isOmanCountryRoute } from '@/lib/geo/oman-country-adapter';
import { getOmanGeoPublicationGates } from '@/lib/geo/oman-publication-gates';
import { getOmanGeoReadiness } from '@/lib/geo/oman-readiness';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoGatedMetadata } from '@/lib/seo/oman-geo-gated-metadata';

type Params = {
  locale: string;
  country: string;
  governorateSlug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, governorateSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    return {};
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === governorateSlug);

  if (!governorate) {
    return {};
  }

  return buildOmanGeoGatedMetadata({
    locale,
    country,
    entity: 'governorate',
    item: governorate,
    pathname: buildOmanGovernorateLocationPath({
      locale,
      country,
      governorateSlug: governorate.slug,
    }),
  });
}

export default async function OmanGovernorateLocationPage({ params }: { params: Promise<Params> }) {
  const { locale, country, governorateSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || !isOmanCountryRoute(country)) {
    notFound();
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === governorateSlug);

  if (!governorate) {
    notFound();
  }

  const readiness = getOmanGeoReadiness({
    entity: 'governorate',
    slug: governorate.slug,
    locale,
  });
  const publicationGates = getOmanGeoPublicationGates({
    entity: 'governorate',
    slug: governorate.slug,
    locale,
    readiness,
  });

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="governorate"
      item={governorate}
      editorialContent={readiness.editorialContent}
      providerInventory={readiness.providerInventory}
      indexPromotionEligibility={readiness.indexPromotionEligibility}
      readiness={readiness}
      publicationGates={publicationGates}
    />
  );
}
