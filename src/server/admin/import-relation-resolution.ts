import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

export type RelationResolutionStatus = "approved" | "rejected" | "needs_manual_review" | "ignored";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type RelationResolutionQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): RelationResolutionQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): RelationResolutionQueryBuilder<T>;
  limit(count: number): RelationResolutionQueryBuilder<T>;
  update(values: MutationPayload): RelationResolutionQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type RelationResolutionClient = {
  from<T extends object = Record<string, unknown>>(table: string): RelationResolutionQueryBuilder<T>;
};

type RelationCandidateForResolution = {
  id: string;
  batch_id: string;
  raw_row_id: string | null;
  relation_type: string;
  source_entity_type: string;
  target_entity_type: string;
  match_score: number;
  resolution_status: string;
  metadata: unknown;
};

type RelationCandidateCounterRow = {
  resolution_status: string;
};

export type ResolveImportRelationResult =
  | { ok: true; batchId: string; resolutionStatus: RelationResolutionStatus }
  | { ok: false; reason: "invalid" | "not_found" | "unavailable" };

function createRelationResolutionClient(): RelationResolutionClient {
  return createSupabaseServiceRoleClient() as unknown as RelationResolutionClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRelationResolutionStatus(value: string): value is RelationResolutionStatus {
  return value === "approved" || value === "rejected" || value === "needs_manual_review" || value === "ignored";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function countStatuses(rows: RelationCandidateCounterRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.resolution_status] = (counts[row.resolution_status] ?? 0) + 1;
  }
  return counts;
}

export async function resolveAdminImportRelationCandidate(
  relationCandidateId: string,
  resolutionStatus: string,
): Promise<ResolveImportRelationResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(relationCandidateId) || !isRelationResolutionStatus(resolutionStatus)) {
    return { ok: false, reason: "invalid" };
  }

  const nextResolutionStatus: RelationResolutionStatus = resolutionStatus;
  const supabase = createRelationResolutionClient();
  const candidateResult = await supabase
    .from<RelationCandidateForResolution>("import_relation_candidates")
    .select("id, batch_id, raw_row_id, relation_type, source_entity_type, target_entity_type, match_score, resolution_status, metadata")
    .eq("id", relationCandidateId)
    .maybeSingle();

  if (candidateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (candidateResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const now = new Date().toISOString();
  const oldStatus = candidateResult.data.resolution_status;
  const oldMetadata = isRecord(candidateResult.data.metadata) ? candidateResult.data.metadata : {};

  const updateResult = await supabase
    .from("import_relation_candidates")
    .update({
      resolution_status: nextResolutionStatus,
      resolved_by_profile_id: admin.profile.id,
      resolved_at: now,
      metadata: {
        ...oldMetadata,
        admin_relation_resolution_version: "v1",
        previous_resolution_status: oldStatus,
        resolved_status: nextResolutionStatus,
        resolved_at: now,
      },
    })
    .eq("id", relationCandidateId);

  if (updateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  const relationCandidatesResult = await supabase
    .from<RelationCandidateCounterRow>("import_relation_candidates")
    .select("resolution_status")
    .eq("batch_id", candidateResult.data.batch_id)
    .limit(5000);

  if (relationCandidatesResult.error !== null || relationCandidatesResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const statusCounts = countStatuses(relationCandidatesResult.data);
  const pendingCount = statusCounts.pending ?? 0;
  const approvedCount = statusCounts.approved ?? 0;
  const rejectedCount = statusCounts.rejected ?? 0;
  const manualReviewCount = statusCounts.needs_manual_review ?? 0;
  const ignoredCount = statusCounts.ignored ?? 0;

  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      metadata: {
        relation_resolution_version: "v1",
        last_relation_resolution_status: nextResolutionStatus,
        last_relation_candidate_id: relationCandidateId,
        relation_candidates_pending: pendingCount,
        relation_candidates_approved: approvedCount,
        relation_candidates_rejected: rejectedCount,
        relation_candidates_needs_manual_review: manualReviewCount,
        relation_candidates_ignored: ignoredCount,
      },
    })
    .eq("id", candidateResult.data.batch_id);

  if (batchUpdateResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.review",
    action: "import_review.status_changed",
    entityType: "import_relation_candidate",
    entityId: relationCandidateId,
    targetTable: "import_relation_candidates",
    summary: "Import relation candidate resolution status changed.",
    oldValues: { resolutionStatus: oldStatus },
    newValues: { resolutionStatus: nextResolutionStatus },
    metadata: {
      batchId: candidateResult.data.batch_id,
      rawRowId: candidateResult.data.raw_row_id,
      relationType: candidateResult.data.relation_type,
      sourceEntityType: candidateResult.data.source_entity_type,
      targetEntityType: candidateResult.data.target_entity_type,
      matchScore: candidateResult.data.match_score,
      pendingCount,
      approvedCount,
      rejectedCount,
      manualReviewCount,
      ignoredCount,
    },
  });

  return {
    ok: true,
    batchId: candidateResult.data.batch_id,
    resolutionStatus: nextResolutionStatus,
  };
}
