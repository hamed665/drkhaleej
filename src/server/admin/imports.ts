import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

export type AdminImportEntityType =
  | "doctor"
  | "hospital"
  | "pharmacy"
  | "clinic"
  | "laboratory"
  | "medical_center";

export type AdminImportBatchStatus =
  | "draft"
  | "uploaded"
  | "parsing"
  | "parsed"
  | "validation_failed"
  | "validated"
  | "normalizing"
  | "normalized"
  | "reviewing"
  | "ready_for_publish"
  | "completed"
  | "failed"
  | "archived";

type ImportTableName =
  | "import_batches"
  | "import_raw_rows"
  | "import_validation_issues"
  | "import_duplicate_candidates"
  | "import_mapping_results"
  | "import_publish_queue";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };

type ImportQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportQueryBuilder<T>;
  limit(count: number): ImportQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportAdminClient = {
  from<T extends object>(table: ImportTableName): ImportQueryBuilder<T>;
};

type ImportBatchRow = {
  id: string;
  batch_name: string;
  entity_type: AdminImportEntityType;
  source_type: string;
  source_name: string | null;
  file_name: string | null;
  file_hash: string | null;
  status: AdminImportBatchStatus;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_suspected_rows: number;
  ready_for_review_rows: number;
  created_at: string;
  updated_at: string;
};

type ImportRawRow = {
  id: string;
  row_number: number;
  entity_type: AdminImportEntityType;
  external_id: string | null;
  row_status: string;
  validation_score: number;
  source_url: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

type ImportValidationIssueRow = {
  id: string;
  raw_row_id: string | null;
  severity: "info" | "warning" | "error" | "critical";
  field_name: string | null;
  issue_code: string;
  issue_message: string;
  suggested_fix: string | null;
  created_at: string;
};

type ImportDuplicateCandidateRow = {
  id: string;
  raw_row_id: string;
  matched_entity_type: string;
  matched_entity_id: string | null;
  match_score: number;
  match_reason: string;
  resolution_status: string;
  created_at: string;
};

type ImportMappingResultRow = {
  id: string;
  raw_row_id: string;
  mapping_type: string;
  source_value: string | null;
  target_type: string;
  target_id: string | null;
  target_slug: string | null;
  confidence_score: number;
  mapping_status: string;
  created_at: string;
};

type ImportPublishQueueRow = {
  id: string;
  raw_row_id: string;
  target_entity_type: string;
  target_entity_id: string | null;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminImportBatchSummary = {
  id: string;
  batchName: string;
  entityType: AdminImportEntityType;
  sourceType: string;
  sourceName: string | null;
  fileName: string | null;
  fileHash: string | null;
  status: AdminImportBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateSuspectedRows: number;
  readyForReviewRows: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminImportBatchDetail = {
  batch: AdminImportBatchSummary;
  rawRows: ImportRawRow[];
  validationIssues: ImportValidationIssueRow[];
  duplicateCandidates: ImportDuplicateCandidateRow[];
  mappingResults: ImportMappingResultRow[];
  publishQueue: ImportPublishQueueRow[];
};

export type AdminImportBatchListResult =
  | { ok: true; items: AdminImportBatchSummary[]; limit: number }
  | { ok: false; items: []; limit: number; reason: "unavailable" };

export type AdminImportBatchDetailResult =
  | ({ ok: true } & AdminImportBatchDetail)
  | { ok: false; reason: "not_found" | "unavailable" };

const batchLimit = 50;
const detailLimit = 100;
const batchColumns =
  "id, batch_name, entity_type, source_type, source_name, file_name, file_hash, status, total_rows, valid_rows, invalid_rows, duplicate_suspected_rows, ready_for_review_rows, created_at, updated_at";

function createImportAdminClient(): ImportAdminClient {
  return createSupabaseServiceRoleClient() as unknown as ImportAdminClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function mapBatch(row: ImportBatchRow): AdminImportBatchSummary {
  return {
    id: row.id,
    batchName: row.batch_name,
    entityType: row.entity_type,
    sourceType: row.source_type,
    sourceName: row.source_name,
    fileName: row.file_name,
    fileHash: row.file_hash,
    status: row.status,
    totalRows: row.total_rows,
    validRows: row.valid_rows,
    invalidRows: row.invalid_rows,
    duplicateSuspectedRows: row.duplicate_suspected_rows,
    readyForReviewRows: row.ready_for_review_rows,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminImportBatches(): Promise<AdminImportBatchListResult> {
  await requireAdminPermission("imports.read");

  const supabase = createImportAdminClient();
  const { data, error } = await supabase
    .from<ImportBatchRow>("import_batches")
    .select(batchColumns)
    .order("created_at", { ascending: false })
    .limit(batchLimit);

  if (error !== null || data === null) {
    return { ok: false, items: [], limit: batchLimit, reason: "unavailable" };
  }

  return { ok: true, items: data.map(mapBatch), limit: batchLimit };
}

export async function getAdminImportBatchDetail(
  batchId: string,
): Promise<AdminImportBatchDetailResult> {
  await requireAdminPermission("imports.read");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportAdminClient();
  const batchResult = await supabase
    .from<ImportBatchRow>("import_batches")
    .select(batchColumns)
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [rawRowsResult, validationIssuesResult, duplicateCandidatesResult, mappingResultsResult, publishQueueResult] =
    await Promise.all([
      supabase
        .from<ImportRawRow>("import_raw_rows")
        .select(
          "id, row_number, entity_type, external_id, row_status, validation_score, source_url, last_checked_at, created_at, updated_at",
        )
        .eq("batch_id", batchId)
        .order("row_number", { ascending: true })
        .limit(detailLimit),
      supabase
        .from<ImportValidationIssueRow>("import_validation_issues")
        .select(
          "id, raw_row_id, severity, field_name, issue_code, issue_message, suggested_fix, created_at",
        )
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false })
        .limit(detailLimit),
      supabase
        .from<ImportDuplicateCandidateRow>("import_duplicate_candidates")
        .select(
          "id, raw_row_id, matched_entity_type, matched_entity_id, match_score, match_reason, resolution_status, created_at",
        )
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false })
        .limit(detailLimit),
      supabase
        .from<ImportMappingResultRow>("import_mapping_results")
        .select(
          "id, raw_row_id, mapping_type, source_value, target_type, target_id, target_slug, confidence_score, mapping_status, created_at",
        )
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false })
        .limit(detailLimit),
      supabase
        .from<ImportPublishQueueRow>("import_publish_queue")
        .select(
          "id, raw_row_id, target_entity_type, target_entity_id, publish_status, index_policy, sitemap_policy, quality_score, admin_note, created_at, updated_at",
        )
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false })
        .limit(detailLimit),
    ]);

  if (
    rawRowsResult.error !== null ||
    rawRowsResult.data === null ||
    validationIssuesResult.error !== null ||
    validationIssuesResult.data === null ||
    duplicateCandidatesResult.error !== null ||
    duplicateCandidatesResult.data === null ||
    mappingResultsResult.error !== null ||
    mappingResultsResult.data === null ||
    publishQueueResult.error !== null ||
    publishQueueResult.data === null
  ) {
    return { ok: false, reason: "unavailable" };
  }

  return {
    ok: true,
    batch: mapBatch(batchResult.data),
    rawRows: rawRowsResult.data,
    validationIssues: validationIssuesResult.data,
    duplicateCandidates: duplicateCandidatesResult.data,
    mappingResults: mappingResultsResult.data,
    publishQueue: publishQueueResult.data,
  };
}
