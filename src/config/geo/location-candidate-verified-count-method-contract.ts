export type OmanLocationCandidateVerifiedCountMethodStatus = 'contract-only' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateVerifiedCountMethod = {
  scope: 'verified-provider-count';
  definition: 'A provider is counted only when independent source references and a reviewer can confirm the provider belongs to the exact location candidate.';
  minimumIndependentSourcesRequired: 2;
  sourceRefsRequired: true;
  reviewerRequired: true;
  reviewedAtRequired: true;
  conflictNoteRequired: true;
  staleSourceReviewRequired: true;
  runtimeCountingAllowed: false;
  databaseAccessAllowed: false;
  importAllowed: false;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
  internalSeoLinksAllowed: false;
};

export const OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD_CONTRACT_VERSION = 'v1' as const;

export const OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD: OmanLocationCandidateVerifiedCountMethod = {
  scope: 'verified-provider-count',
  definition: 'A provider is counted only when independent source references and a reviewer can confirm the provider belongs to the exact location candidate.',
  minimumIndependentSourcesRequired: 2,
  sourceRefsRequired: true,
  reviewerRequired: true,
  reviewedAtRequired: true,
  conflictNoteRequired: true,
  staleSourceReviewRequired: true,
  runtimeCountingAllowed: false,
  databaseAccessAllowed: false,
  importAllowed: false,
  routeCreationAllowed: false,
  sitemapAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
  internalSeoLinksAllowed: false,
} as const;

export const OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD_CONTRACT = {
  version: OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD_CONTRACT_VERSION,
  status: 'contract-only' as OmanLocationCandidateVerifiedCountMethodStatus,
  method: OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD,
  runtimeCountingAllowed: false,
  databaseAccessAllowed: false,
  importAllowed: false,
  routeCreationAllowed: false,
  sitemapAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
  internalSeoLinksAllowed: false,
  nonGoals: [
    'No verified provider count is calculated by this contract.',
    'No runtime collection is enabled by this contract.',
    'No database access is enabled by this contract.',
    'No import pipeline is enabled by this contract.',
    'No route, sitemap, JSON-LD, internal SEO link, or index behavior changes by this contract.',
  ],
} as const;
