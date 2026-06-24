import { internalGeoCountryCodes, type InternalGeoCountryCode } from '@/lib/market/public-market';

export type DrMuscatCountryAdapterStatus = 'active' | 'disabled-draft';
export type DrMuscatCountryGeoLevelKey =
  | 'governorate'
  | 'wilayat'
  | 'area'
  | 'emirate'
  | 'city'
  | 'district'
  | 'region'
  | 'municipality'
  | 'state'
  | 'province'
  | 'nation';

export type DrMuscatCountryGeoLevel = {
  key: DrMuscatCountryGeoLevelKey;
  order: number;
  routeSegment: string;
  routeParam: string;
  parentKey: DrMuscatCountryGeoLevelKey | null;
  enabled: boolean;
};

export type DrMuscatCountryAdapter = {
  countryCode: InternalGeoCountryCode;
  countrySlug: string;
  status: DrMuscatCountryAdapterStatus;
  publicEnabled: boolean;
  seoIndexable: boolean;
  sitemapEnabled: boolean;
  llmSurfaceEnabled: boolean;
  supportedLocales: readonly ['en', 'ar'];
  defaultLocale: 'en';
  geoLevels: readonly DrMuscatCountryGeoLevel[];
  routeNamespace: string;
  metadataPolicy: 'noindex-first';
  publicationPolicy: 'gated';
  schemaPolicy: 'disabled-until-approved';
};

export const DRMUSCAT_COUNTRY_ADAPTER_CONTRACT_VERSION = 'v1' as const;

const omanGeoLevels = [
  {
    key: 'governorate',
    order: 1,
    routeSegment: 'governorates',
    routeParam: 'governorateSlug',
    parentKey: null,
    enabled: true,
  },
  {
    key: 'wilayat',
    order: 2,
    routeSegment: 'wilayats',
    routeParam: 'wilayatSlug',
    parentKey: 'governorate',
    enabled: true,
  },
  {
    key: 'area',
    order: 3,
    routeSegment: 'areas',
    routeParam: 'areaSlug',
    parentKey: 'wilayat',
    enabled: true,
  },
] as const satisfies readonly DrMuscatCountryGeoLevel[];

const uaeDraftGeoLevels = [
  {
    key: 'emirate',
    order: 1,
    routeSegment: 'emirates',
    routeParam: 'emirateSlug',
    parentKey: null,
    enabled: false,
  },
  {
    key: 'city',
    order: 2,
    routeSegment: 'cities',
    routeParam: 'citySlug',
    parentKey: 'emirate',
    enabled: false,
  },
  {
    key: 'area',
    order: 3,
    routeSegment: 'areas',
    routeParam: 'areaSlug',
    parentKey: 'city',
    enabled: false,
  },
] as const satisfies readonly DrMuscatCountryGeoLevel[];

const canadaDraftGeoLevels = [
  {
    key: 'province',
    order: 1,
    routeSegment: 'provinces',
    routeParam: 'provinceSlug',
    parentKey: null,
    enabled: false,
  },
  {
    key: 'city',
    order: 2,
    routeSegment: 'cities',
    routeParam: 'citySlug',
    parentKey: 'province',
    enabled: false,
  },
  {
    key: 'area',
    order: 3,
    routeSegment: 'areas',
    routeParam: 'areaSlug',
    parentKey: 'city',
    enabled: false,
  },
] as const satisfies readonly DrMuscatCountryGeoLevel[];

const unitedStatesDraftGeoLevels = [
  {
    key: 'state',
    order: 1,
    routeSegment: 'states',
    routeParam: 'stateSlug',
    parentKey: null,
    enabled: false,
  },
  {
    key: 'city',
    order: 2,
    routeSegment: 'cities',
    routeParam: 'citySlug',
    parentKey: 'state',
    enabled: false,
  },
  {
    key: 'area',
    order: 3,
    routeSegment: 'areas',
    routeParam: 'areaSlug',
    parentKey: 'city',
    enabled: false,
  },
] as const satisfies readonly DrMuscatCountryGeoLevel[];

