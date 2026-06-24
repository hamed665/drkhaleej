"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type ImportReviewDecision = "approved_for_projection" | "rejected" | "hold" | "needs_more_data";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportReviewQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportReviewQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportReviewQueryBuilder<T>;
  limit(count: number): ImportReviewQueryBuilder<T>;
  update(values: MutationPayload): ImportReviewQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportReviewClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportReviewQueryBuilder<T>;
};

type ImportRowForReview = {
  id: string;
  batch_id: string;
  row_number: number;
  row_status: string;
  validation_score: number;
  metadata: unknown;
};

type ImportRowCounter = {
  row_status: string;
};

export type ReviewImportRowResult =
  | { ok: true; batchId: string; reviewDecision: ImportReviewDecision }
  | { ok: false; reason: "invalid" | "not_found" | "unavailable" };

function createImportReviewClient(): ImportReviewClient {
  return createSupabaseServiceRoleClient() as unknown as ImportReviewClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isImportReviewDecision(value: string): value is ImportReviewDecision {
  return value === "approved_for_projection" || value === "rejected" || value === "hold" || value === "needs_more_data";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rowStatusForDecision(decision: ImportReviewDecision): string {
  if (decision === "approved_for_projection") return "ready_for_publish";
  if (decision === "rejected") return "rejected";
  return "needs_review";
}

function countReadyForReviewRows(rows: ImportRowCounter[]): number {
  return rows.filter((row) => row.row_status === "ready_for_publish").length;
}

export async function reviewAdminImportRow(
  rawRowId: string,
  reviewDecision: string,
): Promise<ReviewImportRowResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(rawRowId) || !isImportReviewDecision(reviewDecision)) {
    return { ok: false, reason: "invalid" };
  }

  const supabase = createImportReviewClient();
  const rowResult = await supabase
    .from<ImportRowForReview>("import_raw_rows")
    .select("id, batch_id, row_number, row_status, validation_score, metadata")
    .eq("id", rawRowId)
    .maybeSingle();

  if (rowResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (rowResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const now = new Date().toISOString();
  const oldStatus = rowResult.data.row_status;
  const oldMetadata = isRecord(rowResult.data.metadata) ? rowResult.data.metadata : {};
  const nextRowStatus = rowStatusForDecision(reviewDecision);

  const updateResult = await supabase
    .from("import_raw_rows")
    .update({
      row_status: nextRowStatus,
      metadata: {
        ...oldMetadata,
        import_review_version: "v1",
        review_decision: reviewDecision,
        reviewed_at: now,
        reviewed_by_profile_id: admin.profile.id,
        previous_row_status: oldStatus,
      },
    })
    .eq("id", rawRowId);

  if (updateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  const rowsResult = await supabase
    .from<ImportRowCounter>("import_raw_rows")
    .select("row_status")
    .eq("batch_id", rowResult.data.batch_id)
    .limit(5000);

  if (rowsResult.error !== null || rowsResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const readyForReviewRows = countReadyForReviewRows(rowsResult.data);
  const batchStatus = readyForReviewRows > 0 ? "ready_for_publish" : "reviewing";
  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      status: batchStatus,
      ready_for_review_rows: readyForReviewRows,
      metadata: {
        import_review_version: "v1",
        last_review_decision: reviewDecision,
        last_reviewed_raw_row_id: rawRowId,
        ready_for_review_rows: readyForReviewRows,
      },
    })
    .eq("id", rowResult.data.batch_id);

  if (batchUpdateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.review",
    action: "import_review.status_changed",
    entityType: "import_raw_row",
    entityId: rawRowId,
    targetTable: "import_raw_rows",
    summary: "Import row review decision recorded.",
    oldValues: { rowStatus: oldStatus },
    newValues: { rowStatus: nextRowStatus, reviewDecision },
    metadata: {
      batchId: rowResult.data.batch_id,
      rowNumber: rowResult.data.row_number,
      validationScore: rowResult.data.validation_score,
      readyForReviewRows,
    },
  });

  return {
    ok: true,
    batchId: rowResult.data.batch_id,
    reviewDecision,
  };
}
