import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { getOmanGeoEditorialContent } from '@/lib/geo/oman-editorial-content';
import { getOmanGeoIndexPromotionEligibility } from '@/lib/geo/oman-index-promotion-eligibility';
import { getOmanGeoProviderInventoryContract } from '@/lib/geo/oman-provider-inventory';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoNoindexMetadata } from '@/lib/seo/geo-route-metadata';

type Params = {
  locale: string;
  country: string;
  wilayatSlug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, wilayatSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    return {};
  }

  const wilayat = OMAN_WILAYATS.find((item) => item.slug === wilayatSlug);

  if (!wilayat) {
    return {};
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === wilayat.governorateSlug);
  const parentLabel = governorate ? (locale === 'ar' ? governorate.labelAr : governorate.labelEn) : null;

  return buildOmanGeoNoindexMetadata({
    locale,
    country,
    entity: 'wilayat',
    item: wilayat,
    pathname: `/oman/wilayats/${wilayat.slug}`,
    ...(parentLabel ? { parentLabel } : {}),
  });
}

export default async function OmanWilayatPage({ params }: { params: Promise<Params> }) {
  const { locale, country, wilayatSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    notFound();
  }

  const wilayat = OMAN_WILAYATS.find((item) => item.slug === wilayatSlug);

  if (!wilayat) {
    notFound();
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === wilayat.governorateSlug);
  const parentLabel = governorate ? (locale === 'ar' ? governorate.labelAr : governorate.labelEn) : null;
  const editorialContent = getOmanGeoEditorialContent({
    entity: 'wilayat',
    slug: wilayat.slug,
    locale,
  });
  const providerInventory = getOmanGeoProviderInventoryContract({ entity: 'wilayat' });
  const indexPromotionEligibility = getOmanGeoIndexPromotionEligibility({
    entity: 'wilayat',
    slug: wilayat.slug,
    locale,
  });

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="wilayat"
      item={wilayat}
      editorialContent={editorialContent}
      providerInventory={providerInventory}
      indexPromotionEligibility={indexPromotionEligibility}
      {...(parentLabel ? { parentLabel } : {})}
    />
  );
}
