import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoProviderReadinessSource = 'future-provider-index' | 'future-editorial-content' | 'future-qa-review';

export type OmanGeoProviderReadinessRule = {
  key: string;
  source: OmanGeoProviderReadinessSource;
  description: string;
  required: boolean;
};

export type OmanGeoProviderReadinessEntityContract = {
  entity: OmanGeoRouteEntity;
  minimumPublishedProviders: number;
  minimumEditorialWords: number;
  requiresArabicCopy: boolean;
  requiresEnglishCopy: boolean;
  requiresCanonicalReview: boolean;
  requiresHreflangReview: boolean;
  requiresThinPageReview: boolean;
  sitemapPromotionAllowed: boolean;
  indexPromotionAllowed: boolean;
  rules: readonly OmanGeoProviderReadinessRule[];
};

export const OMAN_GEO_PROVIDER_READINESS_CONTRACT_VERSION = 'v1' as const;

const sharedReadinessRules = [
  {
    key: 'published-provider-count',
    source: 'future-provider-index',
    description: 'Published provider inventory must meet the minimum threshold for the geo entity type.',
    required: true,
  },
  {
    key: 'localized-editorial-content',
    source: 'future-editorial-content',
    description: 'English and Arabic editorial copy must exist before index promotion.',
    required: true,
  },
  {
    key: 'canonical-hreflang-review',
    source: 'future-qa-review',
    description: 'Canonical and hreflang behavior must be reviewed before index promotion.',
    required: true,
  },
  {
    key: 'thin-page-review',
    source: 'future-qa-review',
    description: 'Thin-page risk must be reviewed before noindex can be removed.',
    required: true,
  },
] as const;

export const OMAN_GEO_PROVIDER_READINESS_CONTRACTS: readonly OmanGeoProviderReadinessEntityContract[] = [
  {
    entity: 'governorate',
    minimumPublishedProviders: 12,
    minimumEditorialWords: 120,
    requiresArabicCopy: true,
    requiresEnglishCopy: true,
    requiresCanonicalReview: true,
    requiresHreflangReview: true,
    requiresThinPageReview: true,
    sitemapPromotionAllowed: false,
    indexPromotionAllowed: false,
    rules: sharedReadinessRules,
  },
  {
    entity: 'wilayat',
    minimumPublishedProviders: 6,
    minimumEditorialWords: 90,
    requiresArabicCopy: true,
    requiresEnglishCopy: true,
    requiresCanonicalReview: true,
    requiresHreflangReview: true,
    requiresThinPageReview: true,
    sitemapPromotionAllowed: false,
    indexPromotionAllowed: false,
    rules: sharedReadinessRules,
  },
  {
    entity: 'area',
    minimumPublishedProviders: 3,
    minimumEditorialWords: 70,
    requiresArabicCopy: true,
    requiresEnglishCopy: true,
    requiresCanonicalReview: true,
    requiresHreflangReview: true,
    requiresThinPageReview: true,
    sitemapPromotionAllowed: false,
    indexPromotionAllowed: false,
    rules: sharedReadinessRules,
  },
] as const;

export const OMAN_GEO_PROVIDER_READINESS_CONTRACT = {
  version: OMAN_GEO_PROVIDER_READINESS_CONTRACT_VERSION,
  contracts: OMAN_GEO_PROVIDER_READINESS_CONTRACTS,
  promotionRequiresRuntimeEvidence: true,
  promotionRequiresApprovedPr: true,
  currentRuntimeEvidenceAvailable: false,
  nonGoals: [
    'No provider queries are added by this contract.',
    'No database access is added by this contract.',
    'No geo route becomes indexable by this contract.',
    'No geo route becomes sitemap-eligible by this contract.',
  ],
} as const;
