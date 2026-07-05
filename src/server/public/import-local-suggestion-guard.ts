import "server-only";

export type PublicImportLocalSuggestionFamily = "doctor" | "pharmacy" | "hospital" | "radiology" | "dentistry" | "beauty";

export type PublicImportLocalSuggestion = {
  family: PublicImportLocalSuggestionFamily;
  name: string;
  nameAr: string | null;
  slug: string | null;
  area: string;
  governorate: string;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  confidence: "high" | "medium";
};

type JsonRecord = Record<string, unknown>;

const localSuggestionFamilyAliases: Record<string, PublicImportLocalSuggestionFamily> = {
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

function stringValue(value: JsonRecord, key: string): string | null {
  const next = value[key];
  if (typeof next !== "string") return null;
  const trimmed = next.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stringValueAny(value: JsonRecord, ...keys: readonly string[]): string | null {
  for (const key of keys) {
    const next = stringValue(value, key);
    if (next !== null) return next;
  }
  return null;
}

function booleanValue(value: JsonRecord, key: string): boolean | null {
  const next = value[key];
  return typeof next === "boolean" ? next : null;
}

function booleanValueAny(value: JsonRecord, ...keys: readonly string[]): boolean | null {
  for (const key of keys) {
    const next = booleanValue(value, key);
    if (next !== null) return next;
  }
  return null;
}

function safeSlug(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : null;
}

function cleanLocation(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function locationKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function sourceRecord(row: JsonRecord): JsonRecord {
  const source = record(row, "source");
  return Object.keys(source).length > 0 ? source : row;
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

function normalizeFamily(value: string | null): PublicImportLocalSuggestionFamily | null {
  if (value === null) return null;
  return localSuggestionFamilyAliases[value.trim().toLocaleLowerCase()] ?? null;
}

function localSuggestionFamily(row: JsonRecord): PublicImportLocalSuggestionFamily | null {
  return normalizeFamily(stringValueAny(row, "targetFamily", "target_family", "entityType", "entity_type", "family"));
}

function localSuggestionSlug(row: JsonRecord): string | null {
  const rawSlug = stringValueAny(row, "slug", "targetSlug", "target_slug", "candidateSlug", "candidate_slug");
  return rawSlug ? safeSlug(rawSlug) : null;
}

function hasSourceEvidence(sourceName: string | null, sourceUrl: string | null, lastCheckedAt: string | null): boolean {
  return (sourceName !== null || sourceUrl !== null) && lastCheckedAt !== null;
}

function approvedLocalSuggestion(input: {
  row: JsonRecord;
  sourceGeo: JsonRecord;
  sourceFamily: PublicImportLocalSuggestionFamily;
  sourceSlug: string | null;
}): PublicImportLocalSuggestion | null {
  const { row, sourceGeo, sourceFamily, sourceSlug } = input;
  const source = sourceRecord(row);
  const family = localSuggestionFamily(row);
  const name = stringValueAny(row, "targetName", "target_name", "displayName", "display_name", "name", "nameEn");
  const slug = localSuggestionSlug(row);
  const sourceArea = cleanLocation(stringValue(sourceGeo, "area"));
  const sourceGovernorate = cleanLocation(stringValue(sourceGeo, "governorate"));
  const targetArea = cleanLocation(stringValueAny(row, "targetArea", "target_area", "area"));
  const targetGovernorate = cleanLocation(stringValueAny(row, "targetGovernorate", "target_governorate", "governorate"));
  const sourceName = stringValueAny(source, "sourceName", "source_name");
  const sourceUrl = stringValueAny(source, "sourceUrl", "source_url", "url");
  const lastCheckedAt = stringValueAny(source, "lastCheckedAt", "last_checked_at", "lastVerifiedDate", "last_verified_date");
  const publicVisible = booleanValueAny(row, "publicVisible", "public_visible");
  const relationStatus = stringValueAny(row, "relationStatus", "relationshipStatus", "status", "relation_status");
  const confidence = stringValue(row, "confidence");

  if (family === null) return null;
  if (name === null) return null;
  if (sourceArea === null || sourceGovernorate === null || targetArea === null || targetGovernorate === null) return null;
  if (locationKey(sourceArea) !== locationKey(targetArea)) return null;
  if (locationKey(sourceGovernorate) !== locationKey(targetGovernorate)) return null;
  if (publicVisible !== true) return null;
  if (relationStatus !== null && relationStatus !== "active" && relationStatus !== "approved") return null;
  if (confidence !== "high" && confidence !== "medium") return null;
  if (!hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)) return null;
  if (family === sourceFamily && sourceSlug !== null && slug === sourceSlug) return null;

  return {
    family,
    name,
    nameAr: stringValueAny(row, "targetNameAr", "target_name_ar", "nameAr"),
    slug,
    area: targetArea,
    governorate: targetGovernorate,
    sourceName,
    sourceUrl,
    lastCheckedAt,
    confidence,
  };
}

export function buildPublicImportLocalSuggestions(input: {
  payload: unknown;
  sourceGeo: JsonRecord;
  sourceFamily: PublicImportLocalSuggestionFamily;
  sourceSlug: string | null;
  limit?: number;
}): PublicImportLocalSuggestion[] {
  if (!isRecord(input.payload)) return [];

  const seen = new Set<string>();
  const suggestions: PublicImportLocalSuggestion[] = [];
  const limit = input.limit ?? 12;

  for (const row of localSuggestionRows(input.payload)) {
    const suggestion = approvedLocalSuggestion({
      row,
      sourceGeo: input.sourceGeo,
      sourceFamily: input.sourceFamily,
      sourceSlug: input.sourceSlug,
    });
    if (suggestion === null) continue;

    const key = `${suggestion.family}:${suggestion.slug ?? suggestion.name.toLocaleLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(suggestion);
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}
