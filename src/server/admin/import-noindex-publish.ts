"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportNoindexPublishQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  insert(values: MutationPayload | MutationPayload[]): ImportNoindexPublishQueryBuilder<T>;
  select(columns: string): ImportNoindexPublishQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportNoindexPublishQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportNoindexPublishQueryBuilder<T>;
  limit(count: number): ImportNoindexPublishQueryBuilder<T>;
  update(values: MutationPayload): ImportNoindexPublishQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportNoindexPublishClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportNoindexPublishQueryBuilder<T>;
};

type ImportBatchForNoindexPublish = {
  id: string;
  status: string;
  metadata: unknown;
};

type ApprovedEntityCandidate = {
  id: string;
  batch_id: string;
  raw_row_id: string;
  entity_type: string;
  candidate_status: string;
  quality_score: number;
  candidate_payload: unknown;
};

type ExistingPublishQueueRow = {
  raw_row_id: string;
};

type JsonRecord = Record<string, unknown>;

export type PublishImportCandidatesNoindexResult =
  | {
      ok: true;
      batchId: string;
      read: number;
      publishedNoindexRows: number;
      skippedExistingRows: number;
      skippedLowQualityRows: number;
    }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const noindexPublishLimit = 500;
const noindexMinimumQualityScore = 60;
const noindexPublishVersion = "v1";

function createImportNoindexPublishClient(): ImportNoindexPublishClient {
  return createSupabaseServiceRoleClient() as unknown as ImportNoindexPublishClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown, key: string): JsonRecord {
  if (!isRecord(value)) return {};
  const next = value[key];
  return isRecord(next) ? next : {};
}

function readString(value: JsonRecord, key: string): string | null {
  const result = value[key];
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildPublishQueueMetadata(candidate: ApprovedEntityCandidate, publishedAt: string): JsonRecord {
  const payload = isRecord(candidate.candidate_payload) ? candidate.candidate_payload : {};
  const identity = readRecord(payload, "identity");
  const source = readRecord(payload, "source");
  const quality = readRecord(payload, "quality");

  return {
    noindex_publish_version: noindexPublishVersion,
    import_entity_candidate_id: candidate.id,
    source_raw_row_id: candidate.raw_row_id,
    published_noindex_at: publishedAt,
    projection_version: readString(payload, "projectionVersion"),
    primary_name: readString(identity, "primaryName"),
    source_name: readString(source, "sourceName"),
    last_checked_at: readString(source, "lastCheckedAt"),
    quality_flags: Array.isArray(quality.flags) ? quality.flags.filter((item) => typeof item === "string") : [],
  };
}

function buildPublishQueueInsert(candidate: ApprovedEntityCandidate, publishedAt: string): MutationPayload {
  return {
    batch_id: candidate.batch_id,
    raw_row_id: candidate.raw_row_id,
    target_entity_type: candidate.entity_type,
    target_entity_id: null,
    publish_status: "published_noindex",
    index_policy: "noindex",
    sitemap_policy: "excluded",
    quality_score: Math.max(0, Math.min(100, candidate.quality_score)),
    admin_note: "Published to protected noindex queue from an approved public-safe candidate. Sitemap remains excluded.",
    metadata: buildPublishQueueMetadata(candidate, publishedAt),
  };
}

export async function publishApprovedImportCandidatesNoindex(
  batchId: string,
): Promise<PublishImportCandidatesNoindexResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportNoindexPublishClient();
  const batchResult = await supabase
    .from<ImportBatchForNoindexPublish>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [candidatesResult, existingResult] = await Promise.all([
    supabase
      .from<ApprovedEntityCandidate>("import_entity_candidates")
      .select("id, batch_id, raw_row_id, entity_type, candidate_status, quality_score, candidate_payload")
      .eq("batch_id", batchId)
      .eq("candidate_status", "approved")
      .order("created_at", { ascending: true })
      .limit(noindexPublishLimit),
    supabase
      .from<ExistingPublishQueueRow>("import_publish_queue")
      .select("raw_row_id")
      .eq("batch_id", batchId)
      .limit(noindexPublishLimit),
  ]);

  if (
    candidatesResult.error !== null ||
    candidatesResult.data === null ||
    existingResult.error !== null ||
    existingResult.data === null
  ) {
    return { ok: false, reason: "unavailable" };
  }

  if (candidatesResult.data.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const existingRawRowIds = new Set(existingResult.data.map((row) => row.raw_row_id));
  const publishedAt = new Date().toISOString();
  const publishQueueRows: MutationPayload[] = [];
  const rawRowsToMarkPublished: string[] = [];
  let skippedExistingRows = 0;
  let skippedLowQualityRows = 0;

  for (const candidate of candidatesResult.data) {
    if (existingRawRowIds.has(candidate.raw_row_id)) {
      skippedExistingRows += 1;
      continue;
    }

    if (candidate.quality_score < noindexMinimumQualityScore) {
      skippedLowQualityRows += 1;
      continue;
    }

    publishQueueRows.push(buildPublishQueueInsert(candidate, publishedAt));
    rawRowsToMarkPublished.push(candidate.raw_row_id);
  }

  if (publishQueueRows.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const insertResult = await supabase.from("import_publish_queue").insert(publishQueueRows);
  if (insertResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  for (const rawRowId of rawRowsToMarkPublished) {
    const rowUpdateResult = await supabase
      .from("import_raw_rows")
      .update({ row_status: "published_noindex" })
      .eq("id", rawRowId);

    if (rowUpdateResult.error !== null) {
      return { ok: false, reason: "unavailable" };
    }
  }

  const oldBatchMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      status: "completed",
      metadata: {
        ...oldBatchMetadata,
        noindex_publish_version: noindexPublishVersion,
        noindex_published_at: publishedAt,
        noindex_published_rows: publishQueueRows.length,
        noindex_skipped_existing_rows: skippedExistingRows,
        noindex_skipped_low_quality_rows: skippedLowQualityRows,
        noindex_minimum_quality_score: noindexMinimumQualityScore,
        noindex_max_rows_per_run: noindexPublishLimit,
      },
    })
    .eq("id", batchId);

  if (batchUpdateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.review",
    action: "import_review.status_changed",
    entityType: "import_batch",
    entityId: batchId,
    targetTable: "import_publish_queue",
    summary: "Approved public-safe candidates were published to the noindex queue.",
    oldValues: {
      batchStatus: batchResult.data.status,
    },
    newValues: {
      batchStatus: "completed",
      publishedNoindexRows: publishQueueRows.length,
      skippedExistingRows,
      skippedLowQualityRows,
    },
    metadata: {
      noindexPublishVersion,
      indexPolicy: "noindex",
      sitemapPolicy: "excluded",
      minimumQualityScore: noindexMinimumQualityScore,
    },
  });

  return {
    ok: true,
    batchId,
    read: candidatesResult.data.length,
    publishedNoindexRows: publishQueueRows.length,
    skippedExistingRows,
    skippedLowQualityRows,
  };
}
