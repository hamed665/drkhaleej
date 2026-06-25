import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };

type ImportSitemapMonitoringQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportSitemapMonitoringQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportSitemapMonitoringQueryBuilder<T>;
  limit(count: number): ImportSitemapMonitoringQueryBuilder<T>;
};

type ImportSitemapMonitoringClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportSitemapMonitoringQueryBuilder<T>;
};

type ImportSitemapQueueRow = {
  id: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  updated_at: string;
  metadata: unknown;
};

type JsonRecord = Record<string, unknown>;

export type AdminImportSitemapRuntimeQa = {
  ok: true;
  limit: number;
  rowsRead: number;
  truncated: boolean;
  includedRows: number;
  safeIncludedRows: number;
  unsafeIncludedRows: number;
  eligibleRows: number;
  noindexRows: number;
  blockedOrSkippedRows: number;
  duplicateCanonicalRows: number;
  missingCanonicalRows: number;
  latestIncludedAt: string | null;
  warnings: string[];
};

export type GetAdminImportSitemapRuntimeQaResult =
  | AdminImportSitemapRuntimeQa
  | { ok: false; reason: "unavailable" };

const sitemapRuntimeQaLimit = 5000;

function createImportSitemapMonitoringClient(): ImportSitemapMonitoringClient {
  return createSupabaseServiceRoleClient() as unknown as ImportSitemapMonitoringClient;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: JsonRecord, key: string): string | null {
  const result = value[key];
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSafePublicCanonicalPath(pathname: string): boolean {
  return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname);
}

function isSafeIncludedRow(row: ImportSitemapQueueRow): boolean {
  if (row.publish_status !== "index_eligible") return false;
  if (row.index_policy !== "index") return false;
  if (row.sitemap_policy !== "included") return false;
  if (!isRecord(row.metadata)) return false;
  if (row.metadata.sitemap_included !== true) return false;
  if (readString(row.metadata, "robots_policy") !== "index") return false;

  const canonicalPath = readString(row.metadata, "canonical_path");
  return canonicalPath !== null && isSafePublicCanonicalPath(canonicalPath);
}

function canonicalPathForRow(row: ImportSitemapQueueRow): string | null {
  if (!isRecord(row.metadata)) return null;
  const canonicalPath = readString(row.metadata, "canonical_path");
  if (canonicalPath === null || !isSafePublicCanonicalPath(canonicalPath)) return null;
  return canonicalPath;
}

function buildWarnings(summary: Omit<AdminImportSitemapRuntimeQa, "ok" | "warnings">): string[] {
  const warnings: string[] = [];

  if (summary.truncated) warnings.push("qa_row_limit_reached");
  if (summary.unsafeIncludedRows > 0) warnings.push("unsafe_included_rows_present");
  if (summary.duplicateCanonicalRows > 0) warnings.push("duplicate_canonical_paths_present");
  if (summary.missingCanonicalRows > 0) warnings.push("included_rows_missing_safe_canonical_path");
  if (summary.eligibleRows > 0) warnings.push("eligible_rows_waiting_for_inclusion_gate");
  if (summary.noindexRows > 0) warnings.push("noindex_rows_still_excluded_from_sitemap");

  return warnings;
}

export async function getAdminImportSitemapRuntimeQa(): Promise<GetAdminImportSitemapRuntimeQaResult> {
  await requireAdminPermission("imports.read");

  const supabase = createImportSitemapMonitoringClient();
  const result = await supabase
    .from<ImportSitemapQueueRow>("import_publish_queue")
    .select("id, publish_status, index_policy, sitemap_policy, updated_at, metadata")
    .order("updated_at", { ascending: false })
    .limit(sitemapRuntimeQaLimit);

  if (result.error !== null || result.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const rows = result.data;
  const includedRows = rows.filter((row) => row.sitemap_policy === "included");
  const safeIncludedRows = includedRows.filter(isSafeIncludedRow);
  const unsafeIncludedRows = includedRows.length - safeIncludedRows.length;
  const canonicalCounts = new Map<string, number>();
  let missingCanonicalRows = 0;

  for (const row of includedRows) {
    const canonicalPath = canonicalPathForRow(row);
    if (canonicalPath === null) {
      missingCanonicalRows += 1;
      continue;
    }
    canonicalCounts.set(canonicalPath, (canonicalCounts.get(canonicalPath) ?? 0) + 1);
  }

  const duplicateCanonicalRows = [...canonicalCounts.values()].reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );

  const latestIncludedAt = includedRows[0]?.updated_at ?? null;

  const summaryWithoutWarnings = {
    limit: sitemapRuntimeQaLimit,
    rowsRead: rows.length,
    truncated: rows.length === sitemapRuntimeQaLimit,
    includedRows: includedRows.length,
    safeIncludedRows: safeIncludedRows.length,
    unsafeIncludedRows,
    eligibleRows: rows.filter((row) => row.sitemap_policy === "eligible").length,
    noindexRows: rows.filter((row) => row.sitemap_policy === "excluded" || row.index_policy === "noindex").length,
    blockedOrSkippedRows: rows.filter((row) => {
      if (!isRecord(row.metadata)) return false;
      const sitemapStatus = readString(row.metadata, "sitemap_inclusion_status");
      const indexStatus = readString(row.metadata, "index_gate_status");
      return sitemapStatus === "blocked" || indexStatus === "blocked" || indexStatus === "skipped";
    }).length,
    duplicateCanonicalRows,
    missingCanonicalRows,
    latestIncludedAt,
  } satisfies Omit<AdminImportSitemapRuntimeQa, "ok" | "warnings">;

  return {
    ok: true,
    ...summaryWithoutWarnings,
    warnings: buildWarnings(summaryWithoutWarnings),
  };
}
