export type OmanLocationCandidateEvidenceSourceReferenceStatus = 'contract-only' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateEvidenceSourceType =
  | 'official-site'
  | 'provider-site'
  | 'map-listing'
  | 'directory'
  | 'reviewer-note';

export type OmanLocationCandidateEvidenceSourceReferenceRequirement = {
  sourceTypeRequired: true;
  sourceUrlRequired: true;
  sourceTitleRequired: true;
  reviewerRequired: true;
  reviewedAtRequired: true;
  lastSeenAtRequired: true;
  confidenceRequired: true;
  conflictNoteRequired: true;
  staleSourceReviewRequired: true;
  runtimeCollectionAllowed: false;
  databaseAccessAllowed: false;
  importAllowed: false;
};

export type OmanLocationCandidateEvidenceSourceReferenceContract = {
  version: 'v1';
  status: OmanLocationCandidateEvidenceSourceReferenceStatus;
  allowedSourceTypes: readonly OmanLocationCandidateEvidenceSourceType[];
  requirement: OmanLocationCandidateEvidenceSourceReferenceRequirement;
  runtimeCollectionAllowed: false;
  databaseAccessAllowed: false;
  importAllowed: false;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
  internalSeoLinksAllowed: false;
  nonGoals: readonly string[];
};

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT_VERSION = 'v1' as const;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_TYPES: readonly OmanLocationCandidateEvidenceSourceType[] = [
  'official-site',
  'provider-site',
  'map-listing',
  'directory',
  'reviewer-note',
] as const;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_REQUIREMENT: OmanLocationCandidateEvidenceSourceReferenceRequirement = {
  sourceTypeRequired: true,
  sourceUrlRequired: true,
  sourceTitleRequired: true,
  reviewerRequired: true,
  reviewedAtRequired: true,
  lastSeenAtRequired: true,
  confidenceRequired: true,
  conflictNoteRequired: true,
  staleSourceReviewRequired: true,
  runtimeCollectionAllowed: false,
  databaseAccessAllowed: false,
  importAllowed: false,
} as const;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT: OmanLocationCandidateEvidenceSourceReferenceContract = {
  version: OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT_VERSION,
  status: 'contract-only',
  allowedSourceTypes: OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_TYPES,
  requirement: OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_REQUIREMENT,
  runtimeCollectionAllowed: false,
  databaseAccessAllowed: false,
  importAllowed: false,
  routeCreationAllowed: false,
  sitemapAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
  internalSeoLinksAllowed: false,
  nonGoals: [
    'No evidence source references are collected by this contract.',
    'No runtime collection is enabled by this contract.',
    'No database access is enabled by this contract.',
    'No import pipeline is enabled by this contract.',
    'No route, sitemap, JSON-LD, internal SEO link, or index behavior changes by this contract.',
  ],
} as const;
