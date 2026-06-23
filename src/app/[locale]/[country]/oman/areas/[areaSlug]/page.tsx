import { notFound } from 'next/navigation';

import { OmanGeoRuntimeScaffold } from '@/components/geo/oman-geo-runtime-scaffold';
import { OMAN_AREAS, OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';

type Params = {
  locale: string;
  country: string;
  areaSlug: string;
};

export default async function OmanAreaPage({ params }: { params: Promise<Params> }) {
  const { locale, country, areaSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country) || country !== 'om') {
    notFound();
  }

  const area = OMAN_AREAS.find((item) => item.slug === areaSlug);

  if (!area) {
    notFound();
  }

  const wilayat = OMAN_WILAYATS.find((item) => item.slug === area.wilayatSlug);
  const governorate = OMAN_GOVERNORATES.find((item) => item.slug === area.governorateSlug);
  const parentParts = [wilayat, governorate]
    .filter(Boolean)
    .map((item) => (locale === 'ar' ? item.labelAr : item.labelEn));
  const parentLabel = parentParts.length > 0 ? parentParts.join(' · ') : undefined;

  return (
    <OmanGeoRuntimeScaffold
      locale={locale}
      country={country}
      entity="area"
      item={area}
      parentLabel={parentLabel}
    />
  );
}
