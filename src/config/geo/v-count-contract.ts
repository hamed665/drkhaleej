import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanVCountStatus = 'contract-only' | 'ready-for-audit' | 'active';

export type OmanVCountMethod = {
  kind: 'verified-count';
  minimumSources: 2;
  reviewerRequired: true;
  sourceRefsRequired: true;
  lastReviewedAtRequired: true;
  conflictNoteRequired: true;
  runtimeAllowed: false;
  databaseAllowed: false;
  importAllowed: false;
};

export type OmanVCountPolicy = {
  entity: OmanGeoRouteEntity;
  dimension: OmanLocationCandidateDimension;
  method: OmanVCountMethod;
  routeCreationAllowed: false;
  sitemapAllowed: false;
  jsonLdAllowed: false;
  indexPromotionAllowed: false;
  internalSeoLinksAllowed: false;
};

export const OMAN_V_COUNT_CONTRACT_VERSION = 'v1' as const;

export const OMAN_V_COUNT_METHOD: OmanVCountMethod = {
  kind: 'verified-count',
  minimumSources: 2,
  reviewerRequired: true,
  sourceRefsRequired: true,
  lastReviewedAtRequired: true,
  conflictNoteRequired: true,
  runtimeAllowed: false,
  databaseAllowed: false,
  importAllowed: false,
} as const;
