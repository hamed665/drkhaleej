import "server-only";

import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";
import type { ImportEntityReadiness } from "./import-readiness-engine";

export type ImportQueueBatchStatus = "uploaded" | "parsed" | "validated" | "blocked" | "ready_for_review" | "published" | "archived";
export type ImportQueueRowStatus = "imported" | "validation_failed" | "needs_review" | "ready_for_publish" | "published" | "archived";
export type ImportQueuePriority = "critical" | "high" | "medium" | "low";

export type ImportQueueDashboardBatch = {
  batch_id: string;
  source_filename: string | null;
  uploaded_at: string | null;
  imported_at: string | null;
  status: ImportQueueBatchStatus;
  total_rows: number;
  imported_rows: number;
  blocked_rows: number;
  ready_rows: number;
  published_rows: number;
};

export type ImportQueueDashboardRow = {
  row_id: string;
  batch_id: string;
  entity_id: string | null;
  entity_name: string | null;
  entity_type: ImportEntityType | null;
  entity_domain: ImportEntityDomain | null;
  row_status: ImportQueueRowStatus;
  priority: ImportQueuePriority;
  imported_at: string | null;
  updated_at: string | null;
  readiness: ImportEntityReadiness | null;
  blockers: readonly string[];
};

export type ImportQueueDashboardFilter = {
  batch_id?: string;
  row_status?: ImportQueueRowStatus;
  entity_type?: ImportEntityType;
  entity_domain?: ImportEntityDomain;
  priority?: ImportQueuePriority;
  ready_only?: boolean;
  blocked_only?: boolean;
};

export type ImportQueueDashboardSummary = {
  totalBatches: number;
  totalRows: number;
  importedRows: number;
  blockedRows: number;
  readyRows: number;
  publishedRows: number;
  criticalRows: number;
  highPriorityRows: number;
};

export type ImportQueueDashboardExportRow = {
  row_id: string;
  batch_id: string;
  entity_name: string | null;
  entity_type: ImportEntityType | null;
  entity_domain: ImportEntityDomain | null;
  row_status: ImportQueueRowStatus;
  priority: ImportQueuePriority;
  reason: string;
  suggested_fix: string;
};

export function buildImportQueueDashboardSummary(
  batches: readonly ImportQueueDashboardBatch[],
  rows: readonly ImportQueueDashboardRow[],
): ImportQueueDashboardSummary {
  return {
    totalBatches: batches.length,
    totalRows: rows.length,
    importedRows: rows.filter((row) => row.row_status === "imported").length,
    blockedRows: rows.filter((row) => isImportQueueRowBlocked(row)).length,
    readyRows: rows.filter((row) => isImportQueueRowReady(row)).length,
    publishedRows: rows.filter((row) => row.row_status === "published").length,
    criticalRows: rows.filter((row) => row.priority === "critical").length,
    highPriorityRows: rows.filter((row) => row.priority === "high").length,
  };
}

export function filterImportQueueDashboardRows(
  rows: readonly ImportQueueDashboardRow[],
  filter: ImportQueueDashboardFilter,
): readonly ImportQueueDashboardRow[] {
  return rows
    .filter((row) => (filter.batch_id ? row.batch_id === filter.batch_id : true))
    .filter((row) => (filter.row_status ? row.row_status === filter.row_status : true))
    .filter((row) => (filter.entity_type ? row.entity_type === filter.entity_type : true))
    .filter((row) => (filter.entity_domain ? row.entity_domain === filter.entity_domain : true))
    .filter((row) => (filter.priority ? row.priority === filter.priority : true))
    .filter((row) => (filter.ready_only ? isImportQueueRowReady(row) : true))
    .filter((row) => (filter.blocked_only ? isImportQueueRowBlocked(row) : true));
}

export function buildImportQueueDashboardExportRows(
  rows: readonly ImportQueueDashboardRow[],
): readonly ImportQueueDashboardExportRow[] {
  return rows
    .filter((row) => isImportQueueRowBlocked(row))
    .map((row) => ({
      row_id: row.row_id,
      batch_id: row.batch_id,
      entity_name: row.entity_name,
      entity_type: row.entity_type,
      entity_domain: row.entity_domain,
      row_status: row.row_status,
      priority: row.priority,
      reason: row.blockers[0] ?? "unknown_blocker",
      suggested_fix: suggestedFixForQueueRow(row),
    }));
}

export function isImportQueueRowReady(row: ImportQueueDashboardRow): boolean {
  return row.row_status === "ready_for_publish" || row.readiness?.publishReady === true;
}

export function isImportQueueRowBlocked(row: ImportQueueDashboardRow): boolean {
  return row.row_status === "validation_failed" || row.row_status === "needs_review" || row.blockers.length > 0 || row.readiness?.publishReady === false;
}

function suggestedFixForQueueRow(row: ImportQueueDashboardRow): string {
  if (row.readiness?.nextAction) return row.readiness.nextAction;
  if (row.blockers.length > 0) return "review_blockers";
  return "review_import_row";
}
