"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { listAdminImportSitemapEligibleCandidates } from "@/server/admin/import-sitemap-eligibility";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportSitemapInclusionQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportSitemapInclusionQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportSitemapInclusionQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportSitemapInclusionQueryBuilder<T>;
  limit(count: number): ImportSitemapInclusionQueryBuilder<T>;
  update(values: MutationPayload): ImportSitemapInclusionQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportSitemapInclusionClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportSitemapInclusionQueryBuilder<T>;
};

type ImportBatchForSitemapInclusion = {
  id: string;
  status: string;
  metadata: unknown;
};

type PublishQueueForSitemapInclusion = {
  id: string;
  batch_id: string;
  raw_row_id: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number;
  updated_at: string;
  metadata: unknown;
};

type JsonRecord = Record<string, unknown>;

type IncludedSitemapItem = {
  publishQueueId: string;
  rawRowId: string;
  canonicalPath: string;
};

export type IncludeSitemapEligibleImportCandidatesResult =
  | {
      ok: true;
      batchId: string;
      read: number;
      includedRows: number;
      blockedRows: number;
      skippedRows: number;
      auditWritten: boolean;
    }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const sitemapInclusionLimit = 500;
const sitemapInclusionGateVersion = "v1";

function createImportSitemapInclusionClient(): ImportSitemapInclusionClient {
  return createSupabaseServiceRoleClient() as unknown as ImportSitemapInclusionClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeMetadata(existing: unknown, patch: JsonRecord): JsonRecord {
  return {
    ...(isRecord(existing) ? existing : {}),
    ...patch,
  };
}

function uniqueReasons(reasons: string[]): string[] {
  return [...new Set(reasons.filter((reason) => reason.trim().length > 0))];
}

async function markSitemapInclusionBlocked(
  supabase: ImportSitemapInclusionClient,
  queueRow: PublishQueueForSitemapInclusion,
  blockedAt: string,
  reasons: string[],
): Promise<boolean> {
  const updateResult = await supabase
    .from("import_publish_queue")
    .update({
      metadata: mergeMetadata(queueRow.metadata, {
        sitemap_inclusion_gate_version: sitemapInclusionGateVersion,
        sitemap_inclusion_checked_at: blockedAt,
        sitemap_inclusion_status: "blocked",
        sitemap_inclusion_reasons: uniqueReasons(reasons),
        sitemap_included: false,
      }),
    })
    .eq("id", queueRow.id);

  return updateResult.error === null;
}

export async function includeSitemapEligibleImportCandidates(
  batchId: string,
): Promise<IncludeSitemapEligibleImportCandidatesResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportSitemapInclusionClient();
  const batchResult = await supabase
    .from<ImportBatchForSitemapInclusion>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const eligibilityResult = await listAdminImportSitemapEligibleCandidates(batchId);
  if (!eligibilityResult.ok) {
    return { ok: false, reason: eligibilityResult.reason };
  }

  if (eligibilityResult.items.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const queueResult = await supabase
    .from<PublishQueueForSitemapInclusion>("import_publish_queue")
    .select("id, batch_id, raw_row_id, publish_status, index_policy, sitemap_policy, quality_score, updated_at, metadata")
    .eq("batch_id", batchId)
    .eq("publish_status", "index_eligible")
    .eq("index_policy", "index_eligible")
    .eq("sitemap_policy", "eligible")
    .order("updated_at", { ascending: false })
    .limit(sitemapInclusionLimit);

  if (queueResult.error !== null || queueResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const queueRowsById = new Map(queueResult.data.map((queueRow) => [queueRow.id, queueRow]));
  const checkedAt = new Date().toISOString();
  const includedItems: IncludedSitemapItem[] = [];
  let blockedRows = 0;
  let skippedRows = 0;

  for (const item of eligibilityResult.items) {
    const queueRow = queueRowsById.get(item.publishQueueId);

    if (!queueRow) {
      skippedRows += 1;
      continue;
    }

    const blockReasons = [...item.reasons];
    if (item.robotsPolicy !== "index_candidate") blockReasons.push("robots_policy_not_index_candidate");
    if (item.sitemapIncluded !== false) blockReasons.push("already_marked_as_sitemap_included");
    if (item.canonicalPath === null || item.canonicalUrlCandidate === null) blockReasons.push("missing_canonical_url_candidate");

    if (blockReasons.length > 0 || item.canonicalPath === null || item.canonicalUrlCandidate === null) {
      blockedRows += 1;
      const blocked = await markSitemapInclusionBlocked(supabase, queueRow, checkedAt, blockReasons);
      if (!blocked) {
        return { ok: false, reason: "unavailable" };
      }
      continue;
    }

    const updateResult = await supabase
      .from("import_publish_queue")
      .update({
        index_policy: "index",
        sitemap_policy: "included",
        metadata: mergeMetadata(queueRow.metadata, {
          sitemap_inclusion_gate_version: sitemapInclusionGateVersion,
          sitemap_inclusion_checked_at: checkedAt,
          sitemap_inclusion_status: "included",
          sitemap_inclusion_reasons: [],
          sitemap_included: true,
          robots_policy: "index",
          canonical_path: item.canonicalPath,
          canonical_url_candidate: item.canonicalUrlCandidate,
        }),
      })
      .eq("id", queueRow.id);

    if (updateResult.error !== null) {
      return { ok: false, reason: "unavailable" };
    }

    includedItems.push({
      publishQueueId: queueRow.id,
      rawRowId: queueRow.raw_row_id,
      canonicalPath: item.canonicalPath,
    });
  }

  const oldBatchMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdate = await supabase
    .from("import_batches")
    .update({
      metadata: {
        ...oldBatchMetadata,
        sitemap_inclusion_gate_version: sitemapInclusionGateVersion,
        sitemap_inclusion_checked_at: checkedAt,
        sitemap_inclusion_read_rows: eligibilityResult.items.length,
        sitemap_inclusion_included_rows: includedItems.length,
        sitemap_inclusion_blocked_rows: blockedRows,
        sitemap_inclusion_skipped_rows: skippedRows,
      },
    })
    .eq("id", batchId);

  if (batchUpdate.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.review",
    action: "import_review.status_changed",
    entityType: "import_batch",
    entityId: batchId,
    targetTable: "import_publish_queue",
    summary: "Sitemap-eligible import queue rows were evaluated for sitemap inclusion.",
    oldValues: {
      batchStatus: batchResult.data.status,
    },
    newValues: {
      includedRows: includedItems.length,
      blockedRows,
      skippedRows,
    },
    metadata: {
      sitemapInclusionGateVersion,
      publicSitemapRouteCreated: false,
      sitemapPolicyForIncludedRows: "included",
      includedItems,
    },
  });

  return {
    ok: true,
    batchId,
    read: eligibilityResult.items.length,
    includedRows: includedItems.length,
    blockedRows,
    skippedRows,
    auditWritten: true,
  };
}
