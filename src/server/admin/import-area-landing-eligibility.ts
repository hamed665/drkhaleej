import "server-only";

import type { ImportInternalLinkIntelligenceResult } from "./import-internal-link-intelligence";
import type { ImportNearbyProjectionEngineResult } from "./import-nearby-projection-engine";
import type { ImportOmanGeoSeedReadiness } from "./import-oman-geo-seed-validation";
import type { ImportPageValueGateResult } from "./import-page-value-gate";
import type { ImportPublicProjectionManifest } from "./import-public-projection-layer";

export type ImportAreaLandingEligibilityBlocker =
  | "geo_seed_not_ready"
  | "canonical_area_missing"
  | "area_projection_not_ready"
  | "page_value_not_ready"
  | "internal_links_not_ready"
  | "nearby_projection_not_ready"
  | "bilingual_keyword_target_missing"
  | "verified_provider_density_below_minimum"
  | "distinct_specialty_coverage_below_minimum"
  | "unique_local_fact_coverage_below_minimum"
  | "duplicate_area_risk"
  | "manual_review_missing";

export type ImportAreaLandingEligibilityInput = {
  areaId: string;
  areaSlug: string;
  canonicalAreaIds: readonly string[];
  geoSeedReadiness: ImportOmanGeoSeedReadiness;
  pageValue: ImportPageValueGateResult;
  internalLinks: ImportInternalLinkIntelligenceResult;
  nearbyProjection: ImportNearbyProjectionEngineResult;
  publicProjection: ImportPublicProjectionManifest;
  hasEnglishKeywordTarget: boolean;
  hasArabicKeywordTarget: boolean;
  verifiedProviderCount: number;
  distinctSpecialtyCount: number;
  uniqueLocalFactCount: number;
  duplicateAreaRisk: boolean;
  manualReviewComplete: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportAreaLandingEligibilityResult = {
  areaLandingEligible: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportAreaLandingEligibilityBlocker[];
};

export const IMPORT_AREA_LANDING_MIN_VERIFIED_PROVIDERS = 5;
export const IMPORT_AREA_LANDING_MIN_DISTINCT_SPECIALTIES = 3;
export const IMPORT_AREA_LANDING_MIN_UNIQUE_LOCAL_FACTS = 6;

function hasReadyAreaProjection(manifest: ImportPublicProjectionManifest): boolean {
  return manifest.records.some(
    (record) =>
      record.kind === "area_page" &&
      record.status === "ready" &&
      record.routeId === manifest.routeId &&
      record.buildSources.length > 0,
  );
}

export function getImportAreaLandingEligibility(input: ImportAreaLandingEligibilityInput): ImportAreaLandingEligibilityResult {
  const blockers: ImportAreaLandingEligibilityBlocker[] = [];
  if (!input.geoSeedReadiness.seedReady) blockers.push("geo_seed_not_ready");
  if (!input.areaId.trim() || !input.areaSlug.trim() || !input.canonicalAreaIds.includes(input.areaId)) blockers.push("canonical_area_missing");
  if (!hasReadyAreaProjection(input.publicProjection)) blockers.push("area_projection_not_ready");
  if (!input.pageValue.pageValueReady) blockers.push("page_value_not_ready");
  if (!input.internalLinks.internalLinksReady) blockers.push("internal_links_not_ready");
  if (!input.nearbyProjection.nearbyProjectionReady) blockers.push("nearby_projection_not_ready");
  if (!input.hasEnglishKeywordTarget || !input.hasArabicKeywordTarget) blockers.push("bilingual_keyword_target_missing");
  if (input.verifiedProviderCount < IMPORT_AREA_LANDING_MIN_VERIFIED_PROVIDERS) blockers.push("verified_provider_density_below_minimum");
  if (input.distinctSpecialtyCount < IMPORT_AREA_LANDING_MIN_DISTINCT_SPECIALTIES) blockers.push("distinct_specialty_coverage_below_minimum");
  if (input.uniqueLocalFactCount < IMPORT_AREA_LANDING_MIN_UNIQUE_LOCAL_FACTS) blockers.push("unique_local_fact_coverage_below_minimum");
  if (input.duplicateAreaRisk) blockers.push("duplicate_area_risk");
  if (!input.manualReviewComplete) blockers.push("manual_review_missing");
  const uniqueBlockers = Array.from(new Set(blockers));
  return { areaLandingEligible: uniqueBlockers.length === 0, publishReady: input.publishReady, sitemapEligible: input.sitemapEligible, blockers: uniqueBlockers };
}

export function isImportAreaLandingEligible(input: ImportAreaLandingEligibilityInput): boolean {
  return getImportAreaLandingEligibility(input).areaLandingEligible;
}
