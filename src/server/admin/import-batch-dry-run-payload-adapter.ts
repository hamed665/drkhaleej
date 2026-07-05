import {
  type ImportBatchDryRunHospitalRelationRow,
  type ImportBatchDryRunLocalSuggestionCandidateKeys,
  type ImportBatchDryRunLocalSuggestionFamily,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

export type ImportBatchDryRunTransformedCandidate = {
  candidateKey: string | null;
  entityType: string | null;
  candidateStatus?: string | null;
  candidatePayload: unknown;
};

export type ImportBatchDryRunPayloadExtraction = {
  candidateHospitalKeys: readonly string[];
  localSuggestionCandidateKeys: ImportBatchDryRunLocalSuggestionCandidateKeys;
  hospitalRelationRows: readonly ImportBatchDryRunHospitalRelationRow[];
  localSuggestionRows: readonly ImportBatchDryRunLocalSuggestionRow[];
};

type JsonRecord = Record<string, unknown>;

const supportedFamilies: readonly ImportBatchDryRunLocalSuggestionFamily[] = [
  "doctor",
  "pharmacy",
  "hospital",
  "radiology",
  "dentistry",
  "beauty",
];

const familyAliases: Record<string, ImportBatchDryRunLocalSuggestionFamily> = {
  doctor: "doctor",
  doctors: "doctor",
  physician: "doctor",
  physicians: "doctor",
  pharmacy: "pharmacy",
  pharmacies: "pharmacy",
  hospital: "hospital",
  hospitals: "hospital",
  radiology: "radiology",
  radiologies: "radiology",
  imaging: "radiology",
  diagnostic_imaging: "radiology",
  dentistry: "dentistry",
  dental: "dentistry",
  dentist: "dentistry",
  dentists: "dentistry",
  beauty: "beauty",
  beauty_center: "beauty",
  beauty_centers: "beauty",
  beauty_salon: "beauty",
  beauty_salons: "beauty",
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, key: string): JsonRecord {
  if (!isRecord(value)) return {};
  const next = value[key];
  return isRecord(next) ? next : {};
}

function recordArray(value: JsonRecord, key: string): JsonRecord[] {
  const next = value[key];
  if (!Array.isArray(next)) return [];
  return next.filter(isRecord);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stringValue(value: JsonRecord, ...keys: readonly string[]): string | null {
  for (const key of keys) {
    const next = cleanText(value[key]);
    if (next !== null) return next;
  }
  return null;
}

function booleanValue(value: JsonRecord, ...keys: readonly string[]): boolean | null {
  for (const key of keys) {
    const next = value[key];
    if (typeof next === "boolean") return next;
  }
  return null;
}

function normalizeFamily(value: string | null): ImportBatchDryRunLocalSuggestionFamily | null {
  if (value === null) return null;
  return familyAliases[value.trim().toLowerCase()] ?? null;
}

function dryRunFamilyValue(value: string | null): ImportBatchDryRunLocalSuggestionFamily {
  const normalized = normalizeFamily(value);
  return (normalized ?? value ?? "unsupported") as ImportBatchDryRunLocalSuggestionFamily;
}

function shouldIncludeCandidate(candidate: ImportBatchDryRunTransformedCandidate): boolean {
  const status = candidate.candidateStatus?.trim().toLowerCase();
  return status !== "rejected" && status !== "removed" && status !== "held";
}

function emptyCandidateKeys(): Record<ImportBatchDryRunLocalSuggestionFamily, string[]> {
  return {
    doctor: [],
    pharmacy: [],
    hospital: [],
    radiology: [],
    dentistry: [],
    beauty: [],
  };
}

function addCandidateKey(
  keys: Record<ImportBatchDryRunLocalSuggestionFamily, string[]>,
  family: ImportBatchDryRunLocalSuggestionFamily,
  candidateKey: string,
): void {
  if (!keys[family].includes(candidateKey)) keys[family].push(candidateKey);
}

function mergeCandidateKeys(
  candidates: readonly ImportBatchDryRunTransformedCandidate[],
  base: ImportBatchDryRunLocalSuggestionCandidateKeys = {},
): Record<ImportBatchDryRunLocalSuggestionFamily, string[]> {
  const keys = emptyCandidateKeys();

  for (const family of supportedFamilies) {
    for (const candidateKey of base[family] ?? []) {
      const cleaned = cleanText(candidateKey);
      if (cleaned !== null) addCandidateKey(keys, family, cleaned);
    }
  }

  for (const candidate of candidates) {
    if (!shouldIncludeCandidate(candidate)) continue;
    const family = normalizeFamily(candidate.entityType);
    const candidateKey = cleanText(candidate.candidateKey);
    if (family !== null && candidateKey !== null) addCandidateKey(keys, family, candidateKey);
  }

  return keys;
}

function sourceRecord(row: JsonRecord): JsonRecord {
  const source = record(row, "source");
  return Object.keys(source).length > 0 ? source : row;
}

function geoRecord(payload: JsonRecord): JsonRecord {
  return record(payload, "geo");
}

function rowSourceName(row: JsonRecord): string | null {
  return stringValue(sourceRecord(row), "sourceName", "source_name");
}

function rowSourceUrl(row: JsonRecord): string | null {
  return stringValue(sourceRecord(row), "sourceUrl", "source_url", "url");
}

function rowLastCheckedAt(row: JsonRecord): string | null {
  return stringValue(sourceRecord(row), "lastCheckedAt", "last_checked_at", "lastVerifiedDate", "last_verified_date");
}

function rowConfidence(row: JsonRecord): string | null {
  return stringValue(row, "confidence");
}

function rowStatus(row: JsonRecord): string | null {
  return stringValue(row, "relationStatus", "relationshipStatus", "status", "relation_status");
}

function rowRequiresReview(row: JsonRecord): boolean {
  return booleanValue(row, "requiresReview", "requires_review") ?? false;
}

function hospitalDoctorRows(payload: JsonRecord): JsonRecord[] {
  const relations = record(payload, "relations");
  return [...recordArray(relations, "doctors"), ...recordArray(payload, "doctors")];
}

function localSuggestionRows(payload: JsonRecord): JsonRecord[] {
  const relations = record(payload, "relations");
  return [
    ...recordArray(relations, "localSuggestions"),
    ...recordArray(relations, "local_suggestions"),
    ...recordArray(relations, "nearby"),
    ...recordArray(payload, "localSuggestions"),
    ...recordArray(payload, "local_suggestions"),
    ...recordArray(payload, "nearby"),
  ];
}

function toHospitalRelationRow(
  row: JsonRecord,
  fallbackHospitalKey: string,
): ImportBatchDryRunHospitalRelationRow {
  return {
    hospitalKey: stringValue(row, "hospitalKey", "hospital_key") ?? fallbackHospitalKey,
    doctorKey: stringValue(row, "doctorKey", "doctor_key", "targetKey", "target_key", "slug", "doctorSlug"),
    doctorName: stringValue(row, "doctorName", "doctor_name_en", "name", "fullName", "nameEn"),
    sourceUrl: rowSourceUrl(row),
    lastCheckedAt: rowLastCheckedAt(row),
    confidence: rowConfidence(row),
    branchVerified: booleanValue(row, "branchVerified", "branch_verified") ?? false,
    publicVisible: booleanValue(row, "publicVisible", "public_visible") ?? false,
    relationStatus: rowStatus(row),
    requiresReview: rowRequiresReview(row),
    notes: stringValue(row, "notes"),
  };
}

function localSourceFamily(row: JsonRecord, fallbackFamily: ImportBatchDryRunLocalSuggestionFamily): ImportBatchDryRunLocalSuggestionFamily {
  return normalizeFamily(stringValue(row, "sourceFamily", "source_family", "sourceEntityType", "source_entity_type")) ?? fallbackFamily;
}

function targetFamily(row: JsonRecord): ImportBatchDryRunLocalSuggestionFamily {
  const rawFamily = stringValue(row, "targetFamily", "target_family", "entityType", "entity_type", "family");
  return dryRunFamilyValue(rawFamily);
}

function toLocalSuggestionRow(
  row: JsonRecord,
  fallback: {
    sourceFamily: ImportBatchDryRunLocalSuggestionFamily;
    sourceKey: string;
    sourceArea: string | null;
    sourceGovernorate: string | null;
  },
): ImportBatchDryRunLocalSuggestionRow {
  return {
    sourceFamily: localSourceFamily(row, fallback.sourceFamily),
    sourceKey: stringValue(row, "sourceKey", "source_key") ?? fallback.sourceKey,
    sourceArea: stringValue(row, "sourceArea", "source_area") ?? fallback.sourceArea,
    sourceGovernorate: stringValue(row, "sourceGovernorate", "source_governorate") ?? fallback.sourceGovernorate,
    targetFamily: targetFamily(row),
    targetKey: stringValue(row, "targetKey", "target_key", "candidateKey", "candidate_key", "slug"),
    targetArea: stringValue(row, "targetArea", "target_area", "area"),
    targetGovernorate: stringValue(row, "targetGovernorate", "target_governorate", "governorate"),
    targetName: stringValue(row, "targetName", "target_name", "displayName", "display_name", "name", "nameEn"),
    sourceName: rowSourceName(row),
    sourceUrl: rowSourceUrl(row),
    lastCheckedAt: rowLastCheckedAt(row),
    confidence: rowConfidence(row),
    publicVisible: booleanValue(row, "publicVisible", "public_visible") ?? false,
    relationStatus: rowStatus(row),
    requiresReview: rowRequiresReview(row),
    notes: stringValue(row, "notes"),
  };
}

export function buildImportBatchDryRunPayloadExtraction(input: {
  candidates: readonly ImportBatchDryRunTransformedCandidate[];
  candidateKeys?: ImportBatchDryRunLocalSuggestionCandidateKeys;
}): ImportBatchDryRunPayloadExtraction {
  const localSuggestionCandidateKeys = mergeCandidateKeys(input.candidates, input.candidateKeys ?? {});
  const hospitalRelationRows: ImportBatchDryRunHospitalRelationRow[] = [];
  const localRows: ImportBatchDryRunLocalSuggestionRow[] = [];

  for (const candidate of input.candidates) {
    if (!shouldIncludeCandidate(candidate)) continue;
    if (!isRecord(candidate.candidatePayload)) continue;

    const family = normalizeFamily(candidate.entityType);
    const candidateKey = cleanText(candidate.candidateKey);
    if (family === null || candidateKey === null) continue;

    const payload = candidate.candidatePayload;
    const geo = geoRecord(payload);
    const sourceArea = stringValue(geo, "area");
    const sourceGovernorate = stringValue(geo, "governorate");

    if (family === "hospital") {
      for (const row of hospitalDoctorRows(payload)) {
        hospitalRelationRows.push(toHospitalRelationRow(row, candidateKey));
      }
    }

    for (const row of localSuggestionRows(payload)) {
      localRows.push(
        toLocalSuggestionRow(row, {
          sourceFamily: family,
          sourceKey: candidateKey,
          sourceArea,
          sourceGovernorate,
        }),
      );
    }
  }

  return {
    candidateHospitalKeys: localSuggestionCandidateKeys.hospital,
    localSuggestionCandidateKeys,
    hospitalRelationRows,
    localSuggestionRows: localRows,
  };
}
