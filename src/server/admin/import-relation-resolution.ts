import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

type RelationResolutionStatus = "approved" | "rejected" | "needs_manual_review" | "ignored";
type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type RelationResolutionQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): RelationResolutionQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): RelationResolutionQueryBuilder<T>;
  update(values: MutationPayload): RelationResolutionQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type RelationResolutionClient = {
  from<T extends object = Record<string, unknown>>(table: string): RelationResolutionQueryBuilder<T>;
};

type RelationCandidateForResolution = {
  id: string;
  batch_id: string;
  resolution_status: string;
  metadata: unknown;
};

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

export async function resolveAdminImportRelationCandidate(relationCandidateId: string, resolutionStatus: string) {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(relationCandidateId) || !isRelationResolutionStatus(resolutionStatus)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const supabase = createRelationResolutionClient();
  const candidateResult = await supabase
    .from<RelationCandidateForResolution>("import_relation_candidates")
    .select("id, batch_id, resolution_status, metadata")
    .eq("id", relationCandidateId)
    .maybeSingle();

  if (candidateResult.error !== null) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  if (candidateResult.data === null) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const now = new Date().toISOString();
  const oldMetadata = isRecord(candidateResult.data.metadata) ? candidateResult.data.metadata : {};
  const updateResult = await supabase
    .from("import_relation_candidates")
    .update({
      resolution_status: resolutionStatus,
      resolved_by_profile_id: admin.profile.id,
      resolved_at: now,
      metadata: {
        ...oldMetadata,
        admin_relation_resolution_version: "v1",
        previous_resolution_status: candidateResult.data.resolution_status,
        resolved_status: resolutionStatus,
        resolved_at: now,
      },
    })
    .eq("id", relationCandidateId);

  if (updateResult.error !== null) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      metadata: {
        relation_resolution_version: "v1",
        last_relation_resolution_status: resolutionStatus,
        last_relation_candidate_id: relationCandidateId,
        last_relation_resolved_at: now,
      },
    })
    .eq("id", candidateResult.data.batch_id);

  if (batchUpdateResult.error !== null) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  return {
    ok: true as const,
    batchId: candidateResult.data.batch_id,
    resolutionStatus,
  };
}
