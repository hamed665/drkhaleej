import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CenterType, CountryCode, PublicCenterSummary } from "./public-types";
import type { Json } from "@/lib/supabase/types";

type JsonRecord = Record<string, Json | undefined>;

type ImportPublishQueueRow = {
  id: string;
  metadata: Json;
  target_entity: string | null;
  publish_status: string | null;
  index_policy: string | null;
  sitemap_policy: string | null;
  updated_at: string | null;
};

type ImportEntityCandidateRow = {
  id: string;
  candidate_payload: Json;
  candidate_status: string | null;
  entity_type: string | null;
  quality_score: number | null;
};

const IMPORT_DISCOVERY_LIMIT = 50;
const IMPORT_HOSPITAL_CENTER_TYPE = "hospital" as CenterType;
const IMPORT_COUNTRY = "om" as CountryCode;

function jsonRecord(value: Json | undefined): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function stringValue(record: JsonRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function normalizedText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalSlug(path: string | null): string | null {
  if (!path) return null;
  const parts = path.split("/").filter(Boolean);
  const hospitalsIndex = parts.indexOf("hospitals");
  const slug = hospitalsIndex >= 0 ? parts[hospitalsIndex + 1] : parts.at(-1);
  return slug && /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

function importedCandidateId(row: ImportPublishQueueRow): string | null {
  return stringValue(jsonRecord(row.metadata), "import_entity_candidate_id", "candidate_id", "candidateId");
}

function isIncludedHospitalQueueRow(row: ImportPublishQueueRow): boolean {
  const metadata = jsonRecord(row.metadata);
  const canonicalPath = stringValue(metadata, "canonical_path", "canonicalPath");
  const sitemapStatus = stringValue(metadata, "sitemap_inclusion_status", "sitemapStatus");

  return (
    row.target_entity === "hospital" &&
    row.publish_status === "index_eligible" &&
    row.index_policy === "index" &&
    row.sitemap_policy === "included" &&
    (sitemapStatus === null || sitemapStatus === "included") &&
    canonicalSlug(canonicalPath) !== null
  );
}

function candidatePayloadSections(candidate: ImportEntityCandidateRow | null): {
  root: JsonRecord;
  profile: JsonRecord;
  identity: JsonRecord;
  geo: JsonRecord;
} {
  const root = jsonRecord(candidate?.candidate_payload);
  return {
    root,
    profile: jsonRecord(root.profile),
    identity: jsonRecord(root.identity),
    geo: jsonRecord(root.geo),
  };
}

function candidateName(candidate: ImportEntityCandidateRow | null): string | null {
  const { root, profile, identity } = candidatePayloadSections(candidate);
  return stringValue(profile, "name", "nameEn", "name_en") ?? stringValue(identity, "name", "nameEn", "name_en") ?? stringValue(root, "name", "nameEn", "name_en");
}

function candidateNameAr(candidate: ImportEntityCandidateRow | null): string | null {
  const { root, profile, identity } = candidatePayloadSections(candidate);
  return stringValue(profile, "nameAr", "name_ar") ?? stringValue(identity, "nameAr", "name_ar") ?? stringValue(root, "nameAr", "name_ar");
}

function candidateLocationParts(candidate: ImportEntityCandidateRow | null): string[] {
  const { root, profile, geo } = candidatePayloadSections(candidate);
  const area = stringValue(profile, "area") ?? stringValue(geo, "area") ?? stringValue(root, "area");
  const wilayat = stringValue(profile, "wilayat") ?? stringValue(geo, "wilayat") ?? stringValue(root, "wilayat");
  const governorate = stringValue(profile, "governorate") ?? stringValue(geo, "governorate") ?? stringValue(root, "governorate");
  return [area, wilayat, governorate].filter((value): value is string => value !== null);
}

function importedHospitalSummary(row: ImportPublishQueueRow, candidate: ImportEntityCandidateRow | null): PublicCenterSummary | null {
  const metadata = jsonRecord(row.metadata);
  const canonicalPath = stringValue(metadata, "canonical_path", "canonicalPath");
  const slug = canonicalSlug(canonicalPath);
  if (!slug) return null;

  const name = candidateName(candidate) ?? stringValue(metadata, "name", "name_en", "title");
  if (!name) return null;

  const nameAr = candidateNameAr(candidate);
  const location = candidateLocationParts(candidate).join(", ");
  const shortDescriptionEn = `${name} is listed as a public hospital profile${location ? ` in ${location}` : " in Oman"}.`;
  const shortDescriptionAr = nameAr ? `${nameAr} مدرج كملف مستشفى عام في عُمان.` : null;

  return {
    id: `import:${row.id}`,
    slug,
    nameEn: name,
    nameAr,
    centerType: IMPORT_HOSPITAL_CENTER_TYPE,
    descriptionEn: shortDescriptionEn,
    descriptionAr: shortDescriptionAr,
    shortDescriptionEn,
    shortDescriptionAr,
    defaultCountry: IMPORT_COUNTRY,
    publicProfilePath: `/hospitals/${slug}`,
  };
}

async function fetchImportedHospitalSummaries(limit: number): Promise<PublicCenterSummary[]> {
  const supabase = createSupabaseServerClient() as unknown as {
    from: (table: string) => any;
  };

  const { data: queueRows, error: queueError } = await supabase
    .from("import_publish_queue")
    .select("id,metadata,target_entity,publish_status,index_policy,sitemap_policy,updated_at")
    .eq("target_entity", "hospital")
    .eq("publish_status", "index_eligible")
    .eq("index_policy", "index")
    .eq("sitemap_policy", "included")
    .order("updated_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), IMPORT_DISCOVERY_LIMIT));

  if (queueError || !queueRows || queueRows.length === 0) return [];

  const safeRows = (queueRows as ImportPublishQueueRow[]).filter(isIncludedHospitalQueueRow);
  if (safeRows.length === 0) return [];

  const candidateIds = Array.from(new Set(safeRows.map(importedCandidateId).filter((id): id is string => id !== null)));
  const candidateById = new Map<string, ImportEntityCandidateRow>();

  if (candidateIds.length > 0) {
    const { data: candidateRows, error: candidateError } = await supabase
      .from("import_entity_candidates")
      .select("id,candidate_payload,candidate_status,entity_type,quality_score")
      .in("id", candidateIds)
      .limit(candidateIds.length);

    if (!candidateError) {
      for (const candidate of (candidateRows ?? []) as ImportEntityCandidateRow[]) {
        if (candidate.entity_type !== "hospital") continue;
        if (candidate.candidate_status !== null && candidate.candidate_status !== "approved") continue;
        candidateById.set(candidate.id, candidate);
      }
    }
  }

  return safeRows.flatMap((row) => {
    const candidateId = importedCandidateId(row);
    const candidate = candidateId ? candidateById.get(candidateId) ?? null : null;
    const summary = importedHospitalSummary(row, candidate);
    return summary ? [summary] : [];
  });
}

export async function listImportedPublicHospitalSummaries(limit = 24): Promise<PublicCenterSummary[]> {
  return fetchImportedHospitalSummaries(limit);
}

export async function searchImportedPublicHospitalSummaries(query: string, limit = 24): Promise<PublicCenterSummary[]> {
  const normalizedQuery = normalizedText(query);
  if (normalizedQuery.length < 2) return [];

  const summaries = await fetchImportedHospitalSummaries(IMPORT_DISCOVERY_LIMIT);
  return summaries
    .filter((summary) => {
      const haystack = normalizedText([
        summary.nameEn,
        summary.nameAr,
        summary.slug,
        summary.shortDescriptionEn,
        summary.shortDescriptionAr,
      ].filter(Boolean).join(" "));
      return haystack.includes(normalizedQuery);
    })
    .slice(0, Math.min(Math.max(limit, 1), IMPORT_DISCOVERY_LIMIT));
}
