import {
  OMAN_GEO_QA_EVIDENCE_CONTRACT,
  OMAN_GEO_QA_EVIDENCE_CONTRACTS,
  type OmanGeoQaEvidenceEntityContract,
} from '@/config/geo/qa-evidence-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoQaEvidenceLookupInput = {
  entity: OmanGeoRouteEntity;
};

export type OmanGeoQaEvidenceRuntimeState = {
  hasQaEvidence: boolean;
  noindexRemovalAllowed: boolean;
  sitemapPromotionAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  canonicalReviewCompleteCount: number;
  hreflangReviewCompleteCount: number;
  thinPageReviewCompleteCount: number;
  sitemapPolicyReviewCompleteCount: number;
  promotionPrApprovedCount: number;
};

export function listOmanGeoQaEvidenceContracts(): readonly OmanGeoQaEvidenceEntityContract[] {
  return OMAN_GEO_QA_EVIDENCE_CONTRACTS;
}

export function getOmanGeoQaEvidenceContract(
  input: OmanGeoQaEvidenceLookupInput,
): OmanGeoQaEvidenceEntityContract | null {
  return listOmanGeoQaEvidenceContracts().find((contract) => contract.entity === input.entity) ?? null;
}

export function getOmanGeoQaEvidenceRuntimeState(): OmanGeoQaEvidenceRuntimeState {
  const contracts = listOmanGeoQaEvidenceContracts();

  return {
    hasQaEvidence: OMAN_GEO_QA_EVIDENCE_CONTRACT.currentQaEvidenceAvailable,
    noindexRemovalAllowed: false,
    sitemapPromotionAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    canonicalReviewCompleteCount: contracts.filter((contract) => contract.canonicalReviewComplete).length,
    hreflangReviewCompleteCount: contracts.filter((contract) => contract.hreflangReviewComplete).length,
    thinPageReviewCompleteCount: contracts.filter((contract) => contract.thinPageReviewComplete).length,
    sitemapPolicyReviewCompleteCount: contracts.filter((contract) => contract.sitemapPolicyReviewComplete).length,
    promotionPrApprovedCount: contracts.filter((contract) => contract.promotionPrApproved).length,
  };
}
