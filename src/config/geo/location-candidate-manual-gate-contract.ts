import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanLocationCandidateManualGateStatus = 'contract-only' | 'active';

export type OmanLocationCandidateManualGateStep =
  | 'operator-record'
  | 'source-ref-check'
  | 'evidence-check'
  | 'change-note'
  | 'fallback-note';

export type OmanLocationCandidateManualGateRequirement = {
  step: OmanLocationCandidateManualGateStep;
  required: true;
  currentlyAvailable: false;
  runtimeAllowed: false;
  databaseAccessAllowed: false;
};

export type OmanLocationCandidateManualGatePolicy = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  requirements: readonly OmanLocationCandidateManualGateRequirement[];
  runtimeAllowed: false;
  databaseAccessAllowed: false;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
};

export const OMAN_LOCATION_CANDIDATE_MANUAL_GATE_CONTRACT_VERSION = 'v1' as const;

export const OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS: readonly OmanLocationCandidateManualGateRequirement[] = [
  { step: 'operator-record', required: true, currentlyAvailable: false, runtimeAllowed: false, databaseAccessAllowed: false },
  { step: 'source-ref-check', required: true, currentlyAvailable: false, runtimeAllowed: false, databaseAccessAllowed: false },
  { step: 'evidence-check', required: true, currentlyAvailable: false, runtimeAllowed: false, databaseAccessAllowed: false },
  { step: 'change-note', required: true, currentlyAvailable: false, runtimeAllowed: false, databaseAccessAllowed: false },
  { step: 'fallback-note', required: true, currentlyAvailable: false, runtimeAllowed: false, databaseAccessAllowed: false },
] as const;

export const OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES: readonly OmanLocationCandidateManualGatePolicy[] = [
  { entity: 'governorate', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'governorate', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'governorate', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'wilayat', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'category', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'service', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
  { entity: 'area', dimension: 'specialty', requirements: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_REQUIREMENTS, runtimeAllowed: false, databaseAccessAllowed: false, routeCreationAllowed: false, sitemapAllowed: false, jsonLdAllowed: false, indexPromotionAllowed: false },
] as const;

export const OMAN_LOCATION_CANDIDATE_MANUAL_GATE_CONTRACT = {
  version: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_CONTRACT_VERSION,
  status: 'contract-only' as OmanLocationCandidateManualGateStatus,
  policies: OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES,
  runtimeAllowed: false,
  databaseAccessAllowed: false,
  routeCreationAllowed: false,
  sitemapAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
} as const;
