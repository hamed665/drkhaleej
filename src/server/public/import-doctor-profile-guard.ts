import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type PublicImportProfile = {
  family: "doctors";
  canonicalPath: string;
  entityType: "doctor";
  name: string;
  nameAr: string | null;
  area: string | null;
  wilayat: string | null;
  governorate: string | null;
  primarySpecialty: string | null;
  services: string[];
  departments: string[];
  languages: string[];
  phoneE164: string | null;
  whatsappE164: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
  sourceName: string | null;
  lastCheckedAt: string | null;
  qualityScore: number;
};

export type GetPublicImportDoctorProfileResult =
  | { ok: true; profile: PublicImportProfile }
  | { ok: false; reason: "not_found" };

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };

type QueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): QueryBuilder<T>;
  eq(column: string, value: string | number | boolean): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ProfileClient = {
  from<T extends object = Record<string, unknown>>(table: string): QueryBuilder<T>;
};

type QueueRow = {
  target_entity_type: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number;
  metadata: unknown;
};

type CandidateRow = {
  entity_type: string;
  candidate_status: string;
  candidate_payload: unknown;
};

type JsonRecord = Record<string, unknown>;

const lookupLimit = 1000;

function client(): ProfileClient {
  return createSupabaseServiceRoleClient() as unknown as ProfileClient;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, key: string): JsonRecord {
  if (!isRecord(value)) return {};
  const next = value[key];
  return isRecord(next) ? next : {};
}

function stringValue(value: JsonRecord, key: string): string | null {
  const next = value[key];
  if (typeof next !== "string") return null;
  const trimmed = next.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function numberValue(value: JsonRecord, key: string): number | null {
  const next = value[key];
  return typeof next === "number" && Number.isFinite(next) ? next : null;
}

function stringArray(value: JsonRecord, key: string): string[] {
  const next = value[key];
  if (!Array.isArray(next)) return [];
  return next.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function safeSlug(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : null;
}

function canonicalPath(locale: string, country: string, slug: string): string | null {
  if (locale !== "en" && locale !== "ar") return null;
  if (country !== "om") return null;
  return `/${locale}/${country}/doctor/${slug}`;
}

function safeQueueRow(row: QueueRow, path: string): boolean {
  if (row.target_entity_type !== "doctor") return false;
  if (row.publish_status !== "index_eligible") return false;
  if (row.index_policy !== "index") return false;
  if (row.sitemap_policy !== "included") return false;
  if (!isRecord(row.metadata)) return false;
  if (row.metadata.sitemap_included !== true) return false;
  if (stringValue(row.metadata, "robots_policy") !== "index") return false;
  return stringValue(row.metadata, "canonical_path") === path;
}

function candidateId(metadata: unknown): string | null {
  return isRecord(metadata) ? stringValue(metadata, "import_entity_candidate_id") : null;
}

function buildProfile(path: string, queue: QueueRow, candidate: CandidateRow): PublicImportProfile | null {
  if (candidate.entity_type !== "doctor") return null;
  if (candidate.candidate_status !== "approved") return null;
  if (!isRecord(candidate.candidate_payload)) return null;

  const payload = candidate.candidate_payload;
  const identity = record(payload, "identity");
  const contact = record(payload, "contact");
  const geo = record(payload, "geo");
  const taxonomy = record(payload, "taxonomy");
  const source = record(payload, "source");
  const quality = record(payload, "quality");
  const name = stringValue(identity, "primaryName") ?? stringValue(identity, "nameEn");
  if (name === null) return null;

  return {
    family: "doctors",
    canonicalPath: path,
    entityType: "doctor",
    name,
    nameAr: stringValue(identity, "nameAr"),
    area: stringValue(geo, "area"),
    wilayat: stringValue(geo, "wilayat"),
    governorate: stringValue(geo, "governorate"),
    primarySpecialty: stringValue(taxonomy, "primarySpecialty"),
    services: stringArray(taxonomy, "services"),
    departments: stringArray(taxonomy, "departments"),
    languages: stringArray(payload, "languages"),
    phoneE164: stringValue(contact, "phoneE164"),
    whatsappE164: stringValue(contact, "whatsappE164"),
    websiteUrl: stringValue(contact, "websiteUrl"),
    googleMapsUrl: stringValue(contact, "googleMapsUrl"),
    directionUrl: stringValue(contact, "directionUrl"),
    sourceName: stringValue(source, "sourceName"),
    lastCheckedAt: stringValue(source, "lastCheckedAt"),
    qualityScore: Math.max(0, Math.min(100, numberValue(quality, "score") ?? queue.quality_score)),
  };
}

export async function getPublicImportDoctorProfile(input: {
  locale: string;
  country: string;
  doctorSlug: string;
}): Promise<GetPublicImportDoctorProfileResult> {
  try {
    const slug = safeSlug(input.doctorSlug);
    if (slug === null) return { ok: false, reason: "not_found" };

    const path = canonicalPath(input.locale, input.country, slug);
    if (path === null) return { ok: false, reason: "not_found" };

    const supabase = client();
    const queueResult = await supabase
      .from<QueueRow>("import_publish_queue")
      .select("target_entity_type, publish_status, index_policy, sitemap_policy, quality_score, metadata")
      .eq("target_entity_type", "doctor")
      .eq("sitemap_policy", "included")
      .eq("index_policy", "index")
      .eq("publish_status", "index_eligible")
      .order("updated_at", { ascending: false })
      .limit(lookupLimit);

    if (queueResult.error !== null || queueResult.data === null) return { ok: false, reason: "not_found" };

    const queue = queueResult.data.find((row) => safeQueueRow(row, path));
    if (!queue) return { ok: false, reason: "not_found" };

    const id = candidateId(queue.metadata);
    if (id === null) return { ok: false, reason: "not_found" };

    const candidateResult = await supabase
      .from<CandidateRow>("import_entity_candidates")
      .select("entity_type, candidate_status, candidate_payload")
      .eq("id", id)
      .eq("candidate_status", "approved")
      .maybeSingle();

    if (candidateResult.error !== null || candidateResult.data === null) return { ok: false, reason: "not_found" };

    const profile = buildProfile(path, queue, candidateResult.data);
    return profile === null ? { ok: false, reason: "not_found" } : { ok: true, profile };
  } catch {
    return { ok: false, reason: "not_found" };
  }
}
