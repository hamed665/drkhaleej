import {
  OMAN_LOCATION_THRESHOLD_POLICIES,
  type OmanLocationCandidateDimension,
  type OmanLocationThresholdPolicy,
} from '@/config/geo/location-threshold-policy';
import type { OmanGeoEditorialContentLocale } from '@/config/geo/editorial-content-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateStatus = 'blocked' | 'preview' | 'eligible_for_review' | 'indexable';

export type OmanLocationCandidateInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
  parentHierarchyResolved: boolean;
};

export type OmanLocationCandidateRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
  status: OmanLocationCandidateStatus;
  policy: OmanLocationThresholdPolicy | null;
  parentHierarchyResolved: boolean;
  providerThresholdMet: boolean;
  approvedEvidenceComplete: boolean;
  readinessGatesComplete: boolean;
  humanReviewComplete: boolean;
  promotionPrApproved: boolean;
  canRenderPreview: boolean;
  canIndex: boolean;
  canSitemap: boolean;
  canEmitJsonLd: boolean;
  canUseInternalSeoLinks: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationThresholdPolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationThresholdPolicy | null {
  return (
    OMAN_LOCATION_THRESHOLD_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateState(input: OmanLocationCandidateInput): OmanLocationCandidateRuntimeState {
  const policy = getOmanLocationThresholdPolicy({ entity: input.entity, dimension: input.dimension });
  const providerThresholdMet = false;
  const approvedEvidenceComplete = false;
  const readinessGatesComplete = false;
  const humanReviewComplete = false;
  const promotionPrApproved = false;
  const blockedReasons = [
    ...(policy ? [] : ['missing-location-threshold-policy']),
    ...(input.parentHierarchyResolved ? [] : ['parent-hierarchy-not-resolved']),
    ...(providerThresholdMet ? [] : ['provider-threshold-not-met']),
    ...(approvedEvidenceComplete ? [] : ['approved-evidence-incomplete']),
    ...(readinessGatesComplete ? [] : ['readiness-gates-incomplete']),
    ...(humanReviewComplete ? [] : ['human-review-incomplete']),
    ...(promotionPrApproved ? [] : ['promotion-pr-approval-missing']),
    'location-candidate-engine-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    slug: input.slug,
    locale: input.locale,
    status: 'blocked',
    policy,
    parentHierarchyResolved: input.parentHierarchyResolved,
    providerThresholdMet,
    approvedEvidenceComplete,
    readinessGatesComplete,
    humanReviewComplete,
    promotionPrApproved,
    canRenderPreview: false,
    canIndex: false,
    canSitemap: false,
    canEmitJsonLd: false,
    canUseInternalSeoLinks: false,
    blockedReasons,
  };
}
