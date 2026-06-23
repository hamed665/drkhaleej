import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_GOVERNORATES } from '@/config/geo/oman';
import { getOmanGeoEditorialContent } from '@/lib/geo/oman-editorial-content';
import { getOmanGeoProviderInventoryContract } from '@/lib/geo/oman-provider-inventory';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { buildOmanGeoNoindexMetadata } from '@/lib/seo/geo-route-metadata';

type Params = {
  locale: string;
  country: string;
  governorateSlug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, governorateSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    return {};
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === governorateSlug);

  if (!governorate) {
    return {};
  }

  return buildOmanGeoNoindexMetadata({
    locale,
    country,
    entity: 'governorate',
    item: governorate,
    pathname: `/oman/governorates/${governorate.slug}`,
  });
}

export default async function OmanGovernoratePage({ params }: { params: Promise<Params> }) {
  const { locale, country, governorateSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    notFound();
  }

  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === governorateSlug);

  if (!governorate) {
    notFound();
  }

  const editorialContent = getOmanGeoEditorialContent({
    entity: 'governorate',
    slug: governorate.slug,
    locale,
  });
  const providerInventory = getOmanGeoProviderInventoryContract({ entity: 'governorate' });

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="governorate"
      item={governorate}
      editorialContent={editorialContent}
      providerInventory={providerInventory}
    />
  );
}