const unitedKingdomDraftGeoLevels = [
  {
    key: 'nation',
    order: 1,
    routeSegment: 'nations',
    routeParam: 'nationSlug',
    parentKey: null,
    enabled: false,
  },
  {
    key: 'city',
    order: 2,
    routeSegment: 'cities',
    routeParam: 'citySlug',
    parentKey: 'nation',
    enabled: false,
  },
  {
    key: 'area',
    order: 3,
    routeSegment: 'areas',
    routeParam: 'areaSlug',
    parentKey: 'city',
    enabled: false,
  },
] as const satisfies readonly DrMuscatCountryGeoLevel[];

type DraftCountryAdapterOverride = {
  countrySlug: string;
  routeNamespace: string;
  geoLevels: readonly DrMuscatCountryGeoLevel[];
};

const draftCountryAdapterOverrides: Partial<Record<InternalGeoCountryCode, DraftCountryAdapterOverride>> = {
  ae: {
    countrySlug: 'united-arab-emirates',
    routeNamespace: 'uae',
    geoLevels: uaeDraftGeoLevels,
  },
  ca: {
    countrySlug: 'canada',
    routeNamespace: 'canada',
    geoLevels: canadaDraftGeoLevels,
  },
  us: {
    countrySlug: 'united-states',
    routeNamespace: 'united-states',
    geoLevels: unitedStatesDraftGeoLevels,
  },
  gb: {
    countrySlug: 'united-kingdom',
    routeNamespace: 'uk',
    geoLevels: unitedKingdomDraftGeoLevels,
  },
};

function disabledDraftAdapter(countryCode: InternalGeoCountryCode): DrMuscatCountryAdapter {
  const override = draftCountryAdapterOverrides[countryCode];

  return {
    countryCode,
    countrySlug: override?.countrySlug ?? countryCode,
    status: 'disabled-draft',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    llmSurfaceEnabled: false,
    supportedLocales: ['en', 'ar'],
    defaultLocale: 'en',
    geoLevels: override?.geoLevels ?? [],
    routeNamespace: override?.routeNamespace ?? countryCode,
    metadataPolicy: 'noindex-first',
    publicationPolicy: 'gated',
    schemaPolicy: 'disabled-until-approved',
  };
}

export const DRMUSCAT_COUNTRY_ADAPTERS: readonly DrMuscatCountryAdapter[] = internalGeoCountryCodes.map((countryCode) => {
  if (countryCode === 'om') {
    return {
      countryCode: 'om',
      countrySlug: 'oman',
      status: 'active',
      publicEnabled: true,
      seoIndexable: true,
      sitemapEnabled: true,
      llmSurfaceEnabled: false,
      supportedLocales: ['en', 'ar'],
      defaultLocale: 'en',
      geoLevels: omanGeoLevels,
      routeNamespace: 'oman',
      metadataPolicy: 'noindex-first',
      publicationPolicy: 'gated',
      schemaPolicy: 'disabled-until-approved',
    } satisfies DrMuscatCountryAdapter;
  }

  return disabledDraftAdapter(countryCode);
});

export const DRMUSCAT_COUNTRY_ADAPTER_CONTRACT = {
  version: DRMUSCAT_COUNTRY_ADAPTER_CONTRACT_VERSION,
  adapters: DRMUSCAT_COUNTRY_ADAPTERS,
  activeCountryCodes: ['om'],
  disabledDraftCountryCodes: internalGeoCountryCodes.filter((countryCode) => countryCode !== 'om'),
  defaultMetadataPolicy: 'noindex-first',
  defaultPublicationPolicy: 'gated',
  defaultSchemaPolicy: 'disabled-until-approved',
  nonGoals: [
    'No non-Oman country is public-enabled by this adapter contract.',
    'No non-Oman route is created by this adapter contract.',
    'No sitemap entry is created by this adapter contract.',
    'No JSON-LD is generated by this adapter contract.',
    'No index promotion is enabled by this adapter contract.',
  ],
} as const;
