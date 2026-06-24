import { getActiveCountryAdapter, listCountryGeoLevels } from '@/lib/geo/country-adapters';
import type { SupportedCountry } from '@/lib/i18n/config';

export type OmanAdapterGeoEntity = 'governorate' | 'wilayat' | 'area';

export const OMAN_COUNTRY_CODE = 'om' as const;

const entityToGeoLevelKey: Record<OmanAdapterGeoEntity, 'governorate' | 'wilayat' | 'area'> = {
  governorate: 'governorate',
  wilayat: 'wilayat',
  area: 'area',
};

export function getOmanCountryAdapter() {
  return getActiveCountryAdapter({ countryCode: OMAN_COUNTRY_CODE });
}

export function isOmanCountryRoute(country: string): country is SupportedCountry {
  return country === getOmanCountryAdapter()?.countryCode;
}

export function getOmanRouteNamespace(): string {
  return getOmanCountryAdapter()?.routeNamespace ?? 'oman';
}

export function getOmanGeoRouteSegment(entity: OmanAdapterGeoEntity): string {
  const levelKey = entityToGeoLevelKey[entity];
  return listCountryGeoLevels(OMAN_COUNTRY_CODE).find((level) => level.key === levelKey)?.routeSegment ?? `${entity}s`;
}

export function buildOmanGeoPath(entity: OmanAdapterGeoEntity, slug: string): string {
  return `/${getOmanRouteNamespace()}/${getOmanGeoRouteSegment(entity)}/${slug}`;
}
