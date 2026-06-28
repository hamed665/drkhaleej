import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateEvidenceSnapshotStatus = 'contract-only' | 'draft' | 'ready-for-review' | 'approved';

export type OmanLocationCandidateEvidenceSnapshotRequirement = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  parentHierarchyRequired: boolean;
  providerCountsRequired: boolean;
  evidenceCountsRequired: boolean;
  readinessStatusRequired: boolean;
  promotionReviewRequired: boolean;
  blockedReasonsRequired: boolean;
  sourceRefsRequired: boolean;
  reviewerRequired: boolean;
  snapshotPromotionAllowed: boolean;
};

export type OmanLocationCandidateEvidenceSnapshotShape = {
  candidatePath: string;
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  parentHierarchyResolved: boolean;
  publishedProviderCount: number;
  verifiedProviderCount: number;
  approvedEvidenceEntries: number;
  readinessStatus: 'blocked' | 'preview' | 'eligible_for_review' | 'indexable';
  promotionReviewApproved: boolean;
  sourceRefs: readonly string[];
  reviewedBy: string | null;
  reviewedAt: string | null;
  blockedReasons: readonly string[];
};

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_CONTRACT_VERSION = 'v1' as const;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS: readonly OmanLocationCandidateEvidenceSnapshotRequirement[] = [
  {
    entity: 'governorate',
    dimension: 'category',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'governorate',
    dimension: 'service',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'governorate',
    dimension: 'specialty',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'wilayat',
    dimension: 'category',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'wilayat',
    dimension: 'service',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'wilayat',
    dimension: 'specialty',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'area',
    dimension: 'category',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'area',
    dimension: 'service',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
  {
    entity: 'area',
    dimension: 'specialty',
    parentHierarchyRequired: true,
    providerCountsRequired: true,
    evidenceCountsRequired: true,
    readinessStatusRequired: true,
    promotionReviewRequired: true,
    blockedReasonsRequired: true,
    sourceRefsRequired: true,
    reviewerRequired: true,
    snapshotPromotionAllowed: false,
  },
] as const;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_CONTRACT = {
  version: OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_CONTRACT_VERSION,
  status: 'contract-only' as OmanLocationCandidateEvidenceSnapshotStatus,
  requirements: OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS,
  currentSnapshotsAvailable: false,
  runtimeSnapshotGenerationAllowed: false,
  databaseAccessAllowed: false,
  sitemapPromotionAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
  nonGoals: [
    'No candidate evidence snapshot is generated by this contract.',
    'No database access is added by this contract.',
    'No route is added by this contract.',
    'No sitemap inclusion is allowed by this contract.',
    'No JSON-LD is generated by this contract.',
    'No candidate becomes indexable by this contract.',
  ],
} as const;
