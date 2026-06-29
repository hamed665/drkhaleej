import {
  OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT,
  OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_REQUIREMENT,
  type OmanLocationCandidateEvidenceSourceReferenceRequirement,
} from '@/config/geo/location-candidate-evidence-source-reference-contract';
import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateEvidenceReferenceStatus = 'disabled' | 'blocked' | 'ready-for-audit' | 'active';

export type OmanLocationCandidateEvidenceReferenceInput = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
};

export type OmanLocationCandidateEvidenceReferenceState = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  locationSlug: string;
  status: 'disabled';
  requirement: OmanLocationCandidateEvidenceSourceReferenceRequirement;
  sourceReferences: readonly [];
  runtimeCollectionAllowed: false;
  databaseAccessAllowed: false;
  importAllowed: false;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
  internalSeoLinksAllowed: false;
  blockedReasons: readonly string[];
};

export function getOmanLocationCandidateEvidenceReferenceState(
  input: OmanLocationCandidateEvidenceReferenceInput,
): OmanLocationCandidateEvidenceReferenceState {
  return {
    entity: input.entity,
    dimension: input.dimension,
    locationSlug: input.locationSlug,
    status: 'disabled',
    requirement: OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_REQUIREMENT,
    sourceReferences: [],
    runtimeCollectionAllowed: false,
    databaseAccessAllowed: false,
    importAllowed: false,
    routeCreationAllowed: false,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    internalSeoLinksAllowed: false,
    blockedReasons: [
      'candidate-evidence-reference-contract-only',
      'candidate-evidence-reference-runtime-disabled',
      'candidate-evidence-reference-import-disabled',
    ],
  };
}

export function getOmanLocationCandidateEvidenceReferenceRuntimeContract() {
  return OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT;
}
