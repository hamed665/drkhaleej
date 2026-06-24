import {
  OMAN_GEO_INDEX_PROMOTION_POLICIES,
  type OmanGeoIndexPromotionEntityPolicy,
  type OmanGeoIndexPromotionStatus,
} from '@/config/geo/index-promotion-policy';
import type { OmanGeoEditorialContentLocale } from '@/config/geo/editorial-content-contract';
import type { OmanGeoProviderInventoryEntityContract } from '@/config/geo/provider-inventory-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';
import {
  getOmanGeoEditorialContent,
  getOmanGeoEditorialContentRuntimeState,
} from '@/lib/geo/oman-editorial-content';
import {
  getOmanGeoProviderInventoryContract,
  getOmanGeoProviderInventoryRuntimeState,
} from '@/lib/geo/oman-provider-inventory';

export type OmanGeoIndexPromotionEligibilityInput = {
  entity: OmanGeoRouteEntity;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
};

export type OmanGeoIndexPromotionEligibility = {
  entity: OmanGeoRouteEntity;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
  status: OmanGeoIndexPromotionStatus;
  eligibleForIndexPromotion: boolean;
  noindexRequired: boolean;
  sitemapAllowed: boolean;
  jsonLdAllowed: boolean;
  policy: OmanGeoIndexPromotionEntityPolicy | null;
  providerInventory: OmanGeoProviderInventoryEntityContract | null;
  providerInventoryMeetsThreshold: boolean;
  editorialContentExists: boolean;
  blockedReasons: readonly string[];
};

export function getOmanGeoIndexPromotionPolicy(entity: OmanGeoRouteEntity): OmanGeoIndexPromotionEntityPolicy | null {
  return OMAN_GEO_INDEX_PROMOTION_POLICIES.find((policy) => policy.entity === entity) ?? null;
}

export function getOmanGeoIndexPromotionEligibility(
  input: OmanGeoIndexPromotionEligibilityInput,
): OmanGeoIndexPromotionEligibility {
  const policy = getOmanGeoIndexPromotionPolicy(input.entity);
  const providerInventory = getOmanGeoProviderInventoryContract({ entity: input.entity });
  const providerInventoryRuntimeState = getOmanGeoProviderInventoryRuntimeState();
  const editorialContent = getOmanGeoEditorialContent(input);
  const editorialContentRuntimeState = getOmanGeoEditorialContentRuntimeState();
  const providerInventoryMeetsThreshold = Boolean(
    policy && providerInventory && providerInventory.publishedProviderCount >= policy.minimumPublishedProviders,
  );
  const editorialContentExists = Boolean(editorialContent);
  const blockedReasons: string[] = [];

  if (!policy) {
    blockedReasons.push('missing-index-promotion-policy');
  }

  if (!providerInventory) {
    blockedReasons.push('missing-provider-inventory-contract');
  }

  if (!providerInventoryRuntimeState.hasRuntimeEvidence) {
    blockedReasons.push('provider-inventory-runtime-evidence-unavailable');
  }

  if (!providerInventoryMeetsThreshold) {
    blockedReasons.push('provider-inventory-threshold-not-met');
  }

  if (!editorialContentRuntimeState.hasPublishedContent) {
    blockedReasons.push('published-editorial-content-unavailable');
  }

  if (!editorialContentExists) {
    blockedReasons.push('localized-editorial-content-missing');
  }

  return {
    entity: input.entity,
    slug: input.slug,
    locale: input.locale,
    status: 'blocked-until-content-ready',
    eligibleForIndexPromotion: false,
    noindexRequired: true,
    sitemapAllowed: false,
    jsonLdAllowed: false,
    policy,
    providerInventory,
    providerInventoryMeetsThreshold,
    editorialContentExists,
    blockedReasons,
  };
}
