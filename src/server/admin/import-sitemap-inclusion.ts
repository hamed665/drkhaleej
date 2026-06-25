"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { listAdminImportSitemapEligibleCandidates } from "@/server/admin/import-sitemap-eligibility";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type JsonRecord = Record<string, unknown>;
type MutationPayload = Record<string, unknown>;

type QueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): QueryBuilder<T>;
  eq(column: string, value: string | number | boolean): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  update(values: MutationPayload): QueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type Client = { from<T extends object = Record<string, unknown>>(table: string): QueryBuilder<T> };

type BatchRow = { id: string; status: string; metadata: unknown };
type QueueRow = {
  id: string;
  raw_row_id: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  metadata: unknown;
};

type RoutedEntityType = "doctor" | "hospital";
type IncludedItem = { publishQueueId: string; rawRowId: string; entityType: string; canonicalPath: string };

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

const inclusionLimit = 500;
const inclusionVersion = "v1";
const routedEntityTypes = ["doctor", "hospital"] as const;

function client(): Client {
  return createSupabaseServiceRoleClient() as unknown as Client;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeMetadata(existing: unknown, patch: JsonRecord): JsonRecord {
  return { ...(isRecord(existing) ? existing : {}), ...patch };
}

function uniqueReasons(reasons: string[]): string[] {
  return [...new Set(reasons.filter((reason) => reason.trim().length > 0))];
}

function routedEntityType(value: string): RoutedEntityType | null {
  return routedEntityTypes.some((entityType) => entityType === value) ? (value as RoutedEntityType) : null;
}

function isRoutedPublicPath(entityType: RoutedEntityType, path: string): boolean {
  if (entityType === "doctor") {
    return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path);
  }

  return /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path);
}

async function markBlocked(
  supabase: Client,
  queueRow: QueueRow,
  checkedAt: string,
  reasons: string[],
): Promise<boolean> {
  const result = await supabase
    .from("import_publish_queue")
    .update({
      metadata: mergeMetadata(queueRow.metadata, {
        sitemap_inclusion_gate_version: inclusionVersion,
        sitemap_inclusion_checked_at: checkedAt,
        sitemap_inclusion_status: "blocked",
        sitemap_inclusion_reasons: uniqueReasons(reasons),
        sitemap_included: false,
      }),
    })
    .eq("id", queueRow.id);

  return result.error === null;
}

export async function includeSitemapEligibleImportCandidates(
  batchId: string,
): Promise<IncludeSitemapEligibleImportCandidatesResult> {
  const admin = await requireAdminPermission("imports.review");
  if (!isUuid(batchId)) return { ok: false, reason: "not_found" };

  const supabase = client();
  const batchResult = await supabase
    .from<BatchRow>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) return { ok: false, reason: "unavailable" };
  if (batchResult.data === null) return { ok: false, reason: "not_found" };

  const eligibilityResult = await listAdminImportSitemapEligibleCandidates(batchId);
  if (!eligibilityResult.ok) return { ok: false, reason: eligibilityResult.reason };
  if (eligibilityResult.items.length === 0) return { ok: false, reason: "empty" };

  const queueResult = await supabase
    .from<QueueRow>("import_publish_queue")
    .select("id, raw_row_id, publish_status, index_policy, sitemap_policy, metadata")
    .eq("batch_id", batchId)
    .eq("publish_status", "index_eligible")
    .eq("index_policy", "index_eligible")
    .eq("sitemap_policy", "eligible")
    .order("updated_at", { ascending: false })
    .limit(inclusionLimit);

  if (queueResult.error !== null || queueResult.data === null) return { ok: false, reason: "unavailable" };

  const queueRowsById = new Map(queueResult.data.map((row) => [row.id, row]));
  const checkedAt = new Date().toISOString();
  const includedItems: IncludedItem[] = [];
  let blockedRows = 0;
  let skippedRows = 0;

  for (const item of eligibilityResult.items) {
    const queueRow = queueRowsById.get(item.publishQueueId);
    if (!queueRow) {
      skippedRows += 1;
      continue;
    }

    const reasons = [...item.reasons];
    const safeEntityType = routedEntityType(item.entityType);
    if (item.robotsPolicy !== "index_candidate") reasons.push("robots_policy_not_index_candidate");
    if (item.sitemapIncluded !== false) reasons.push("already_marked_as_sitemap_included");
    if (item.canonicalPath === null || item.canonicalUrlCandidate === null) reasons.push("missing_canonical_url_candidate");
    if (safeEntityType === null) reasons.push("public_profile_route_not_enabled_for_entity_type");
    if (safeEntityType !== null && item.canonicalPath !== null && !isRoutedPublicPath(safeEntityType, item.canonicalPath)) {
      reasons.push("canonical_route_not_enabled_for_public_sitemap");
    }

    if (reasons.length > 0 || item.canonicalPath === null || item.canonicalUrlCandidate === null) {
      blockedRows += 1;
      if (!(await markBlocked(supabase, queueRow, checkedAt, reasons))) return { ok: false, reason: "unavailable" };
      continue;
    }

    const updateResult = await supabase
      .from("import_publish_queue")
      .update({
        index_policy: "index",
        sitemap_policy: "included",
        metadata: mergeMetadata(queueRow.metadata, {
          sitemap_inclusion_gate_version: inclusionVersion,
          sitemap_inclusion_checked_at: checkedAt,
          sitemap_inclusion_status: "included",
          sitemap_inclusion_reasons: [],
          sitemap_included: true,
          robots_policy: "index",
          canonical_path: item.canonicalPath,
          canonical_url_candidate: item.canonicalUrlCandidate,
          routed_public_profile_entity_type: item.entityType,
        }),
      })
      .eq("id", queueRow.id);

    if (updateResult.error !== null) return { ok: false, reason: "unavailable" };

    includedItems.push({
      publishQueueId: queueRow.id,
      rawRowId: queueRow.raw_row_id,
      entityType: item.entityType,
      canonicalPath: item.canonicalPath,
    });
  }

  const previousMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdate = await supabase
    .from("import_batches")
    .update({
      metadata: {
        ...previousMetadata,
        sitemap_inclusion_gate_version: inclusionVersion,
        sitemap_inclusion_checked_at: checkedAt,
        sitemap_inclusion_read_rows: eligibilityResult.items.length,
        sitemap_inclusion_included_rows: includedItems.length,
        sitemap_inclusion_blocked_rows: blockedRows,
        sitemap_inclusion_skipped_rows: skippedRows,
        routed_public_profile_entity_types: [...routedEntityTypes],
      },
    })
    .eq("id", batchId);

  if (batchUpdate.error !== null) return { ok: false, reason: "unavailable" };

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.review",
    action: "import_review.status_changed",
    entityType: "import_batch",
    entityId: batchId,
    targetTable: "import_publish_queue",
    summary: "Sitemap-eligible import queue rows were evaluated for routed doctor and hospital sitemap inclusion.",
    oldValues: { batchStatus: batchResult.data.status },
    newValues: { includedRows: includedItems.length, blockedRows, skippedRows },
    metadata: {
      sitemapInclusionGateVersion: inclusionVersion,
      publicSitemapRouteCreated: false,
      sitemapPolicyForIncludedRows: "included",
      routedPublicProfileEntityTypes: [...routedEntityTypes],
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
