import {
  OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT,
  OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_POLICIES,
  type OmanLocationCandidateProviderSourcePlanPolicy,
} from '@/config/geo/location-candidate-provider-source-plan-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateCpPlanStatus = 'disabled' | 'blocked' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateCpPlanInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
};

export type OmanLocationCandidateCpPlanState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  status: OmanLocationCandidateCpPlanStatus;
  policy: OmanLocationCandidateProviderSourcePlanPolicy | null;
  dataImportAllowed: boolean;
  runtimeCollectionAllowed: boolean;
  databaseAccessAllowed: boolean;
  routeCreationAllowed: boolean;
  sitemapAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateCpPlanPolicy(input: {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
}): OmanLocationCandidateProviderSourcePlanPolicy | null {
  return (
    OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_POLICIES.find(
      (policy) => policy.entity === input.entity && policy.dimension === input.dimension,
    ) ?? null
  );
}

export function getOmanLocationCandidateCpPlanState(input: OmanLocationCandidateCpPlanInput): OmanLocationCandidateCpPlanState {
  const policy = getOmanLocationCandidateCpPlanPolicy({ entity: input.entity, dimension: input.dimension });

  return {
    entity: input.entity,
    dimension: input.dimension,
    locationSlug: input.locationSlug,
    status: 'disabled',
    policy,
    dataImportAllowed: false,
    runtimeCollectionAllowed: false,
    databaseAccessAllowed: false,
    routeCreationAllowed: false,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    blockedReasons: [
      ...(policy ? [] : ['missing-candidate-cp-plan-policy']),
      'candidate-cp-plan-contract-only',
      'candidate-cp-plan-runtime-disabled',
      'candidate-cp-plan-collection-disabled',
      'candidate-cp-plan-import-disabled',
    ],
  };
}

export function getOmanLocationCandidateCpPlanRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT;
}
