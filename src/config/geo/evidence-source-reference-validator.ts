import { OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT } from './location-candidate-evidence-source-reference-contract';

const contractStatus: string = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.status;
const allowedSourceTypesLength: number = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.allowedSourceTypes.length;
const runtimeClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.runtimeCollectionAllowed;
const databaseClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.databaseAccessAllowed;
const importClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.importAllowed;
const routeClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.routeCreationAllowed;
const sitemapClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.sitemapAllowed;
const jsonLdClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.jsonLdAllowed;
const indexClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.indexPromotionAllowed;
const linksClosed: false = OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT.internalSeoLinksAllowed;

export const OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_TYPE_VALIDATOR = {
  contractStatus,
  allowedSourceTypesLength,
  runtimeClosed,
  databaseClosed,
  importClosed,
  routeClosed,
  sitemapClosed,
  jsonLdClosed,
  indexClosed,
  linksClosed,
} as const;
