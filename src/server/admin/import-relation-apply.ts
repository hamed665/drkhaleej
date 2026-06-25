import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission, type CurrentAdminContext } from "@/server/admin/permissions";

type JsonRecord = Record<string, unknown>;
type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportRelationApplyQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportRelationApplyQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportRelationApplyQueryBuilder<T>;
  is(column: string, value: null): ImportRelationApplyQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportRelationApplyQueryBuilder<T>;
  limit(count: number): ImportRelationApplyQueryBuilder<T>;
  insert(values: MutationPayload): ImportRelationApplyQueryBuilder<T>;
  update(values: MutationPayload): ImportRelationApplyQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
  single(): Promise<SingleQueryResult<T>>;
};

type ImportRelationApplyClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportRelationApplyQueryBuilder<T>;
};

type ApprovedRelationCandidate = {
  id: string;
  batch_id: string;
  relation_type: string;
  source_entity_type: string;
  source_entity_id: string | null;
  target_entity_type: string;
  target_entity_id: string | null;
  metadata: unknown;
};

type CenterLocationLookup = {
  id: string;
  center_id: string;
};

type InsertedRelation = {
  id: string;
};

type AppliedRelationAuditItem = {
  candidateId: string;
  targetTable: "doctor_practice_locations" | "doctor_department_assignments";
  targetId: string;
};

export type ApplyApprovedImportRelationCandidatesResult =
  | { ok: true; batchId: string; read: number; applied: number; skipped: number; unsupported: number; auditWritten: boolean }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const applyLimit = 100;
const appliedRelationVersion = "v1";

