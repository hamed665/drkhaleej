import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';

type Params = {
  locale: string;
  country: string;
  wilayatSlug: string;
};

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
  const parentLabel = governorate ? (locale === 'ar' ? governorate.labelAr : governorate.labelEn) : undefined;

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="wilayat"
      item={wilayat}
      parentLabel={parentLabel}
    />
  );
}
