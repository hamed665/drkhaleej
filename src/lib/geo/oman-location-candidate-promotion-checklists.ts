import {
  OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_CONTRACT,
  OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_POLICIES,
  type OmanLocationCandidatePromotionChecklistPolicy,
  type OmanLocationCandidatePromotionChecklistStatus,
} from '@/config/geo/location-candidate-promotion-checklist-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

import {
  getOmanLocationCandidateEvidenceSnapshotState,
  type OmanLocationCandidateEvidenceSnapshotInput,
  type OmanLocationCandidateEvidenceSnapshotRuntimeState,
} from './oman-location-candidate-evidence-snapshots';

export type OmanLocationCandidatePromotionChecklistInput = OmanLocationCandidateEvidenceSnapshotInput;

export type OmanLocationCandidatePromotionChecklistRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  candidatePath: string;
  locationSlug: string;
  status: OmanLocationCandidatePromotionChecklistStatus;
  policy: OmanLocationCandidatePromotionChecklistPolicy | null;
  snapshotState: OmanLocationCandidateEvidenceSnapshotRuntimeState;
  reviewAllowed: boolean;
  promotionAllowed: boolean;
  canIndex: boolean;
  canSitemap: boolean;
  canEmitJsonLd: boolean;
  canUseInternalSeoLinks: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidatePromotionChecklistPolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidatePromotionChecklistPolicy | null {
  return (
    OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidatePromotionChecklistState(
  input: OmanLocationCandidatePromotionChecklistInput,
): OmanLocationCandidatePromotionChecklistRuntimeState {
  const policy = getOmanLocationCandidatePromotionChecklistPolicy({
    entity: input.entity,
    dimension: input.dimension,
  });
  const snapshotState = getOmanLocationCandidateEvidenceSnapshotState(input);
  const blockedReasons = [
    ...(policy ? [] : ['missing-candidate-promotion-checklist-policy']),
    ...snapshotState.blockedReasons,
    'candidate-promotion-checklist-contract-only',
    'candidate-promotion-review-disabled',
    'candidate-promotion-runtime-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    candidatePath: input.candidatePath,
    locationSlug: input.locationSlug,
    status: 'blocked',
    policy,
    snapshotState,
    reviewAllowed: false,
    promotionAllowed: false,
    canIndex: false,
    canSitemap: false,
    canEmitJsonLd: false,
    canUseInternalSeoLinks: false,
    blockedReasons,
  };
}

export function getOmanLocationCandidatePromotionChecklistRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_CONTRACT;
}
