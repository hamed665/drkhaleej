import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };

type RelationCandidateListQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): RelationCandidateListQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): RelationCandidateListQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): RelationCandidateListQueryBuilder<T>;
  limit(count: number): RelationCandidateListQueryBuilder<T>;
};

type RelationCandidateListClient = {
  from<T extends object = Record<string, unknown>>(table: "import_relation_candidates"): RelationCandidateListQueryBuilder<T>;
};

export type AdminImportRelationCandidateListItem = {
  id: string;
  raw_row_id: string;
  relation_type: string;
  source_entity_type: string;
  target_entity_type: string;
  target_entity_id: string | null;
  match_score: number;
  match_reason: string;
  resolution_status: string;
  created_at: string;
};

export type AdminImportRelationCandidateListResult =
  | { ok: true; items: AdminImportRelationCandidateListItem[] }
  | { ok: false; reason: "not_found" | "unavailable" };

const relationCandidateListLimit = 100;
const relationCandidatePreviewColumns =
  "id, raw_row_id, relation_type, source_entity_type, target_entity_type, target_entity_id, match_score, match_reason, resolution_status, created_at";

function createRelationCandidateListClient(): RelationCandidateListClient {
  return createSupabaseServiceRoleClient() as unknown as RelationCandidateListClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function listAdminImportRelationCandidates(
  batchId: string,
): Promise<AdminImportRelationCandidateListResult> {
  await requireAdminPermission("imports.read");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createRelationCandidateListClient();
  const { data, error } = await supabase
    .from<AdminImportRelationCandidateListItem>("import_relation_candidates")
    .select(relationCandidatePreviewColumns)
    .eq("batch_id", batchId)
    .order("created_at", { ascending: false })
    .limit(relationCandidateListLimit);

  if (error !== null || data === null) {
    return { ok: false, reason: "unavailable" };
  }

  return { ok: true, items: data };
}