function createImportRelationApplyClient(): ImportRelationApplyClient {
  return createSupabaseServiceRoleClient() as unknown as ImportRelationApplyClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasAppliedVersion(metadata: unknown): boolean {
  return isRecord(metadata) && metadata.applied_relation_version === appliedRelationVersion;
}

function relationMetadata(candidate: ApprovedRelationCandidate, appliedAt: string): JsonRecord {
  return {
    applied_from_import_relation_candidate_id: candidate.id,
    applied_relation_version: appliedRelationVersion,
    applied_at: appliedAt,
    source_entity_type: candidate.source_entity_type,
    target_entity_type: candidate.target_entity_type,
  };
}

function mergedMetadata(candidate: ApprovedRelationCandidate, patch: JsonRecord): JsonRecord {
  return {
    ...(isRecord(candidate.metadata) ? candidate.metadata : {}),
    ...patch,
  };
}

function practiceTypeForTarget(targetEntityType: string): "hospital_staff" | "clinic_staff" | "unknown" {
  if (targetEntityType === "hospital") {
    return "hospital_staff";
  }

  if (targetEntityType === "clinic" || targetEntityType === "medical_center") {
    return "clinic_staff";
  }

  return "unknown";
}

async function markCandidateSkipped(
  supabase: ImportRelationApplyClient,
  candidate: ApprovedRelationCandidate,
  skippedAt: string,
  reason: string,
): Promise<boolean> {
  const updateResult = await supabase
    .from("import_relation_candidates")
    .update({
      metadata: mergedMetadata(candidate, {
        last_apply_attempt_at: skippedAt,
        last_apply_skip_reason: reason,
      }),
    })
    .eq("id", candidate.id);

  return updateResult.error === null;
}

async function markCandidateApplied(
  supabase: ImportRelationApplyClient,
  candidate: ApprovedRelationCandidate,
  appliedAt: string,
  appliedByProfileId: string,
  appliedTargetTable: string,
  appliedTargetId: string,
): Promise<boolean> {
  const updateResult = await supabase
    .from("import_relation_candidates")
    .update({
      metadata: mergedMetadata(candidate, {
        applied_relation_version: appliedRelationVersion,
        applied_at: appliedAt,
        applied_by_profile_id: appliedByProfileId,
        applied_target_table: appliedTargetTable,
        applied_target_id: appliedTargetId,
      }),
    })
    .eq("id", candidate.id);

  return updateResult.error === null;
}

async function writeRelationApplyAuditEvent({
  supabase,
  admin,
  batchId,
  read,
  applied,
  skipped,
  unsupported,
  appliedItems,
}: {
  supabase: ImportRelationApplyClient;
  admin: CurrentAdminContext;
  batchId: string;
  read: number;
  applied: number;
  skipped: number;
  unsupported: number;
  appliedItems: AppliedRelationAuditItem[];
}): Promise<boolean> {
  const insertResult = await supabase
    .from("admin_audit_events")
    .insert({
      actor_profile_id: admin.profile.id,
      actor_auth_user_id: admin.profile.auth_user_id,
      actor_email: admin.profile.email,
      permission_key: "imports.review",
      action: "import_relation.apply_approved",
      entity_type: "import_batch",
      entity_id: batchId,
      target_table: "import_relation_candidates",
      summary: "Applied approved import relation candidates",
      old_values: {},
      new_values: {
        read,
        applied,
        skipped,
        unsupported,
      },
      metadata: {
        applied_relation_version: appliedRelationVersion,
        apply_limit: applyLimit,
        applied_items: appliedItems.slice(0, 100),
      },
      request_source: "admin",
    });

  return insertResult.error === null;
}

async function existingRelationId(
  supabase: ImportRelationApplyClient,
  table: "doctor_practice_locations" | "doctor_department_assignments",
  filters: Array<[string, string | null]>,
): Promise<string | null | undefined> {
  let query = supabase.from<{ id: string }>(table).select("id").limit(1);

  for (const [column, value] of filters) {
    query = value === null ? query.is(column, null) : query.eq(column, value);
  }

  const result = await query.maybeSingle();

  if (result.error !== null) {
    return undefined;
  }

  return result.data?.id ?? null;
}

async function applyPracticeLocation(
  supabase: ImportRelationApplyClient,
  candidate: ApprovedRelationCandidate,
  appliedAt: string,
): Promise<{ appliedId: string | null; skippedReason: string | null; unavailable?: boolean }> {
  if (candidate.source_entity_type !== "doctor" || candidate.source_entity_id === null || candidate.target_entity_id === null) {
    return { appliedId: null, skippedReason: "missing_required_id_or_source_type" };
  }

  let centerId = candidate.target_entity_id;
  let centerLocationId: string | null = null;
  let practiceType: "hospital_staff" | "clinic_staff" | "unknown" = practiceTypeForTarget(candidate.target_entity_type);

  if (candidate.relation_type === "doctor_practices_at_location") {
    if (candidate.target_entity_type !== "center_location") {
      return { appliedId: null, skippedReason: "unsupported_target_entity_type" };
    }

    const locationResult = await supabase
      .from<CenterLocationLookup>("center_locations")
      .select("id, center_id")
      .eq("id", candidate.target_entity_id)
      .maybeSingle();

    if (locationResult.error !== null) {
      return { appliedId: null, skippedReason: null, unavailable: true };
    }

    if (locationResult.data === null) {
      return { appliedId: null, skippedReason: "center_location_not_found" };
    }

    centerId = locationResult.data.center_id;
    centerLocationId = candidate.target_entity_id;
    practiceType = "unknown";
  } else if (
    candidate.relation_type !== "doctor_practices_at_facility" ||
    !["center", "hospital", "clinic", "medical_center"].includes(candidate.target_entity_type)
  ) {
    return { appliedId: null, skippedReason: "unsupported_relation_or_target_type" };
  }

  const existingFilters: Array<[string, string | null]> = [
    ["doctor_id", candidate.source_entity_id],
    ["center_id", centerId],
  ];

  if (candidate.relation_type === "doctor_practices_at_location") {
    existingFilters.push(["center_location_id", centerLocationId]);
  }

  const existingId = await existingRelationId(supabase, "doctor_practice_locations", existingFilters);

  if (existingId === undefined) {
    return { appliedId: null, skippedReason: null, unavailable: true };
  }

  if (existingId !== null) {
    return { appliedId: null, skippedReason: "relation_already_exists" };
  }

  const insertResult = await supabase
    .from<InsertedRelation>("doctor_practice_locations")
    .insert({
      doctor_id: candidate.source_entity_id,
      center_id: centerId,
      center_location_id: centerLocationId,
      practice_type: practiceType,
      relation_review_status: "pending_review",
      public_relation_visible: false,
      is_active: false,
      is_accepting_new_patients: false,
      metadata: relationMetadata(candidate, appliedAt),
    })
    .select("id")
    .single();

  if (insertResult.error !== null || insertResult.data === null) {
    return { appliedId: null, skippedReason: null, unavailable: true };
  }

  return { appliedId: insertResult.data.id, skippedReason: null };
}

async function applyDepartmentAssignment(
  supabase: ImportRelationApplyClient,
  candidate: ApprovedRelationCandidate,
  appliedAt: string,
): Promise<{ appliedId: string | null; skippedReason: string | null; unavailable?: boolean }> {
  if (
    candidate.source_entity_type !== "doctor" ||
    candidate.target_entity_type !== "facility_department" ||
    candidate.source_entity_id === null ||
    candidate.target_entity_id === null
  ) {
    return { appliedId: null, skippedReason: "missing_required_id_or_entity_type" };
  }

  const existingId = await existingRelationId(supabase, "doctor_department_assignments", [
    ["doctor_id", candidate.source_entity_id],
    ["facility_department_id", candidate.target_entity_id],
  ]);

  if (existingId === undefined) {
    return { appliedId: null, skippedReason: null, unavailable: true };
  }

  if (existingId !== null) {
    return { appliedId: null, skippedReason: "relation_already_exists" };
  }

  const insertResult = await supabase
    .from<InsertedRelation>("doctor_department_assignments")
    .insert({
      doctor_id: candidate.source_entity_id,
      facility_department_id: candidate.target_entity_id,
      assignment_role: "unknown",
      assignment_review_status: "pending_review",
      public_assignment_visible: false,
      is_active: false,
      metadata: relationMetadata(candidate, appliedAt),
    })
    .select("id")
    .single();

  if (insertResult.error !== null || insertResult.data === null) {
    return { appliedId: null, skippedReason: null, unavailable: true };
  }

  return { appliedId: insertResult.data.id, skippedReason: null };
}

export async function applyApprovedImportRelationCandidates(
  batchId: string,
): Promise<ApplyApprovedImportRelationCandidatesResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportRelationApplyClient();
  const batchResult = await supabase.from<{ id: string }>("import_batches").select("id").eq("id", batchId).maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const candidatesResult = await supabase
    .from<ApprovedRelationCandidate>("import_relation_candidates")
    .select("id, batch_id, relation_type, source_entity_type, source_entity_id, target_entity_type, target_entity_id, metadata")
    .eq("batch_id", batchId)
    .eq("resolution_status", "approved")
    .order("created_at", { ascending: true })
    .limit(applyLimit);

  if (candidatesResult.error !== null || candidatesResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const candidates = candidatesResult.data.filter(
    (candidate) => candidate.source_entity_id !== null && candidate.target_entity_id !== null,
  );

  if (candidates.length === 0) {
    return { ok: false, reason: "empty" };
  }

  let applied = 0;
  let skipped = 0;
  let unsupported = 0;
  const appliedItems: AppliedRelationAuditItem[] = [];

  for (const candidate of candidates) {
    const now = new Date().toISOString();

    if (hasAppliedVersion(candidate.metadata)) {
      skipped += 1;
      continue;
    }

    let appliedTargetTable: "doctor_practice_locations" | "doctor_department_assignments" | null = null;
    let applyResult: { appliedId: string | null; skippedReason: string | null; unavailable?: boolean };

    if (candidate.relation_type === "doctor_practices_at_facility" || candidate.relation_type === "doctor_practices_at_location") {
      appliedTargetTable = "doctor_practice_locations";
      applyResult = await applyPracticeLocation(supabase, candidate, now);
    } else if (candidate.relation_type === "doctor_member_of_department") {
      appliedTargetTable = "doctor_department_assignments";
      applyResult = await applyDepartmentAssignment(supabase, candidate, now);
    } else {
      unsupported += 1;
      const marked = await markCandidateSkipped(supabase, candidate, now, "unsupported_relation_type");
      if (!marked) {
        return { ok: false, reason: "unavailable" };
      }
      continue;
    }

    if (applyResult.unavailable === true) {
      return { ok: false, reason: "unavailable" };
    }

    if (applyResult.appliedId === null) {
      skipped += 1;
      const marked = await markCandidateSkipped(supabase, candidate, now, applyResult.skippedReason ?? "not_applied");
      if (!marked) {
        return { ok: false, reason: "unavailable" };
      }
      continue;
    }

    const marked = await markCandidateApplied(
      supabase,
      candidate,
      now,
      admin.profile.id,
      appliedTargetTable,
      applyResult.appliedId,
    );

    if (!marked) {
      return { ok: false, reason: "unavailable" };
    }

    appliedItems.push({
      candidateId: candidate.id,
      targetTable: appliedTargetTable,
      targetId: applyResult.appliedId,
    });
    applied += 1;
  }

  const auditWritten = await writeRelationApplyAuditEvent({
    supabase,
    admin,
    batchId,
    read: candidates.length,
    applied,
    skipped,
    unsupported,
    appliedItems,
  });

  return {
    ok: true,
    batchId,
    read: candidates.length,
    applied,
    skipped,
    unsupported,
    auditWritten,
  };
}
