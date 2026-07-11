import "server-only";

import type { ImportPublicProjectionManifest } from "./import-public-projection-layer";
import type { ImportSeoGeoLlmReadiness } from "./import-seo-geo-llm-readiness";

export type ImportPageValuePageClass =
  | "entity_profile"
  | "specialty_directory"
  | "service_directory"
  | "area_landing"
  | "guide";

export type ImportPageValueMetrics = {
  verifiedUniqueFactCount: number;
  sourceEvidenceCount: number;
  contentCompletenessPercent: number;
  duplicateSimilarityPercent: number;
  geoSpecificityScore: number;
  actionableContactFieldCount: number;
  usefulInternalLinkCount: number;
  templatedContentRatioPercent: number;
  verifiedProviderCoverageCount: number;
  thinPageRisk: boolean;
};

export type ImportPageValueGateInput = {
  pageClass: ImportPageValuePageClass;
  readiness: ImportSeoGeoLlmReadiness;
  publicProjection: ImportPublicProjectionManifest;
  metrics: ImportPageValueMetrics;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportPageValueBlocker =
  | "composition_not_ready"
  | "content_projection_not_ready"
  | "insufficient_unique_facts"
  | "insufficient_source_evidence"
  | "content_completeness_below_minimum"
  | "duplicate_similarity_above_maximum"
  | "geo_specificity_below_minimum"
  | "actionable_contact_missing"
  | "internal_link_value_below_minimum"
  | "templated_content_ratio_above_maximum"
  | "verified_provider_coverage_below_minimum"
  | "thin_page_risk";

export type ImportPageValueGateResult = {
  pageValueReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  score: number;
  blockers: readonly ImportPageValueBlocker[];
  metrics: ImportPageValueMetrics;
};

export const IMPORT_PAGE_VALUE_MIN_UNIQUE_FACTS = 6;
export const IMPORT_PAGE_VALUE_MIN_SOURCE_EVIDENCE = 2;
export const IMPORT_PAGE_VALUE_MIN_CONTENT_COMPLETENESS_PERCENT = 70;
export const IMPORT_PAGE_VALUE_MAX_DUPLICATE_SIMILARITY_PERCENT = 35;
export const IMPORT_PAGE_VALUE_MIN_GEO_SPECIFICITY_SCORE = 60;
export const IMPORT_PAGE_VALUE_MIN_ACTIONABLE_CONTACT_FIELDS = 1;
export const IMPORT_PAGE_VALUE_MIN_INTERNAL_LINKS = 3;
export const IMPORT_PAGE_VALUE_MAX_TEMPLATED_CONTENT_RATIO_PERCENT = 65;

export const IMPORT_PAGE_VALUE_MIN_PROVIDER_COVERAGE_BY_CLASS: Record<
  ImportPageValuePageClass,
  number
> = {
  entity_profile: 1,
  specialty_directory: 3,
  service_directory: 3,
  area_landing: 5,
  guide: 1,
};

function hasReadyContentProjection(manifest: ImportPublicProjectionManifest): boolean {
  return manifest.records.some(
    (record) =>
      (record.kind === "entity" || record.kind === "area_page") &&
      record.status === "ready" &&
      record.routeId === manifest.routeId &&
      record.buildSources.length > 0,
  );
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getImportPageValueScore(metrics: ImportPageValueMetrics): number {
  const uniqueFacts = clampPercent((metrics.verifiedUniqueFactCount / IMPORT_PAGE_VALUE_MIN_UNIQUE_FACTS) * 100);
  const evidence = clampPercent((metrics.sourceEvidenceCount / IMPORT_PAGE_VALUE_MIN_SOURCE_EVIDENCE) * 100);
  const completeness = clampPercent(metrics.contentCompletenessPercent);
  const originality = clampPercent(100 - metrics.duplicateSimilarityPercent);
  const geo = clampPercent(metrics.geoSpecificityScore);
  const actionability = metrics.actionableContactFieldCount >= IMPORT_PAGE_VALUE_MIN_ACTIONABLE_CONTACT_FIELDS ? 100 : 0;
  const links = clampPercent((metrics.usefulInternalLinkCount / IMPORT_PAGE_VALUE_MIN_INTERNAL_LINKS) * 100);
  const nonTemplated = clampPercent(100 - metrics.templatedContentRatioPercent);

  return Math.round(
    uniqueFacts * 0.2 +
      evidence * 0.15 +
      completeness * 0.15 +
      originality * 0.15 +
      geo * 0.1 +
      actionability * 0.1 +
      links * 0.1 +
      nonTemplated * 0.05,
  );
}

export function getImportPageValueGate(
  input: ImportPageValueGateInput,
): ImportPageValueGateResult {
  const blockers: ImportPageValueBlocker[] = [];
  const metrics = input.metrics;
  const minimumProviderCoverage =
    IMPORT_PAGE_VALUE_MIN_PROVIDER_COVERAGE_BY_CLASS[input.pageClass];

  if (!input.readiness.compositionReady) blockers.push("composition_not_ready");
  if (!hasReadyContentProjection(input.publicProjection)) blockers.push("content_projection_not_ready");
  if (metrics.verifiedUniqueFactCount < IMPORT_PAGE_VALUE_MIN_UNIQUE_FACTS) blockers.push("insufficient_unique_facts");
  if (metrics.sourceEvidenceCount < IMPORT_PAGE_VALUE_MIN_SOURCE_EVIDENCE) blockers.push("insufficient_source_evidence");
  if (metrics.contentCompletenessPercent < IMPORT_PAGE_VALUE_MIN_CONTENT_COMPLETENESS_PERCENT) blockers.push("content_completeness_below_minimum");
  if (metrics.duplicateSimilarityPercent > IMPORT_PAGE_VALUE_MAX_DUPLICATE_SIMILARITY_PERCENT) blockers.push("duplicate_similarity_above_maximum");
  if (metrics.geoSpecificityScore < IMPORT_PAGE_VALUE_MIN_GEO_SPECIFICITY_SCORE) blockers.push("geo_specificity_below_minimum");
  if (metrics.actionableContactFieldCount < IMPORT_PAGE_VALUE_MIN_ACTIONABLE_CONTACT_FIELDS) blockers.push("actionable_contact_missing");
  if (metrics.usefulInternalLinkCount < IMPORT_PAGE_VALUE_MIN_INTERNAL_LINKS) blockers.push("internal_link_value_below_minimum");
  if (metrics.templatedContentRatioPercent > IMPORT_PAGE_VALUE_MAX_TEMPLATED_CONTENT_RATIO_PERCENT) blockers.push("templated_content_ratio_above_maximum");
  if (metrics.verifiedProviderCoverageCount < minimumProviderCoverage) blockers.push("verified_provider_coverage_below_minimum");
  if (metrics.thinPageRisk) blockers.push("thin_page_risk");

  const uniqueBlockers = Array.from(new Set(blockers));

  return {
    pageValueReady: uniqueBlockers.length === 0,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    score: getImportPageValueScore(metrics),
    blockers: uniqueBlockers,
    metrics,
  };
}

export function isImportPageValueReady(input: ImportPageValueGateInput): boolean {
  return getImportPageValueGate(input).pageValueReady;
}
