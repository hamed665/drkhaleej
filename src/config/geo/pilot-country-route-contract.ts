import type { InternalGeoCountryCode } from '@/lib/market/public-market';

export type DisabledPilotGeoRouteEntity = 'emirate' | 'city' | 'area';

export type DisabledPilotGeoRouteTemplate = {
  countryCode: InternalGeoCountryCode;
  countrySlug: string;
  routeNamespace: string;
  routeName: string;
  entity: DisabledPilotGeoRouteEntity;
  pathTemplate: string;
  routeFile: null;
  runtimeRoutesEnabled: false;
  metadataEnabled: false;
  noindexEnabled: true;
  sitemapEnabled: false;
  jsonLdEnabled: false;
  llmSurfaceEnabled: false;
  activationStatus: 'blocked-until-country-readiness';
  requiresCountryAdapter: true;
};

export const DISABLED_PILOT_COUNTRY_ROUTE_CONTRACT_VERSION = 'v1' as const;
export const DISABLED_PILOT_COUNTRY_CODE = 'ae' as const;

export const UAE_DISABLED_PILOT_ROUTE_TEMPLATES: readonly DisabledPilotGeoRouteTemplate[] = [
  {
    countryCode: 'ae',
    countrySlug: 'united-arab-emirates',
    routeNamespace: 'uae',
    routeName: 'uae-emirate',
    entity: 'emirate',
    pathTemplate: '/[locale]/[country]/uae/emirates/[emirateSlug]',
    routeFile: null,
    runtimeRoutesEnabled: false,
    metadataEnabled: false,
    noindexEnabled: true,
    sitemapEnabled: false,
    jsonLdEnabled: false,
    llmSurfaceEnabled: false,
    activationStatus: 'blocked-until-country-readiness',
    requiresCountryAdapter: true,
  },
  {
    countryCode: 'ae',
    countrySlug: 'united-arab-emirates',
    routeNamespace: 'uae',
    routeName: 'uae-city',
    entity: 'city',
    pathTemplate: '/[locale]/[country]/uae/cities/[citySlug]',
    routeFile: null,
    runtimeRoutesEnabled: false,
    metadataEnabled: false,
    noindexEnabled: true,
    sitemapEnabled: false,
    jsonLdEnabled: false,
    llmSurfaceEnabled: false,
    activationStatus: 'blocked-until-country-readiness',
    requiresCountryAdapter: true,
  },
  {
    countryCode: 'ae',
    countrySlug: 'united-arab-emirates',
    routeNamespace: 'uae',
    routeName: 'uae-area',
    entity: 'area',
    pathTemplate: '/[locale]/[country]/uae/areas/[areaSlug]',
    routeFile: null,
    runtimeRoutesEnabled: false,
    metadataEnabled: false,
    noindexEnabled: true,
    sitemapEnabled: false,
    jsonLdEnabled: false,
    llmSurfaceEnabled: false,
    activationStatus: 'blocked-until-country-readiness',
    requiresCountryAdapter: true,
  },
] as const;

export const DISABLED_PILOT_COUNTRY_ROUTE_CONTRACT = {
  version: DISABLED_PILOT_COUNTRY_ROUTE_CONTRACT_VERSION,
  countryCode: DISABLED_PILOT_COUNTRY_CODE,
  routeTemplates: UAE_DISABLED_PILOT_ROUTE_TEMPLATES,
  publicRoutesCreated: false,
  sitemapPromotionAllowed: false,
  schemaAllowed: false,
  llmSurfaceAllowed: false,
  activationRequires: [
    'country-readiness-contract',
    'geo-data-seed',
    'provider-inventory-evidence',
    'editorial-content-evidence',
    'qa-evidence',
    'publication-gates',
    'approved-promotion-review',
  ],
} as const;
