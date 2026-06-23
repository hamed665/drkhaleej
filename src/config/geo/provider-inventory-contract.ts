import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoProviderInventoryStatus = 'contract-only' | 'draft' | 'ready-for-review' | 'published';

export type OmanGeoProviderInventorySource = 'future-provider-index' | 'future-provider-query' | 'future-qa-review';

export type OmanGeoProviderInventoryEntityContract = {
  entity: OmanGeoRouteEntity;
  minimumPublishedProviders: number;
  status: OmanGeoProviderInventoryStatus;
  source: OmanGeoProviderInventorySource;
  publishedProviderCount: number;
  verifiedProviderCount: number;
  acceptsAppointmentsCount: number;
  requiresPublishedProviderProfiles: boolean;
  requiresHumanReview: boolean;
  providerQueryAllowed: boolean;
  databaseAccessAllowed: boolean;
  indexPromotionAllowed: boolean;
  sitemapPromotionAllowed: boolean;
};

export const OMAN_GEO_PROVIDER_INVENTORY_CONTRACT_VERSION = 'v1' as const;

export const OMAN_GEO_PROVIDER_INVENTORY_CONTRACTS: readonly OmanGeoProviderInventoryEntityContract[] = [
  {
    entity: 'governorate',
    minimumPublishedProviders: 12,
    status: 'contract-only',
    source: 'future-provider-index',
    publishedProviderCount: 0,
    verifiedProviderCount: 0,
    acceptsAppointmentsCount: 0,
    requiresPublishedProviderProfiles: true,
    requiresHumanReview: true,
    providerQueryAllowed: false,
    databaseAccessAllowed: false,
    indexPromotionAllowed: false,
    sitemapPromotionAllowed: false,
  },
  {
    entity: 'wilayat',
    minimumPublishedProviders: 6,
    status: 'contract-only',
    source: 'future-provider-index',
    publishedProviderCount: 0,
    verifiedProviderCount: 0,
    acceptsAppointmentsCount: 0,
    requiresPublishedProviderProfiles: true,
    requiresHumanReview: true,
    providerQueryAllowed: false,
    databaseAccessAllowed: false,
    indexPromotionAllowed: false,
    sitemapPromotionAllowed: false,
  },
  {
    entity: 'area',
    minimumPublishedProviders: 3,
    status: 'contract-only',
    source: 'future-provider-index',
    publishedProviderCount: 0,
    verifiedProviderCount: 0,
    acceptsAppointmentsCount: 0,
    requiresPublishedProviderProfiles: true,
    requiresHumanReview: true,
    providerQueryAllowed: false,
    databaseAccessAllowed: false,
    indexPromotionAllowed: false,
    sitemapPromotionAllowed: false,
  },
] as const;

export const OMAN_GEO_PROVIDER_INVENTORY_CONTRACT = {
  version: OMAN_GEO_PROVIDER_INVENTORY_CONTRACT_VERSION,
  status: 'contract-only' as OmanGeoProviderInventoryStatus,
  contracts: OMAN_GEO_PROVIDER_INVENTORY_CONTRACTS,
  currentInventoryEvidenceAvailable: false,
  providerQueryAllowed: false,
  databaseAccessAllowed: false,
  promotionRequiresRuntimeEvidence: true,
  promotionRequiresApprovedPr: true,
  nonGoals: [
    'No provider query is added by this contract.',
    'No database access is added by this contract.',
    'No provider listing UI is added by this contract.',
    'No geo route becomes indexable by this contract.',
    'No geo route becomes sitemap-eligible by this contract.',
  ],
} as const;
