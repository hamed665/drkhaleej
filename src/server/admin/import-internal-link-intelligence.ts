import "server-only";

import type { ImportPageValueGateResult } from "./import-page-value-gate";
import type { ImportInternalLinkCacheRow } from "./import-internal-link-cache";
import type { ImportPublicProjectionManifest } from "./import-public-projection-layer";

export type ImportInternalLinkIntelligenceBlocker =
  | "page_value_not_ready"
  | "internal_links_projection_not_ready"
  | "cache_rows_missing"
  | "cache_row_stale"
  | "duplicate_target"
  | "self_link_detected"
  | "anchor_language_missing"
  | "target_not_public_projection_ready"
  | "target_quality_too_low"
  | "link_group_over_capacity";

export type ImportInternalLinkIntelligenceInput = {
  pageValue: ImportPageValueGateResult;
  publicProjection: ImportPublicProjectionManifest;
  cacheRows: readonly ImportInternalLinkCacheRow[];
  now: string;
  readyTargetEntityIds: readonly string[];
  minimumTargetScore: number;
  maximumLinksPerGroup: number;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportInternalLinkIntelligenceResult = {
  internalLinksReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportInternalLinkIntelligenceBlocker[];
  acceptedRows: readonly ImportInternalLinkCacheRow[];
};

function hasReadyInternalLinkProjection(manifest: ImportPublicProjectionManifest): boolean {
  return manifest.records.some(
    (record) =>
      record.kind === "internal_links" &&
      record.status === "ready" &&
      record.routeId === manifest.routeId &&
      record.buildSources.length > 0,
  );
}

export function getImportInternalLinkIntelligence(
  input: ImportInternalLinkIntelligenceInput,
): ImportInternalLinkIntelligenceResult {
  const blockers: ImportInternalLinkIntelligenceBlocker[] = [];
  const acceptedRows: ImportInternalLinkCacheRow[] = [];
  const seenTargets = new Set<string>();
  const groupCounts = new Map<string, number>();

  if (!input.pageValue.pageValueReady) blockers.push("page_value_not_ready");
  if (!hasReadyInternalLinkProjection(input.publicProjection)) {
    blockers.push("internal_links_projection_not_ready");
  }
  if (input.cacheRows.length === 0) blockers.push("cache_rows_missing");

  for (const row of input.cacheRows) {
    let blocked = false;
    if (!row.is_active || row.expires_at <= input.now) {
      blockers.push("cache_row_stale");
      blocked = true;
    }
    if (row.source_entity_id === row.target_entity_id) {
      blockers.push("self_link_detected");
      blocked = true;
    }
    if (seenTargets.has(row.target_entity_id)) {
      blockers.push("duplicate_target");
      blocked = true;
    }
    if (!row.anchor_text_en.trim() || !row.anchor_text_ar.trim()) {
      blockers.push("anchor_language_missing");
      blocked = true;
    }
    if (!input.readyTargetEntityIds.includes(row.target_entity_id)) {
      blockers.push("target_not_public_projection_ready");
      blocked = true;
    }
    if (row.score < input.minimumTargetScore) {
      blockers.push("target_quality_too_low");
      blocked = true;
    }
    const groupCount = groupCounts.get(row.link_group) ?? 0;
    if (groupCount >= input.maximumLinksPerGroup) {
      blockers.push("link_group_over_capacity");
      blocked = true;
    }
    if (!blocked) {
      seenTargets.add(row.target_entity_id);
      groupCounts.set(row.link_group, groupCount + 1);
      acceptedRows.push(row);
    }
  }

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    internalLinksReady: uniqueBlockers.length === 0,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    blockers: uniqueBlockers,
    acceptedRows: acceptedRows.sort(
      (left, right) => right.score - left.score || right.priority - left.priority,
    ),
  };
}

export function isImportInternalLinkIntelligenceReady(
  input: ImportInternalLinkIntelligenceInput,
): boolean {
  return getImportInternalLinkIntelligence(input).internalLinksReady;
}
