import type { OmanGeoEditorialContentEntry, OmanGeoEditorialContentLocale } from '@/config/geo/editorial-content-contract';
import type { OmanGeoProviderInventoryEntityContract } from '@/config/geo/provider-inventory-contract';
import type { OmanGeoQaEvidenceEntityContract } from '@/config/geo/qa-evidence-contract';
import {
  OMAN_GEO_READINESS_CONTRACT,
  OMAN_GEO_READINESS_ENTITY_CONTRACTS,
  type OmanGeoReadinessEntityContract,
  type OmanGeoReadinessStatus,
} from '@/config/geo/readiness-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';
import {
  getOmanGeoEditorialContent,
  getOmanGeoEditorialContentRuntimeState,
} from '@/lib/geo/oman-editorial-content';
import {
  getOmanGeoIndexPromotionEligibility,
  type OmanGeoIndexPromotionEligibility,
} from '@/lib/geo/oman-index-promotion-eligibility';
import {
  getOmanGeoProviderInventoryContract,
  getOmanGeoProviderInventoryRuntimeState,
} from '@/lib/geo/oman-provider-inventory';
import { getOmanGeoQaEvidenceContract, getOmanGeoQaEvidenceRuntimeState } from '@/lib/geo/oman-qa-evidence';

export type OmanGeoReadinessInput = {
  entity: OmanGeoRouteEntity;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
};

export type OmanGeoReadinessRuntimeState = {
  entity: OmanGeoRouteEntity;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
  status: OmanGeoReadinessStatus;
  contract: OmanGeoReadinessEntityContract | null;
  editorialContent: OmanGeoEditorialContentEntry | null;
  providerInventory: OmanGeoProviderInventoryEntityContract | null;
  qaEvidence: OmanGeoQaEvidenceEntityContract | null;
  indexPromotionEligibility: OmanGeoIndexPromotionEligibility;
  providerInventoryReady: boolean;
  editorialContentReady: boolean;
  qaEvidenceReady: boolean;
  indexPromotionEligibilityReady: boolean;
  readyForPromotionReview: boolean;
  noindexRemovalAllowed: boolean;
  sitemapPromotionAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  blockedReasons: readonly string[];
};

export function listOmanGeoReadinessContracts(): readonly OmanGeoReadinessEntityContract[] {
  return OMAN_GEO_READINESS_ENTITY_CONTRACTS;
}

export function getOmanGeoReadinessContract(entity: OmanGeoRouteEntity): OmanGeoReadinessEntityContract | null {
  return listOmanGeoReadinessContracts().find((contract) => contract.entity === entity) ?? null;
}

export function getOmanGeoReadiness(input: OmanGeoReadinessInput): OmanGeoReadinessRuntimeState {
  const contract = getOmanGeoReadinessContract(input.entity);
  const editorialContent = getOmanGeoEditorialContent(input);
  const providerInventory = getOmanGeoProviderInventoryContract({ entity: input.entity });
  const qaEvidence = getOmanGeoQaEvidenceContract({ entity: input.entity });
  const indexPromotionEligibility = getOmanGeoIndexPromotionEligibility(input);
  const providerInventoryRuntimeState = getOmanGeoProviderInventoryRuntimeState();
  const editorialContentRuntimeState = getOmanGeoEditorialContentRuntimeState();
  const qaEvidenceRuntimeState = getOmanGeoQaEvidenceRuntimeState();

  const providerInventoryReady = Boolean(
    providerInventoryRuntimeState.hasRuntimeEvidence &&
      indexPromotionEligibility.providerInventoryMeetsThreshold &&
      providerInventory?.indexPromotionAllowed,
  );
  const editorialContentReady = Boolean(
    editorialContentRuntimeState.hasPublishedContent && indexPromotionEligibility.editorialContentExists,
  );
  const qaEvidenceReady = Boolean(qaEvidenceRuntimeState.hasQaEvidence && indexPromotionEligibility.qaEvidenceComplete);
  const indexPromotionEligibilityReady = Boolean(indexPromotionEligibility.eligibleForIndexPromotion);
  const readyForPromotionReview = false;
  const readinessBlockers = new Set([
    ...(contract ? [] : ['missing-readiness-contract']),
    ...(providerInventoryReady ? [] : ['provider-inventory-not-ready']),
    ...(editorialContentReady ? [] : ['editorial-content-not-ready']),
    ...(qaEvidenceReady ? [] : ['qa-evidence-not-ready']),
    ...(indexPromotionEligibilityReady ? [] : ['index-promotion-eligibility-not-ready']),
    ...indexPromotionEligibility.blockedReasons,
  ]);
  const blockedReasons = [...readinessBlockers];

  return {
    entity: input.entity,
    slug: input.slug,
    locale: input.locale,
    status: OMAN_GEO_READINESS_CONTRACT.status,
    contract,
    editorialContent,
    providerInventory,
    qaEvidence,
    indexPromotionEligibility,
    providerInventoryReady,
    editorialContentReady,
    qaEvidenceReady,
    indexPromotionEligibilityReady,
    readyForPromotionReview,
    noindexRemovalAllowed: false,
    sitemapPromotionAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    blockedReasons,
  };
}
