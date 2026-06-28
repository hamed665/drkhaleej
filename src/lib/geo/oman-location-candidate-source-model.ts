import {
  OMAN_LOCATION_CANDIDATE_SOURCE_MODEL_CONTRACT,
  OMAN_LOCATION_CANDIDATE_SOURCE_MODEL_POLICIES,
  type OmanLocationCandidateSourceModelPolicy,
} from '@/config/geo/location-candidate-source-model-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateSourceModelRuntimeStatus = 'disabled' | 'blocked' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateSourceModelInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
};

export type OmanLocationCandidateSourceModelRuntimeState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  status: OmanLocationCandidateSourceModelRuntimeStatus;
  policy: OmanLocationCandidateSourceModelPolicy | null;
  runtimeCollectionAllowed: boolean;
  databaseAccessAllowed: boolean;
  importAllowed: boolean;
  routeCreationAllowed: boolean;
  sitemapAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateSourceModelPolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidateSourceModelPolicy | null {
  return (
    OMAN_LOCATION_CANDIDATE_SOURCE_MODEL_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateSourceModelState(
  input: OmanLocationCandidateSourceModelInput,
): OmanLocationCandidateSourceModelRuntimeState {
  const policy = getOmanLocationCandidateSourceModelPolicy({ entity: input.entity, dimension: input.dimension });
  const blockedReasons = [
    ...(policy ? [] : ['missing-candidate-source-model-policy']),
    'candidate-source-model-contract-only',
    'candidate-source-model-runtime-disabled',
    'candidate-source-model-runtime-collection-disabled',
    'candidate-source-model-import-disabled',
  ];

  return {
    entity: input.entity,
    dimension: input.dimension,
    locationSlug: input.locationSlug,
    status: 'disabled',
    policy,
    runtimeCollectionAllowed: false,
    databaseAccessAllowed: false,
    importAllowed: false,
    routeCreationAllowed: false,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    blockedReasons,
  };
}

export function getOmanLocationCandidateSourceModelRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_SOURCE_MODEL_CONTRACT;
}
