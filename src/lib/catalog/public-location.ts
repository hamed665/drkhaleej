import type { PublicCatalogLocale, PublicProviderLocationSummary } from './public-types';

export function getPreferredPublicLocationName(
  locale: PublicCatalogLocale,
  en: string | null,
  ar: string | null
): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

export function formatPublicLocationName(
  locale: PublicCatalogLocale,
  location: PublicProviderLocationSummary | null
): string | null {
  if (!location) return null;
  return getPreferredPublicLocationName(locale, location.locationNameEn, location.locationNameAr);
}

export function formatPublicLocationGeoLine(
  locale: PublicCatalogLocale,
  location: PublicProviderLocationSummary | null
): string | null {
  if (!location) return null;

  const area = getPreferredPublicLocationName(locale, location.areaNameEn, location.areaNameAr);
  const city = getPreferredPublicLocationName(locale, location.cityNameEn, location.cityNameAr);
  const country = getPreferredPublicLocationName(locale, location.countryNameEn, location.countryNameAr);

  return [area, city, country].filter(Boolean).join(' · ') || null;
}

export function formatPublicLocationSummary(
  locale: PublicCatalogLocale,
  location: PublicProviderLocationSummary | null
): string | null {
  if (!location) return null;

  const locationName = formatPublicLocationName(locale, location);
  const geoLine = formatPublicLocationGeoLine(locale, location);

  return [locationName, geoLine].filter(Boolean).join(' · ') || null;
}
