import "server-only";

import { getCanonicalGeoBlockers, type ImportCanonicalGeoBlocker } from "./import-canonical-geo";
import { getPublishBlockers, type ImportPublishBlockerReason, type ImportPublishEligibilityEntity } from "./import-publish-lifecycle";
import {
  getImportPublicationValidationBlockers,
  type ImportPublicationValidationBlocker,
  type ImportPublicationValidationInput,
} from "./import-publication-validation";
import { getSchemaBlockers, type ImportSchemaValidationBlocker, type ImportSchemaValidationInput } from "./import-schema-validation";
import {
  getSitemapBlockers,
  type ImportSitemapEligibilityBlocker,
  type ImportSitemapEligibilityEntity,
} from "./import-sitemap-eligibility-contract";

export type ImportReadinessCategory = "publish" | "sitemap" | "geo" | "seo" | "schema" | "relations" | "manual" | "duplicate";
export type ImportReadinessSeverity = "critical" | "high" | "medium" | "low";
export type ImportReadinessNextAction =
  | "run_geo_validation"
  | "fix_seo_content"
  | "run_duplicate_check"
  | "generate_schema"
  | "generate_internal_links"
  | "manual_approval_required"
  | "ready_to_publish";

export type ImportReadinessBlocker = {
  category: ImportReadinessCategory;
  reason:
    | ImportPublishBlockerReason
    | ImportSitemapEligibilityBlocker
    | ImportCanonicalGeoBlocker
    | ImportPublicationValidationBlocker
    | ImportSchemaValidationBlocker;
  severity: ImportReadinessSeverity;
  suggestedAction: ImportReadinessNextAction;
};

export type ImportReadinessInput = {
  publish: ImportPublishEligibilityEntity;
  sitemap: ImportSitemapEligibilityEntity;
  geoBlockers: readonly ImportCanonicalGeoBlocker[];
  publication: ImportPublicationValidationInput;
  schema: ImportSchemaValidationInput;
};

export type ImportEntityReadiness = {
  score: number;
  publishReady: boolean;
  sitemapReady: boolean;
  blockers: readonly ImportReadinessBlocker[];
  warnings: readonly ImportReadinessBlocker[];
  nextAction: ImportReadinessNextAction;
};

const categoryWeights = {
  geo: 20,
  seo: 20,
  schema: 20,
  relations: 20,
  manual: 10,
  duplicate: 10,
} as const satisfies Record<"geo" | "seo" | "schema" | "relations" | "manual" | "duplicate", number>;

function severityForCategory(category: ImportReadinessCategory): ImportReadinessSeverity {
  switch (category) {
    case "publish":
    case "geo":
    case "schema":
      return "critical";
    case "seo":
    case "duplicate":
      return "high";
    case "relations":
    case "sitemap":
      return "medium";
    case "manual":
      return "low";
  }
}

function suggestedActionForCategory(category: ImportReadinessCategory): ImportReadinessNextAction {
  switch (category) {
    case "geo":
      return "run_geo_validation";
    case "seo":
      return "fix_seo_content";
    case "duplicate":
      return "run_duplicate_check";
    case "schema":
      return "generate_schema";
    case "relations":
      return "generate_internal_links";
    case "manual":
      return "manual_approval_required";
    case "publish":
    case "sitemap":
      return "fix_seo_content";
  }
}

function makeBlocker(
  category: ImportReadinessCategory,
  reason: ImportReadinessBlocker["reason"],
): ImportReadinessBlocker {
  return {
    category,
    reason,
    severity: severityForCategory(category),
    suggestedAction: suggestedActionForCategory(category),
  };
}

function categoryFromPublicationBlocker(blocker: ImportPublicationValidationBlocker): ImportReadinessCategory {
  if (blocker.includes("duplicate")) return "duplicate";
  if (blocker.includes("schema")) return "schema";
  if (blocker.includes("internal_links")) return "relations";
  if (blocker.includes("manual")) return "manual";
  return "seo";
}

function categoryFromPublishBlocker(blocker: ImportPublishBlockerReason): ImportReadinessCategory {
  if (blocker.includes("geo")) return "geo";
  if (blocker.includes("schema")) return "schema";
  if (blocker.includes("relations")) return "relations";
  if (blocker.includes("duplicate")) return "duplicate";
  if (blocker.includes("manual") || blocker.includes("approval")) return "manual";
  if (blocker.includes("seo") || blocker.includes("content") || blocker.includes("canonical")) return "seo";
  return "publish";
}

function scoreFromBlockers(blockers: readonly ImportReadinessBlocker[]): number {
  let score = 100;
  const blockedCategories = new Set(blockers.map((blocker) => blocker.category));

  for (const [category, weight] of Object.entries(categoryWeights) as [keyof typeof categoryWeights, number][]) {
    if (blockedCategories.has(category)) score -= weight;
  }

  return Math.max(0, Math.min(100, score));
}

function selectNextAction(blockers: readonly ImportReadinessBlocker[]): ImportReadinessNextAction {
  const criticalBlocker = blockers.find((blocker) => blocker.severity === "critical");
  if (criticalBlocker) return criticalBlocker.suggestedAction;

  const highBlocker = blockers.find((blocker) => blocker.severity === "high");
  if (highBlocker) return highBlocker.suggestedAction;

  const anyBlocker = blockers[0];
  return anyBlocker?.suggestedAction ?? "ready_to_publish";
}

export function getEntityReadiness(input: ImportReadinessInput): ImportEntityReadiness {
  const publishBlockers = getPublishBlockers(input.publish).map((blocker) => makeBlocker(categoryFromPublishBlocker(blocker), blocker));
  const sitemapBlockers = getSitemapBlockers(input.sitemap).map((blocker) => makeBlocker("sitemap", blocker));
  const geoBlockers = input.geoBlockers.map((blocker) => makeBlocker("geo", blocker));
  const publicationBlockers = getImportPublicationValidationBlockers(input.publication).map((blocker) =>
    makeBlocker(categoryFromPublicationBlocker(blocker), blocker),
  );
  const schemaBlockers = getSchemaBlockers(input.schema).map((blocker) => makeBlocker("schema", blocker));

  const blockers = [...publishBlockers, ...geoBlockers, ...publicationBlockers, ...schemaBlockers];
  const warnings = sitemapBlockers;
  const score = scoreFromBlockers(blockers);

  return {
    score,
    publishReady: blockers.length === 0,
    sitemapReady: blockers.length === 0 && warnings.length === 0,
    blockers,
    warnings,
    nextAction: selectNextAction(blockers),
  };
}

export function getEntityReadinessScore(input: ImportReadinessInput): number {
  return getEntityReadiness(input).score;
}
