import "server-only";

import {
  getUnifiedDraftEntityBlockers,
  type ImportUnifiedDraftEntityBlocker,
  type ImportUnifiedDraftEntityInput,
} from "./import-unified-draft-entity";
import {
  getImportPublicationValidationBlockers,
  type ImportPublicationValidationBlocker,
  type ImportPublicationValidationInput,
} from "./import-publication-validation";
import {
  getImportPerformanceBlockers,
  type ImportPerformanceBlocker,
} from "./import-performance-guard";
import type {
  ImportPublicProjectionKind,
  ImportPublicProjectionManifest,
} from "./import-public-projection-layer";

export type ImportSeoProfileBlocker =
  | "unified_draft_not_ready"
  | "entity_domain_or_type_not_ready"
  | "canonical_geo_not_ready"
  | "source_evidence_not_ready"
  | "duplicate_guard_not_ready"
  | "publication_validation_not_ready"
  | "public_projection_not_ready"
  | "performance_budget_not_ready";

export type ImportSeoProfileReadinessInput = {
  draft: ImportUnifiedDraftEntityInput;
  publicationValidation: ImportPublicationValidationInput;
  publicProjection: ImportPublicProjectionManifest;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportSeoProfileReadiness = {
  seoProfileReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportSeoProfileBlocker[];
  draftBlockers: readonly ImportUnifiedDraftEntityBlocker[];
  publicationBlockers: readonly ImportPublicationValidationBlocker[];
  performanceBlockers: readonly ImportPerformanceBlocker[];
  missingProjectionKinds: readonly ImportPublicProjectionKind[];
};

export const IMPORT_SEO_PROFILE_REQUIRED_PROJECTION_KINDS = [
  "entity",
  "geo",
  "seo",
] as const satisfies readonly ImportPublicProjectionKind[];

const seoPublicationBlockers = new Set<ImportPublicationValidationBlocker>([
  "slug_missing",
  "slug_invalid",
  "title_missing",
  "title_too_short",
  "meta_description_missing",
  "meta_description_too_short",
  "canonical_missing",
  "canonical_invalid",
  "domain_missing",
  "domain_invalid",
  "entity_type_missing",
  "entity_type_invalid",
  "canonical_geo_missing",
  "canonical_geo_invalid",
  "minimum_content_incomplete",
  "duplicate_check_missing",
  "duplicate_check_failed",
]);

function getMissingSeoProjectionKinds(
  manifest: ImportPublicProjectionManifest,
): readonly ImportPublicProjectionKind[] {
  return IMPORT_SEO_PROFILE_REQUIRED_PROJECTION_KINDS.filter(
    (kind) =>
      !manifest.records.some(
        (record) =>
          record.kind === kind &&
          record.status === "ready" &&
          record.routeId === manifest.routeId &&
          record.buildSources.length > 0,
      ),
  );
}

export function getImportSeoProfileReadiness(
  input: ImportSeoProfileReadinessInput,
): ImportSeoProfileReadiness {
  const draftBlockers = getUnifiedDraftEntityBlockers(input.draft);
  const publicationBlockers = getImportPublicationValidationBlockers(
    input.publicationValidation,
  ).filter((blocker) => seoPublicationBlockers.has(blocker));
  const performanceBlockers = getImportPerformanceBlockers(
    input.publicProjection.renderPlan,
  );
  const missingProjectionKinds = getMissingSeoProjectionKinds(
    input.publicProjection,
  );
  const blockers: ImportSeoProfileBlocker[] = [];

  if (draftBlockers.length > 0) blockers.push("unified_draft_not_ready");
  if (
    draftBlockers.includes("entity_type_missing") ||
    draftBlockers.includes("entity_type_unsupported") ||
    draftBlockers.includes("entity_domain_unresolved")
  ) {
    blockers.push("entity_domain_or_type_not_ready");
  }
  if (draftBlockers.includes("canonical_geo_missing")) {
    blockers.push("canonical_geo_not_ready");
  }
  if (draftBlockers.includes("source_evidence_missing")) {
    blockers.push("source_evidence_not_ready");
  }
  if (
    draftBlockers.includes("duplicate_candidates_present") ||
    publicationBlockers.includes("duplicate_check_missing") ||
    publicationBlockers.includes("duplicate_check_failed")
  ) {
    blockers.push("duplicate_guard_not_ready");
  }
  if (publicationBlockers.length > 0) {
    blockers.push("publication_validation_not_ready");
  }
  if (missingProjectionKinds.length > 0) {
    blockers.push("public_projection_not_ready");
  }
  if (performanceBlockers.length > 0) {
    blockers.push("performance_budget_not_ready");
  }

  const uniqueBlockers = Array.from(new Set(blockers));

  return {
    seoProfileReady: uniqueBlockers.length === 0,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    blockers: uniqueBlockers,
    draftBlockers,
    publicationBlockers,
    performanceBlockers,
    missingProjectionKinds,
  };
}

export function isImportSeoProfileReady(
  input: ImportSeoProfileReadinessInput,
): boolean {
  return getImportSeoProfileReadiness(input).seoProfileReady;
}
