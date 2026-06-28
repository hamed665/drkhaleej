import { OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT } from './location-candidate-provider-source-plan-contract';

const contractStatus: string = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.status;
const policiesLength: number = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.policies.length;
const dataImportClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.dataImportAllowedByDefault;
const runtimeClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.runtimeCollectionAllowedByDefault;
const databaseClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.databaseAccessAllowed;
const routeClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.routeCreationAllowed;
const sitemapClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.sitemapAllowed;
const jsonLdClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.jsonLdAllowed;
const indexClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.indexPromotionAllowed;
const linksClosed: false = OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_CONTRACT.internalSeoLinksAllowed;

export const OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_TYPE_VALIDATOR = {
  contractStatus,
  policiesLength,
  dataImportClosed,
  runtimeClosed,
  databaseClosed,
  routeClosed,
  sitemapClosed,
  jsonLdClosed,
  indexClosed,
  linksClosed,
} as const;
