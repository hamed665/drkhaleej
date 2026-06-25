"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };
type MutationPayload = Record<string, unknown>;

type ImportRelationQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  insert(values: MutationPayload | MutationPayload[]): ImportRelationQueryBuilder<T>;
  select(columns: string): ImportRelationQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportRelationQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportRelationQueryBuilder<T>;
  limit(count: number): ImportRelationQueryBuilder<T>;
  update(values: MutationPayload): ImportRelationQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportRelationClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportRelationQueryBuilder<T>;
};

type ImportBatchForRelationGeneration = {
  id: string;
  status: string;
  metadata: unknown;
};

type ImportEntityCandidateForRelations = {
  id: string;
  batch_id: string;
  raw_row_id: string;
  entity_type: string;
  candidate_payload: unknown;
  candidate_status: string;
  quality_score: number;
};

type ExistingImportRelationCandidate = {
  metadata: unknown;
};

type SafeProjection = {
  projectionVersion: string;
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

type RelationDraft = {
  relationType: string;
  sourceEntityType: string;
  targetEntityType: string;
  targetKey: string;
  targetLabel: string;
  matchScore: number;
  matchReason: string;
  candidatePayload: MutationPayload;
};

export type GenerateImportRelationCandidatesResult =
  | {
      ok: true;
      batchId: string;
      entityCandidatesRead: number;
      relationCandidatesCreated: number;
      skippedExistingCandidates: number;
    }
  | { ok: false; reason: "not_found" | "unavailable" | "empty" };

const generationLimit = 500;
const existingLimit = 5000;
const maxListRelationsPerCandidate = 20;

function createImportRelationClient(): ImportRelationClient {
  return createSupabaseServiceRoleClient() as unknown as ImportRelationClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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

  const values = result
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return Array.from(new Set(values)).slice(0, maxListRelationsPerCandidate);
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\/]+/g, "-")
    .replace(/[^a-z0-9\-_؀-ۿ]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readProjection(value: unknown): SafeProjection | null {
  if (!isRecord(value)) return null;

  const identity = readRecord(value, "identity");
  const contact = readRecord(value, "contact");
  const geo = readRecord(value, "geo");
  const taxonomy = readRecord(value, "taxonomy");
  const source = readRecord(value, "source");
  const quality = readRecord(value, "quality");

  const entityType = readString(value, "entityType");
  const sourceRawRowId = readString(value, "sourceRawRowId");
  const sourceRowNumber = readNumber(value, "sourceRowNumber");

  if (entityType === null || sourceRawRowId === null || sourceRowNumber === null) return null;

  return {
    projectionVersion: readString(value, "projectionVersion") ?? "v1",
    sourceRawRowId,
    sourceRowNumber,
    entityType,
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
      countryCode: readString(geo, "countryCode") ?? "om",
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
    languages: readStringArray(value, "languages"),
    source: {
      sourceName: readString(source, "sourceName"),
      sourceUrl: readString(source, "sourceUrl"),
      lastCheckedAt: readString(source, "lastCheckedAt"),
    },
    quality: {
      score: clampScore(readNumber(quality, "score") ?? 0),
      flags: readStringArray(quality, "flags"),
    },
  };
}

function sourceEntityTypeFor(entityType: string): string {
  if (entityType === "doctor") return "doctor";
  if (entityType === "hospital") return "hospital";
  if (entityType === "pharmacy") return "pharmacy";
  if (entityType === "clinic") return "clinic";
  if (entityType === "laboratory") return "laboratory";
  if (entityType === "medical_center") return "medical_center";
  return "center";
}

function isFacilityType(entityType: string): boolean {
  return ["hospital", "pharmacy", "clinic", "laboratory", "medical_center"].includes(entityType);
}

function sourceLabel(projection: SafeProjection): string | null {
  return projection.identity.primaryName ?? projection.identity.nameEn ?? projection.identity.nameAr;
}

function sourceEvidence(projection: SafeProjection): MutationPayload {
  return {
    sourceName: projection.source.sourceName,
    sourceUrl: projection.source.sourceUrl,
    lastCheckedAt: projection.source.lastCheckedAt,
    projectionVersion: projection.projectionVersion,
  };
}

function relationScore(projection: SafeProjection, baseScore: number): number {
  let score = baseScore;
  if (projection.source.sourceUrl !== null || projection.source.sourceName !== null) score += 5;
  if (projection.source.lastCheckedAt !== null) score += 5;
  if (projection.geo.latitude !== null && projection.geo.longitude !== null) score += 3;
  if (projection.quality.score > 0) score = Math.round((score + projection.quality.score) / 2);
  return clampScore(score);
}

function geoTarget(projection: SafeProjection): { label: string; key: string } | null {
  const parts = [projection.geo.governorate, projection.geo.wilayat, projection.geo.area]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  if (parts.length === 0) return null;
  const label = parts.join(" / ");
  return { label, key: parts.map(normalizeKey).join("/") };
}

function pushRelation(relations: RelationDraft[], draft: RelationDraft): void {
  if (draft.targetKey.trim().length === 0 || draft.targetLabel.trim().length === 0) return;
  relations.push(draft);
}

function buildRelationDrafts(candidate: ImportEntityCandidateForRelations, projection: SafeProjection, generatedAt: string): RelationDraft[] {
  const relations: RelationDraft[] = [];
  const entityType = projection.entityType;
  const sourceType = sourceEntityTypeFor(entityType);
  const label = sourceLabel(projection);
  const evidence = sourceEvidence(projection);
  const sourceSummary = {
    entityCandidateId: candidate.id,
    rawRowId: candidate.raw_row_id,
    entityType,
    label,
    externalId: projection.identity.externalId,
  };

  const geo = geoTarget(projection);
  if (geo !== null) {
    const relationType = isFacilityType(entityType) ? "facility_located_in_area" : "area_contains_provider";
    pushRelation(relations, {
      relationType,
      sourceEntityType: sourceType,
      targetEntityType: "geo_area",
      targetKey: geo.key,
      targetLabel: geo.label,
      matchScore: relationScore(projection, 72),
      matchReason: `Geo relation inferred from public-safe projection for ${label ?? entityType}.`,
      candidatePayload: {
        generatorVersion: "v1",
        generatedAt,
        source: sourceSummary,
        target: { type: "geo_area", label: geo.label, key: geo.key, geo: projection.geo },
        evidence,
      },
    });
  }

  const specialtyTargets = [projection.taxonomy.primarySpecialty, projection.taxonomy.subspecialty]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  for (const specialty of Array.from(new Set(specialtyTargets)).slice(0, maxListRelationsPerCandidate)) {
    const relationType = entityType === "doctor" ? "doctor_has_specialty" : "facility_offers_specialty";
    pushRelation(relations, {
      relationType,
      sourceEntityType: sourceType,
      targetEntityType: "specialty",
      targetKey: normalizeKey(specialty),
      targetLabel: specialty,
      matchScore: relationScore(projection, 76),
      matchReason: `Specialty relation inferred from public-safe projection for ${label ?? entityType}.`,
      candidatePayload: {
        generatorVersion: "v1",
        generatedAt,
        source: sourceSummary,
        target: { type: "specialty", label: specialty, key: normalizeKey(specialty) },
        evidence,
      },
    });

    if (geo !== null) {
      pushRelation(relations, {
        relationType: "specialty_available_in_area",
        sourceEntityType: "specialty",
        targetEntityType: "geo_area",
        targetKey: `${normalizeKey(specialty)}:${geo.key}`,
        targetLabel: `${specialty} in ${geo.label}`,
        matchScore: relationScore(projection, 66),
        matchReason: "Specialty-area relation inferred from a reviewed provider projection with geo coverage.",
        candidatePayload: {
          generatorVersion: "v1",
          generatedAt,
          source: { type: "specialty", label: specialty, key: normalizeKey(specialty), providerCandidate: sourceSummary },
          target: { type: "geo_area", label: geo.label, key: geo.key, geo: projection.geo },
          evidence,
        },
      });
    }
  }

  const serviceRelationType = entityType === "doctor" ? "doctor_offers_service" : "facility_offers_service";
  for (const service of projection.taxonomy.services.slice(0, maxListRelationsPerCandidate)) {
    pushRelation(relations, {
      relationType: serviceRelationType,
      sourceEntityType: sourceType,
      targetEntityType: "service",
      targetKey: normalizeKey(service),
      targetLabel: service,
      matchScore: relationScore(projection, 70),
      matchReason: `Service relation inferred from public-safe projection for ${label ?? entityType}.`,
      candidatePayload: {
        generatorVersion: "v1",
        generatedAt,
        source: sourceSummary,
        target: { type: "service", label: service, key: normalizeKey(service) },
        evidence,
      },
    });

    if (geo !== null) {
      pushRelation(relations, {
        relationType: "service_available_in_area",
        sourceEntityType: "service",
        targetEntityType: "geo_area",
        targetKey: `${normalizeKey(service)}:${geo.key}`,
        targetLabel: `${service} in ${geo.label}`,
        matchScore: relationScore(projection, 64),
        matchReason: "Service-area relation inferred from a reviewed provider projection with geo coverage.",
        candidatePayload: {
          generatorVersion: "v1",
          generatedAt,
          source: { type: "service", label: service, key: normalizeKey(service), providerCandidate: sourceSummary },
          target: { type: "geo_area", label: geo.label, key: geo.key, geo: projection.geo },
          evidence,
        },
      });
    }
  }

  const departmentRelationType = entityType === "doctor" ? "doctor_member_of_department" : "facility_has_department";
  for (const department of projection.taxonomy.departments.slice(0, maxListRelationsPerCandidate)) {
    pushRelation(relations, {
      relationType: departmentRelationType,
      sourceEntityType: sourceType,
      targetEntityType: "facility_department",
      targetKey: normalizeKey(department),
      targetLabel: department,
      matchScore: relationScore(projection, 68),
      matchReason: `Department relation inferred from public-safe projection for ${label ?? entityType}.`,
      candidatePayload: {
        generatorVersion: "v1",
        generatedAt,
        source: sourceSummary,
        target: { type: "facility_department", label: department, key: normalizeKey(department) },
        evidence,
      },
    });
  }

  return relations;
}

function relationDedupeKey(candidateId: string, draft: RelationDraft): string {
  return [candidateId, draft.relationType, draft.sourceEntityType, draft.targetEntityType, draft.targetKey].join("|");
}

function existingDedupeKeys(rows: ExistingImportRelationCandidate[]): Set<string> {
  const keys = new Set<string>();
  for (const row of rows) {
    if (!isRecord(row.metadata)) continue;
    const key = row.metadata.dedupeKey;
    if (typeof key === "string" && key.length > 0) keys.add(key);
  }
  return keys;
}

function buildInsertPayload(
  batchId: string,
  candidate: ImportEntityCandidateForRelations,
  draft: RelationDraft,
  dedupeKey: string,
): MutationPayload {
  return {
    batch_id: batchId,
    raw_row_id: candidate.raw_row_id,
    source_entity_candidate_id: candidate.id,
    relation_type: draft.relationType,
    source_entity_type: draft.sourceEntityType,
    source_entity_id: null,
    target_entity_type: draft.targetEntityType,
    target_entity_id: null,
    candidate_payload: draft.candidatePayload,
    match_score: draft.matchScore,
    match_reason: draft.matchReason,
    resolution_status: "pending",
    metadata: {
      generator_version: "v1",
      dedupeKey,
      source_entity_candidate_id: candidate.id,
      generated_from: "import_entity_candidates",
    },
  };
}

export async function generateAdminImportRelationCandidates(batchId: string): Promise<GenerateImportRelationCandidatesResult> {
  const admin = await requireAdminPermission("imports.review");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportRelationClient();
  const batchResult = await supabase
    .from<ImportBatchForRelationGeneration>("import_batches")
    .select("id, status, metadata")
    .eq("id", batchId)
    .maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [entityCandidatesResult, existingRelationsResult] = await Promise.all([
    supabase
      .from<ImportEntityCandidateForRelations>("import_entity_candidates")
      .select("id, batch_id, raw_row_id, entity_type, candidate_payload, candidate_status, quality_score")
      .eq("batch_id", batchId)
      .eq("candidate_status", "approved")
      .order("created_at", { ascending: true })
      .limit(generationLimit),
    supabase
      .from<ExistingImportRelationCandidate>("import_relation_candidates")
      .select("metadata")
      .eq("batch_id", batchId)
      .limit(existingLimit),
  ]);

  if (
    entityCandidatesResult.error !== null ||
    entityCandidatesResult.data === null ||
    existingRelationsResult.error !== null ||
    existingRelationsResult.data === null
  ) {
    return { ok: false, reason: "unavailable" };
  }

  if (entityCandidatesResult.data.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const generatedAt = new Date().toISOString();
  const existingKeys = existingDedupeKeys(existingRelationsResult.data);
  const candidateRows: MutationPayload[] = [];
  let possibleRelations = 0;
  let skippedExistingCandidates = 0;

  for (const candidate of entityCandidatesResult.data) {
    const projection = readProjection(candidate.candidate_payload);
    if (projection === null) continue;

    const drafts = buildRelationDrafts(candidate, projection, generatedAt);
    possibleRelations += drafts.length;

    for (const draft of drafts) {
      const dedupeKey = relationDedupeKey(candidate.id, draft);
      if (existingKeys.has(dedupeKey)) {
        skippedExistingCandidates += 1;
        continue;
      }
      existingKeys.add(dedupeKey);
      candidateRows.push(buildInsertPayload(batchId, candidate, draft, dedupeKey));
    }
  }

  if (possibleRelations === 0) {
    return { ok: false, reason: "empty" };
  }

  if (candidateRows.length > 0) {
    const insertResult = await supabase.from("import_relation_candidates").insert(candidateRows);
    if (insertResult.error !== null) {
      return { ok: false, reason: "unavailable" };
    }
  }

  const oldMetadata = isRecord(batchResult.data.metadata) ? batchResult.data.metadata : {};
  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      status: batchResult.data.status === "ready_for_publish" ? "reviewing" : batchResult.data.status,
      metadata: {
        ...oldMetadata,
        relation_candidate_generation_version: "v1",
        relation_candidates_created: candidateRows.length,
        relation_candidates_skipped_existing: skippedExistingCandidates,
        relation_candidates_possible: possibleRelations,
        relation_candidates_generated_at: generatedAt,
        relation_entity_candidates_read: entityCandidatesResult.data.length,
        max_entity_candidates_per_run: generationLimit,
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
    targetTable: "import_relation_candidates",
    summary: "Import relation candidates generated from public-safe entity candidates.",
    metadata: {
      entityCandidatesRead: entityCandidatesResult.data.length,
      relationCandidatesCreated: candidateRows.length,
      skippedExistingCandidates,
      possibleRelations,
      previousBatchStatus: batchResult.data.status,
    },
  });

  return {
    ok: true,
    batchId,
    entityCandidatesRead: entityCandidatesResult.data.length,
    relationCandidatesCreated: candidateRows.length,
    skippedExistingCandidates,
  };
}
