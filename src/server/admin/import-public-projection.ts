"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportProjectionQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  insert(values: MutationPayload | MutationPayload[]): ImportProjectionQueryBuilder<T>;
  select(columns: string): ImportProjectionQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportProjectionQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportProjectionQueryBuilder<T>;
  limit(count: number): ImportProjectionQueryBuilder<T>;
  update(values: MutationPayload): ImportProjectionQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportProjectionClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportProjectionQueryBuilder<T>;
};

type ImportBatchForProjection = {
  id: string;
  status: string;
  metadata: unknown;
};

type ImportRowForProjection = {
  id: string;
  batch_id: string;
  row_number: number;
  entity_type: string;
  row_status: string;
  validation_score: number;
  normalized_payload: unknown;
};

type ExistingEntityCandidate = {
  raw_row_id: string;
};

type PublicSafeProjectionPayload = {
  projectionVersion: "v1";
  projectedAt: string;
  sourceRawRowId: string;
  sourceRowNumber: number;
  entityType: string;
  identity: {
    externalId: string | null;
    primaryName: string | null;
    nameEn: string | null;
    nameAr: string | null;
    slugCandidate: string | null;
  };
  contact: {
    phoneE164: string | null;
    whatsappE164: string | null;
    websiteUrl: string | null;
    googleMapsUrl: string | null;
    directionUrl: string | null;
  };
  geo: {
    countryCode: string;
    governorate: string | null;
    wilayat: string | null;
    area: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  taxonomy: {
    primarySpecialty: string | null;
    subspecialty: string | null;
    services: string[];
    departments: string[];
  };
  languages: string[];
  source: {
    sourceName: string | null;
    sourceUrl: string | null;
    lastCheckedAt: string | null;
  };
  quality: {
    score: number;
    flags: string[];
  };
};

export type ProjectImportRowsResult =
  | { ok: true; batchId: string; projectedRows: number; skippedExistingRows: number }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const projectionLimit = 500;

function createImportProjectionClient(): ImportProjectionClient {
  return createSupabaseServiceRoleClient() as unknown as ImportProjectionClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown, key: string): Record<string, unknown> {
  if (!isRecord(value)) return {};
  const next = value[key];
  return isRecord(next) ? next : {};
}

function readString(value: Record<string, unknown>, key: string): string | null {
  const result = value[key];
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumber(value: Record<string, unknown>, key: string): number | null {
  const result = value[key];
  return typeof result === "number" && Number.isFinite(result) ? result : null;
}

function readStringArray(value: Record<string, unknown>, key: string): string[] {
  const result = value[key];
  if (!Array.isArray(result)) return [];
  return result.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function buildPublicSafeProjection(row: ImportRowForProjection, projectedAt: string): PublicSafeProjectionPayload | null {
  const payload = row.normalized_payload;
  if (!isRecord(payload)) return null;

  const identity = readRecord(payload, "identity");
  const contact = readRecord(payload, "contact");
  const geo = readRecord(payload, "geo");
  const taxonomy = readRecord(payload, "taxonomy");
  const source = readRecord(payload, "source");
  const quality = readRecord(payload, "quality");

  const countryCode = readString(geo, "countryCode") ?? "om";
  const qualityScore = readNumber(quality, "score") ?? row.validation_score;

  return {
    projectionVersion: "v1",
    projectedAt,
    sourceRawRowId: row.id,
    sourceRowNumber: row.row_number,
    entityType: row.entity_type,
    identity: {
      externalId: readString(identity, "externalId"),
      primaryName: readString(identity, "primaryName"),
      nameEn: readString(identity, "nameEn"),
      nameAr: readString(identity, "nameAr"),
      slugCandidate: readString(identity, "slugCandidate"),
    },
    contact: {
      phoneE164: readString(contact, "phoneE164"),
      whatsappE164: readString(contact, "whatsappE164"),
      websiteUrl: readString(contact, "websiteUrl"),
      googleMapsUrl: readString(contact, "googleMapsUrl"),
      directionUrl: readString(contact, "directionUrl"),
    },
    geo: {
      countryCode,
      governorate: readString(geo, "governorate"),
      wilayat: readString(geo, "wilayat"),
      area: readString(geo, "area"),
      latitude: readNumber(geo, "latitude"),
      longitude: readNumber(geo, "longitude"),
    },
    taxonomy: {
      primarySpecialty: readString(taxonomy, "primarySpecialty"),
      subspecialty: readString(taxonomy, "subspecialty"),
      services: readStringArray(taxonomy, "services"),
      departments: readStringArray(taxonomy, "departments"),
    },
    languages: readStringArray(payload, "languages"),
    source: {
      sourceName: readString(source, "sourceName"),
      sourceUrl: readString(source, "sourceUrl"),
      lastCheckedAt: readString(source, "lastCheckedAt"),
    },
    quality: {
      score: Math.max(0, Math.min(100, qualityScore)),
      flags: readStringArray(quality, "flags"),
    },
  };
}

function candidateQualityScore(projection: PublicSafeProjectionPayload): number {
  return Math.max(0, Math.min(100, projection.quality.score));
}

export async function projectAdminImportBatchRows(batchId: string): Promise<ProjectImportRowsResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportProjectionClient();
  const batchResult = await supabase
    .from<ImportBatchForProjection>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [rowsResult, existingResult] = await Promise.all([
    supabase
      .from<ImportRowForProjection>("import_raw_rows")
      .select("id, batch_id, row_number, entity_type, row_status, validation_score, normalized_payload")
      .eq("batch_id", batchId)
      .eq("row_status", "ready_for_publish")
      .order("row_number", { ascending: true })
      .limit(projectionLimit),
    supabase
      .from<ExistingEntityCandidate>("import_entity_candidates")
      .select("raw_row_id")
      .eq("batch_id", batchId)
      .limit(projectionLimit),
  ]);

  if (rowsResult.error !== null || rowsResult.data === null || existingResult.error !== null || existingResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  if (rowsResult.data.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const existingRawRowIds = new Set(existingResult.data.map((row) => row.raw_row_id));
  const projectedAt = new Date().toISOString();
  const candidateRows = rowsResult.data
    .filter((row) => !existingRawRowIds.has(row.id))
    .map((row) => {
      const projection = buildPublicSafeProjection(row, projectedAt);
      if (projection === null) return null;
      return {
        batch_id: batchId,
        raw_row_id: row.id,
        entity_type: row.entity_type,
        candidate_payload: projection,
        candidate_status: "approved",
        quality_score: candidateQualityScore(projection),
        review_note: "Projected from approved import row. Public publishing remains deferred.",
      };
    })
    .filter((row): row is MutationPayload => row !== null);

  if (candidateRows.length > 0) {
    const insertResult = await supabase.from("import_entity_candidates").insert(candidateRows);
    if (insertResult.error !== null) {
      return { ok: false, reason: "unavailable" };
    }
  }

  const skippedExistingRows = rowsResult.data.length - candidateRows.length;
  const oldMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      status: "ready_for_publish",
      metadata: {
        ...oldMetadata,
        public_safe_projection_version: "v1",
        projected_rows: candidateRows.length,
        skipped_existing_projection_rows: skippedExistingRows,
        projected_at: projectedAt,
        max_rows_per_run: projectionLimit,
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
    targetTable: "import_entity_candidates",
    summary: "Public-safe projection candidates created from approved import rows.",
    metadata: {
      projectedRows: candidateRows.length,
      skippedExistingRows,
      previousBatchStatus: batchResult.data.status,
    },
  });

  return {
    ok: true,
    batchId,
    projectedRows: candidateRows.length,
    skippedExistingRows,
  };
}
