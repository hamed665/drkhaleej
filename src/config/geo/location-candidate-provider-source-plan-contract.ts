import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateProviderSourcePlanStatus = 'contract-only' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateProviderSourceType =
  | 'official-site'
  | 'clinic-site'
  | 'map-listing'
  | 'directory'
  | 'social-proof'
  | 'manual-reviewer';

export type OmanLocationCandidateProviderSourceRequirement = {
  sourceType: OmanLocationCandidateProviderSourceType;
  allowed: true;
  requiredForImport: true;
  reviewerRequired: true;
  conflictNoteRequired: true;
  runtimeCollectionAllowed: false;
  databaseAccessAllowed: false;
  importAllowed: false;
};

export type OmanLocationCandidateProviderSourcePlanPolicy = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  requirements: readonly OmanLocationCandidateProviderSourceRequirement[];
  dataImportAllowed: false;
  runtimeCollectionAllowed: false;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
};

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT_VERSION = 'v1' as const;

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_TYPES: readonly OmanLocationCandidateProviderSourceType[] = [
  'official-site',
  'clinic-site',
  'map-listing',
  'directory',
  'social-proof',
  'manual-reviewer',
] as const;

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS: readonly OmanLocationCandidateProviderSourceRequirement[] =
  OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_TYPES.map((sourceType) => ({
    sourceType,
    allowed: true,
    requiredForImport: true,
    reviewerRequired: true,
    conflictNoteRequired: true,
    runtimeCollectionAllowed: false,
    databaseAccessAllowed: false,
    importAllowed: false,
  }));

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_POLICIES: readonly OmanLocationCandidateProviderSourcePlanPolicy[] = [
  { entity: 'governorate', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'governorate', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'governorate', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_REQUIREMENTS, dataImportAllowed: false, runtimeCollectionAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
] as const;

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT = {
  version: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT_VERSION,
  status: 'contract-only' as OmanLocationCandidateProviderSourcePlanStatus,
  sourceTypes: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_TYPES,
  policies: OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_POLICIES,
  dataImportAllowedByDefault: false,
  runtimeCollectionAllowedByDefault: false,
  databaseAccessAllowed: false,
  routeCreationAllowed: false,
  sitemapAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
  internalSeoLinksAllowed: false,
  nonGoals: [
    'No provider data is imported by this contract.',
    'No provider source is collected at runtime by this contract.',
    'No database access is enabled by this contract.',
    'No route is added by this contract.',
    'No sitemap entry is allowed by this contract.',
    'No JSON-LD is generated by this contract.',
    'No index promotion is allowed by this contract.',
  ],
} as const;
