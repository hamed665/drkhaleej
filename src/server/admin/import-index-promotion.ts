"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportIndexPromotionQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportIndexPromotionQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportIndexPromotionQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportIndexPromotionQueryBuilder<T>;
  limit(count: number): ImportIndexPromotionQueryBuilder<T>;
  update(values: MutationPayload): ImportIndexPromotionQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportIndexPromotionClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportIndexPromotionQueryBuilder<T>;
};

type ImportBatchForIndexPromotion = {
  id: string;
  status: string;
  metadata: unknown;
};

type PublishQueueCandidate = {
  id: string;
  batch_id: string;
  raw_row_id: string;
  target_entity_type: string;
  target_entity_id: string | null;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number;
  metadata: unknown;
};

type ApprovedEntityCandidate = {
  id: string;
  raw_row_id: string;
  entity_type: string;
  candidate_status: string;
  quality_score: number;
  candidate_payload: unknown;
};

type JsonRecord = Record<string, unknown>;

type GateEvaluation = {
  eligible: boolean;
  reasons: string[];
};

export type PromoteNoindexImportQueueToIndexEligibleResult =
  | {
      ok: true;
      batchId: string;
      read: number;
      promotedRows: number;
      blockedRows: number;
      skippedRows: number;
    }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const promotionLimit = 500;
const minimumIndexEligibleQualityScore = 80;
const indexPromotionGateVersion = "v1";

