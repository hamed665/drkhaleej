import "server-only";

import type {
  ImportEntityReadiness,
  ImportReadinessBlocker,
  ImportReadinessCategory,
  ImportReadinessNextAction,
  ImportReadinessSeverity,
} from "./import-readiness-engine";
import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";

export type ImportAdminReadinessStage =
  | "imported"
  | "validated"
  | "geo_checked"
  | "seo_checked"
  | "schema_generated"
  | "links_generated"
  | "manual_approved"
  | "published";

export type ImportAdminReadinessStageStatus = "complete" | "blocked" | "pending";

export type ImportAdminReadinessEntityRow = {
  entity_id: string;
  entity_name: string | null;
  entity_type: ImportEntityType;
  entity_domain: ImportEntityDomain;
  lifecycle_state: string;
  publish_status: string | null;
  imported_at: string | null;
  updated_at: string | null;
  last_validation_at: string | null;
  readiness: ImportEntityReadiness;
};

export type ImportAdminReadinessFilter = {
  entity_type?: ImportEntityType;
  entity_domain?: ImportEntityDomain;
  ready_state?: "ready" | "blocked";
  sitemap_eligible?: boolean;
  blocker_category?: ImportReadinessCategory;
};

export type ImportAdminReadinessSummary = {
  totalImported: number;
  readyToPublish: number;
  blocked: number;
  sitemapEligible: number;
  missingGeo: number;
  missingSeo: number;
  missingSchema: number;
  missingInternalLinks: number;
  duplicateRisk: number;
  waitingManualApproval: number;
};

export type ImportAdminReadinessBlockerGroup = {
  category: ImportReadinessCategory;
  severity: ImportReadinessSeverity;
  blockers: readonly ImportReadinessBlocker[];
  suggestedAction: ImportReadinessNextAction;
};

export type ImportAdminReadinessTimelineItem = {
  stage: ImportAdminReadinessStage;
  status: ImportAdminReadinessStageStatus;
};

export type ImportAdminReadinessPanelRow = ImportAdminReadinessEntityRow & {
  blockerGroups: readonly ImportAdminReadinessBlockerGroup[];
  timeline: readonly ImportAdminReadinessTimelineItem[];
};

export function buildAdminReadinessSummary(rows: readonly ImportAdminReadinessEntityRow[]): ImportAdminReadinessSummary {
  return {
    totalImported: rows.length,
    readyToPublish: rows.filter((row) => row.readiness.publishReady).length,
    blocked: rows.filter((row) => !row.readiness.publishReady).length,
    sitemapEligible: rows.filter((row) => row.readiness.sitemapReady).length,
    missingGeo: rows.filter((row) => hasReadinessCategory(row.readiness, "geo")).length,
    missingSeo: rows.filter((row) => hasReadinessCategory(row.readiness, "seo")).length,
    missingSchema: rows.filter((row) => hasReadinessCategory(row.readiness, "schema")).length,
    missingInternalLinks: rows.filter((row) => hasReadinessCategory(row.readiness, "relations")).length,
    duplicateRisk: rows.filter((row) => hasReadinessCategory(row.readiness, "duplicate")).length,
    waitingManualApproval: rows.filter((row) => hasReadinessCategory(row.readiness, "manual")).length,
  };
}

export function groupReadinessBlockers(readiness: ImportEntityReadiness): readonly ImportAdminReadinessBlockerGroup[] {
  const blockers = [...readiness.blockers, ...readiness.warnings];
  const groups = new Map<ImportReadinessCategory, ImportReadinessBlocker[]>();

  for (const blocker of blockers) {
    const grouped = groups.get(blocker.category) ?? [];
    grouped.push(blocker);
    groups.set(blocker.category, grouped);
  }

  return [...groups.entries()].map(([category, categoryBlockers]) => ({
    category,
    severity: highestSeverity(categoryBlockers),
    blockers: categoryBlockers,
    suggestedAction: categoryBlockers[0]?.suggestedAction ?? "ready_to_publish",
  }));
}

export function buildAdminReadinessTimeline(row: ImportAdminReadinessEntityRow): readonly ImportAdminReadinessTimelineItem[] {
  const readiness = row.readiness;

  return [
    { stage: "imported", status: row.imported_at ? "complete" : "pending" },
    { stage: "validated", status: readiness.score > 0 ? "complete" : "pending" },
    { stage: "geo_checked", status: stageStatus(readiness, "geo") },
    { stage: "seo_checked", status: stageStatus(readiness, "seo") },
    { stage: "schema_generated", status: stageStatus(readiness, "schema") },
    { stage: "links_generated", status: stageStatus(readiness, "relations") },
    { stage: "manual_approved", status: stageStatus(readiness, "manual") },
    { stage: "published", status: row.lifecycle_state === "published" ? "complete" : readiness.publishReady ? "pending" : "blocked" },
  ];
}

export function buildAdminReadinessPanelRows(rows: readonly ImportAdminReadinessEntityRow[]): readonly ImportAdminReadinessPanelRow[] {
  return rows.map((row) => ({
    ...row,
    blockerGroups: groupReadinessBlockers(row.readiness),
    timeline: buildAdminReadinessTimeline(row),
  }));
}

export function filterAdminReadinessRows(
  rows: readonly ImportAdminReadinessEntityRow[],
  filter: ImportAdminReadinessFilter,
): readonly ImportAdminReadinessEntityRow[] {
  return rows
    .filter((row) => (filter.entity_type ? row.entity_type === filter.entity_type : true))
    .filter((row) => (filter.entity_domain ? row.entity_domain === filter.entity_domain : true))
    .filter((row) => (filter.ready_state === "ready" ? row.readiness.publishReady : true))
    .filter((row) => (filter.ready_state === "blocked" ? !row.readiness.publishReady : true))
    .filter((row) => (filter.sitemap_eligible === undefined ? true : row.readiness.sitemapReady === filter.sitemap_eligible))
    .filter((row) => (filter.blocker_category ? hasReadinessCategory(row.readiness, filter.blocker_category) : true));
}

function hasReadinessCategory(readiness: ImportEntityReadiness, category: ImportReadinessCategory): boolean {
  return readiness.blockers.some((blocker) => blocker.category === category) || readiness.warnings.some((blocker) => blocker.category === category);
}

function stageStatus(readiness: ImportEntityReadiness, category: ImportReadinessCategory): ImportAdminReadinessStageStatus {
  return hasReadinessCategory(readiness, category) ? "blocked" : "complete";
}

function highestSeverity(blockers: readonly ImportReadinessBlocker[]): ImportReadinessSeverity {
  if (blockers.some((blocker) => blocker.severity === "critical")) return "critical";
  if (blockers.some((blocker) => blocker.severity === "high")) return "high";
  if (blockers.some((blocker) => blocker.severity === "medium")) return "medium";
  return "low";
}
