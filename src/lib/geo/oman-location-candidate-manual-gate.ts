import {
  OMAN_LOCATION_CANDIDATE_MANUAL_GATE_CONTRACT,
  OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES,
  type OmanLocationCandidateManualGatePolicy,
} from '@/config/geo/location-candidate-manual-gate-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateManualGateRuntimeStatus = 'disabled' | 'blocked' | 'active';

export type OmanLocationCandidateManualGateInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
};

export type OmanLocationCandidateManualGateRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  status: OmanLocationCandidateManualGateRuntimeStatus;
  policy: OmanLocationCandidateManualGatePolicy | null;
  runtimeAllowed: boolean;
  databaseAccessAllowed: boolean;
  routeCreationAllowed: boolean;
  sitemapAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateManualGatePolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidateManualGatePolicy | null {
  return (
    OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateManualGateState(
  input: OmanLocationCandidateManualGateInput,
): OmanLocationCandidateManualGateRuntimeState {
  const policy = getOmanLocationCandidateManualGatePolicy({ entity: input.entity, dimension: input.dimension });
  const blockedReasons = [
    ...(policy ? [] : ['missing-candidate-manual-gate-policy']),
    'candidate-manual-gate-contract-only',
    'candidate-manual-gate-runtime-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    locationSlug: input.locationSlug,
    status: 'disabled',
    policy,
    runtimeAllowed: false,
    databaseAccessAllowed: false,
    routeCreationAllowed: false,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    blockedReasons,
  };
}

export function getOmanLocationCandidateManualGateRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_MANUAL_GATE_CONTRACT;
}