function createImportIndexPromotionClient(): ImportIndexPromotionClient {
  return createSupabaseServiceRoleClient() as unknown as ImportIndexPromotionClient;
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

function readStringArray(value: JsonRecord, key: string): string[] {
  const result = value[key];
  if (!Array.isArray(result)) return [];
  return result.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function mergeMetadata(existing: unknown, patch: JsonRecord): JsonRecord {
  return {
    ...(isRecord(existing) ? existing : {}),
    ...patch,
  };
}

function hasPublicSafeContactOrDirections(candidatePayload: unknown): boolean {
  const contact = readRecord(candidatePayload, "contact");
  return Boolean(
    readString(contact, "phoneE164") ??
      readString(contact, "whatsappE164") ??
      readString(contact, "googleMapsUrl") ??
      readString(contact, "directionUrl"),
  );
}

function hasIdentity(candidatePayload: unknown): boolean {
  const identity = readRecord(candidatePayload, "identity");
  return Boolean(
    readString(identity, "primaryName") ?? readString(identity, "nameEn") ?? readString(identity, "nameAr"),
  );
}

function hasLocationSignal(candidatePayload: unknown): boolean {
  const geo = readRecord(candidatePayload, "geo");
  return Boolean(
    readString(geo, "area") ?? readString(geo, "wilayat") ?? readString(geo, "governorate"),
  );
}

function hasCareSignal(candidatePayload: unknown): boolean {
  const taxonomy = readRecord(candidatePayload, "taxonomy");
  return (
    readString(taxonomy, "primarySpecialty") !== null ||
    readString(taxonomy, "subspecialty") !== null ||
    readStringArray(taxonomy, "services").length > 0 ||
    readStringArray(taxonomy, "departments").length > 0
  );
}

function hasSourceAndFreshness(candidatePayload: unknown): boolean {
  const source = readRecord(candidatePayload, "source");
  const hasSource = Boolean(readString(source, "sourceName") ?? readString(source, "sourceUrl"));
  const hasLastChecked = Boolean(readString(source, "lastCheckedAt"));
  return hasSource && hasLastChecked;
}

function evaluateIndexEligibility(candidate: ApprovedEntityCandidate, queueRow: PublishQueueCandidate): GateEvaluation {
  const reasons: string[] = [];

  if (queueRow.publish_status !== "published_noindex") reasons.push("publish_status_not_published_noindex");
  if (queueRow.index_policy !== "noindex") reasons.push("index_policy_not_noindex");
  if (queueRow.sitemap_policy !== "excluded") reasons.push("sitemap_policy_not_excluded");
  if (candidate.candidate_status !== "approved") reasons.push("candidate_not_approved");
  if (candidate.quality_score < minimumIndexEligibleQualityScore || queueRow.quality_score < minimumIndexEligibleQualityScore) {
    reasons.push("quality_below_index_threshold");
  }
  if (!hasIdentity(candidate.candidate_payload)) reasons.push("missing_identity");
  if (!hasLocationSignal(candidate.candidate_payload)) reasons.push("missing_location_signal");
  if (!hasPublicSafeContactOrDirections(candidate.candidate_payload)) reasons.push("missing_contact_or_directions");
  if (!hasCareSignal(candidate.candidate_payload)) reasons.push("missing_specialty_service_or_department_signal");
  if (!hasSourceAndFreshness(candidate.candidate_payload)) reasons.push("missing_source_or_last_checked");

  return { eligible: reasons.length === 0, reasons };
}

export async function promoteNoindexImportQueueToIndexEligible(
  batchId: string,
): Promise<PromoteNoindexImportQueueToIndexEligibleResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportIndexPromotionClient();
  const batchResult = await supabase
    .from<ImportBatchForIndexPromotion>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [queueResult, candidatesResult] = await Promise.all([
    supabase
      .from<PublishQueueCandidate>("import_publish_queue")
      .select("id, batch_id, raw_row_id, target_entity_type, target_entity_id, publish_status, index_policy, sitemap_policy, quality_score, metadata")
      .eq("batch_id", batchId)
      .eq("publish_status", "published_noindex")
      .order("created_at", { ascending: true })
      .limit(promotionLimit),
    supabase
      .from<ApprovedEntityCandidate>("import_entity_candidates")
      .select("id, raw_row_id, entity_type, candidate_status, quality_score, candidate_payload")
      .eq("batch_id", batchId)
      .eq("candidate_status", "approved")
      .limit(promotionLimit),
  ]);

  if (queueResult.error !== null || queueResult.data === null || candidatesResult.error !== null || candidatesResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  if (queueResult.data.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const candidatesByRawRowId = new Map(candidatesResult.data.map((candidate) => [candidate.raw_row_id, candidate]));
  const promotedAt = new Date().toISOString();
  let promotedRows = 0;
  let blockedRows = 0;
  let skippedRows = 0;

  for (const queueRow of queueResult.data) {
    const candidate = candidatesByRawRowId.get(queueRow.raw_row_id);

    if (!candidate) {
      skippedRows += 1;
      const skippedUpdate = await supabase
        .from("import_publish_queue")
        .update({
          metadata: mergeMetadata(queueRow.metadata, {
            index_gate_version: indexPromotionGateVersion,
            index_gate_checked_at: promotedAt,
            index_gate_status: "skipped",
            index_gate_reasons: ["missing_approved_candidate"],
          }),
        })
        .eq("id", queueRow.id);

      if (skippedUpdate.error !== null) {
        return { ok: false, reason: "unavailable" };
      }

      continue;
    }

    const gate = evaluateIndexEligibility(candidate, queueRow);

    if (!gate.eligible) {
      blockedRows += 1;
      const blockedUpdate = await supabase
        .from("import_publish_queue")
        .update({
          metadata: mergeMetadata(queueRow.metadata, {
            index_gate_version: indexPromotionGateVersion,
            index_gate_checked_at: promotedAt,
            index_gate_status: "blocked",
            index_gate_reasons: gate.reasons,
          }),
        })
        .eq("id", queueRow.id);

      if (blockedUpdate.error !== null) {
        return { ok: false, reason: "unavailable" };
      }

      continue;
    }

    const promotedUpdate = await supabase
      .from("import_publish_queue")
      .update({
        publish_status: "index_eligible",
        index_policy: "index_eligible",
        sitemap_policy: "eligible",
        metadata: mergeMetadata(queueRow.metadata, {
          index_gate_version: indexPromotionGateVersion,
          index_gate_checked_at: promotedAt,
          index_gate_status: "index_eligible",
          index_gate_reasons: [],
          minimum_quality_score: minimumIndexEligibleQualityScore,
        }),
      })
      .eq("id", queueRow.id);

    if (promotedUpdate.error !== null) {
      return { ok: false, reason: "unavailable" };
    }

    const rawRowUpdate = await supabase
      .from("import_raw_rows")
      .update({ row_status: "index_eligible" })
      .eq("id", queueRow.raw_row_id);

    if (rawRowUpdate.error !== null) {
      return { ok: false, reason: "unavailable" };
    }

    promotedRows += 1;
  }

  const oldBatchMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdate = await supabase
    .from("import_batches")
    .update({
      metadata: {
        ...oldBatchMetadata,
        index_promotion_gate_version: indexPromotionGateVersion,
        index_promotion_checked_at: promotedAt,
        index_promotion_read_rows: queueResult.data.length,
        index_promotion_promoted_rows: promotedRows,
        index_promotion_blocked_rows: blockedRows,
        index_promotion_skipped_rows: skippedRows,
        index_promotion_minimum_quality_score: minimumIndexEligibleQualityScore,
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
    summary: "Noindex import queue rows were evaluated for index eligibility.",
    oldValues: {
      batchStatus: batchResult.data.status,
    },
    newValues: {
      promotedRows,
      blockedRows,
      skippedRows,
      sitemapPolicyForPromotedRows: "eligible",
    },
    metadata: {
      indexPromotionGateVersion,
      minimumQualityScore: minimumIndexEligibleQualityScore,
      sitemapIncluded: false,
    },
  });

  return {
    ok: true,
    batchId,
    read: queueResult.data.length,
    promotedRows,
    blockedRows,
    skippedRows,
  };
}
