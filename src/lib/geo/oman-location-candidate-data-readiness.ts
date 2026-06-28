import {
  OMAN_LOCATION_CANDIDATE_DATA_READINESS_CONTRACT,
  OMAN_LOCATION_CANDIDATE_DATA_READINESS_POLICIES,
  type OmanLocationCandidateDataReadinessPolicy,
} from '@/config/geo/location-candidate-data-readiness-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateDataReadinessRuntimeStatus = 'disabled' | 'blocked' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateDataReadinessInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
};

export type OmanLocationCandidateDataReadinessRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  status: OmanLocationCandidateDataReadinessRuntimeStatus;
  policy: OmanLocationCandidateDataReadinessPolicy | null;
  dataImportAllowed: boolean;
  runtimeGenerationAllowed: boolean;
  databaseAccessAllowed: boolean;
  routeCreationAllowed: boolean;
  sitemapAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  internalSeoLinksAllowed: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateDataReadinessPolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidateDataReadinessPolicy | null {
  return (
    OMAN_LOCATION_CANDIDATE_DATA_READINESS_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateDataReadinessState(
  input: OmanLocationCandidateDataReadinessInput,
): OmanLocationCandidateDataReadinessRuntimeState {
  const policy = getOmanLocationCandidateDataReadinessPolicy({ entity: input.entity, dimension: input.dimension });
  const blockedReasons = [
    ...(policy ? [] : ['missing-candidate-data-readiness-policy']),
    'candidate-data-readiness-contract-only',
    'candidate-data-import-disabled',
    'candidate-data-runtime-generation-disabled',
    'candidate-data-readiness-runtime-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    locationSlug: input.locationSlug,
    status: 'disabled',
    policy,
    dataImportAllowed: false,
    runtimeGenerationAllowed: false,
    databaseAccessAllowed: false,
    routeCreationAllowed: false,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    internalSeoLinksAllowed: false,
    blockedReasons,
  };
}

export function getOmanLocationCandidateDataReadinessRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_DATA_READINESS_CONTRACT;
}
