import {
  OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_CONTRACT,
  OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS,
  type OmanLocationCandidateEvidenceSnapshotRequirement,
  type OmanLocationCandidateEvidenceSnapshotShape,
} from '@/config/geo/location-candidate-evidence-snapshot-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

import {
  getOmanLocationCandidateState,
  type OmanLocationCandidateInput,
  type OmanLocationCandidateRuntimeState,
} from './oman-location-candidates';

export type OmanLocationCandidateEvidenceSnapshotRuntimeStatus = 'disabled' | 'blocked' | 'ready_for_review' | 'approved';

export type OmanLocationCandidateEvidenceSnapshotInput = OmanLocationCandidateInput & {
  candidatePath: string;
  locationSlug: string;
};

export type OmanLocationCandidateEvidenceSnapshotRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  candidatePath: string;
  locationSlug: string;
  status: OmanLocationCandidateEvidenceSnapshotRuntimeStatus;
  snapshotGenerationAllowed: boolean;
  promotionAllowed: boolean;
  requirement: OmanLocationCandidateEvidenceSnapshotRequirement | null;
  candidateState: OmanLocationCandidateRuntimeState;
  snapshot: OmanLocationCandidateEvidenceSnapshotShape | null;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateEvidenceSnapshotRequirement(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidateEvidenceSnapshotRequirement | null {
  return (
    OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS.find(
      (requirement) => requirement.entity === input.entity && requirement.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateEvidenceSnapshotState(
  input: OmanLocationCandidateEvidenceSnapshotInput,
): OmanLocationCandidateEvidenceSnapshotRuntimeState {
  const requirement = getOmanLocationCandidateEvidenceSnapshotRequirement({
    entity: input.entity,
    dimension: input.dimension,
  });
  const candidateState = getOmanLocationCandidateState(input);
  const blockedReasons = [
    ...(requirement ? [] : ['missing-candidate-evidence-snapshot-requirement']),
    ...candidateState.blockedReasons,
    'candidate-evidence-snapshot-contract-only',
    'candidate-evidence-snapshot-runtime-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    candidatePath: input.candidatePath,
    locationSlug: input.locationSlug,
    status: 'disabled',
    snapshotGenerationAllowed: false,
    promotionAllowed: false,
    requirement,
    candidateState,
    snapshot: null,
    blockedReasons,
  };
}

export function getOmanLocationCandidateEvidenceSnapshotRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_CONTRACT;
}
