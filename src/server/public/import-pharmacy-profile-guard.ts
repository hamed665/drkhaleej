import "server-only";

import { resolvePublicProviderCanonicalRoute } from "@/lib/catalog/public-provider-route-resolver";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PublicImportLocalSuggestion } from "./import-local-suggestion-guard";

export type PublicImportPharmacyProfile = {
  family: "pharmacies";
  canonicalPath: string;
  entityType: "pharmacy";
  name: string;
  nameAr: string | null;
  area: string | null;
  wilayat: string | null;
  governorate: string | null;
  services: string[];
  departments: string[];
  languages: string[];
  localSuggestions: PublicImportLocalSuggestion[];
  phoneE164: string | null;
  whatsappE164: string | null;
  email: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  qualityScore: number;
};

export type GetPublicImportPharmacyProfileResult =
  | { ok: true; profile: PublicImportPharmacyProfile }
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

export type PharmacyPublicNoindexQueueRow = {
  id: string;
  target_entity_type: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number;
  metadata: unknown;
};

export type PharmacyPublicNoindexAuthorizationRow = {
  candidate_id: string;
  status: string;
  published_queue_id: string | null;
  canonical_path_en: string;
  canonical_path_ar: string;
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
  const trimmed = value.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : null;
}

function bilingualPaths(path: string): { en: string; ar: string } | null {
  const match = path.match(/^\/(en|ar)\/om\/pharmacies\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (!match) return null;
  const slug = match[2];
  return {
    en: `/en/om/pharmacies/${slug}`,
    ar: `/ar/om/pharmacies/${slug}`,
  };
}

export function isPublicNoindexPharmacyQueueRow(
  row: PharmacyPublicNoindexQueueRow,
  path: string,
): boolean {
  if (row.target_entity_type !== "pharmacy") return false;
  if (row.publish_status !== "published_noindex") return false;
  if (row.index_policy !== "noindex") return false;
  if (row.sitemap_policy !== "excluded") return false;
  if (!isRecord(row.metadata)) return false;
  if (row.metadata.sitemap_included !== false) return false;
  if (row.metadata.index_promoted !== false) return false;
  if (row.metadata.public_route_enabled !== false) return false;
  if (
    stringValue(row.metadata, "public_noindex_schema_version") !==
    "drkhaleej.import.pharmacyPublicNoindex.v1"
  ) {
    return false;
  }
  if (stringValue(row.metadata, "robots_policy") !== "noindex") return false;
  const expectedPaths = bilingualPaths(path);
  if (expectedPaths === null) return false;
  const paths = record(row.metadata, "canonical_paths");
  return (
    stringValue(row.metadata, "canonical_path") === expectedPaths.en &&
    stringValue(paths, "en") === expectedPaths.en &&
    stringValue(paths, "ar") === expectedPaths.ar
  );
}

function candidateId(metadata: unknown): string | null {
  return isRecord(metadata) ? stringValue(metadata, "import_entity_candidate_id") : null;
}

function hasSourceEvidence(sourceName: string | null, sourceUrl: string | null, lastCheckedAt: string | null): boolean {
  return (sourceName !== null || sourceUrl !== null) && lastCheckedAt !== null;
}

function hasContactOrMap(input: {
  phoneE164: string | null;
  whatsappE164: string | null;
  email: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
}): boolean {
  return Object.values(input).some((value) => value !== null);
}

function hasLocalGeo(geo: JsonRecord): boolean {
  return (
    stringValue(geo, "area") !== null ||
    stringValue(geo, "wilayat") !== null ||
    stringValue(geo, "governorate") !== null ||
    numberValue(geo, "latitude") !== null ||
    numberValue(geo, "longitude") !== null
  );
}

export function isPublicNoindexPharmacyAuthorization(
  authorization: PharmacyPublicNoindexAuthorizationRow,
  queue: PharmacyPublicNoindexQueueRow,
  candidateIdValue: string,
  path: string,
): boolean {
  const expectedPaths = bilingualPaths(path);
  if (expectedPaths === null) return false;
  if (authorization.status !== "published") return false;
  if (authorization.published_queue_id !== queue.id) return false;
  if (authorization.candidate_id !== candidateIdValue) return false;
  return (
    authorization.canonical_path_en === expectedPaths.en &&
    authorization.canonical_path_ar === expectedPaths.ar
  );
}

function buildProfile(
  path: string,
  queue: PharmacyPublicNoindexQueueRow,
  candidate: CandidateRow,
): PublicImportPharmacyProfile | null {
  if (candidate.entity_type !== "pharmacy") return null;
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
  const phoneE164 = stringValue(contact, "phoneE164");
  const whatsappE164 = stringValue(contact, "whatsappE164");
  const email = stringValue(contact, "email");
  const websiteUrl = stringValue(contact, "websiteUrl");
  const googleMapsUrl = stringValue(contact, "googleMapsUrl");
  const directionUrl = stringValue(contact, "directionUrl");
  const sourceName = stringValue(source, "sourceName");
  const sourceUrl = stringValue(source, "sourceUrl");
  const lastCheckedAt = stringValue(source, "lastCheckedAt");

  if (name === null) return null;
  if (!hasLocalGeo(geo)) return null;
  if (!hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)) return null;
  if (!hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })) return null;

  return {
    family: "pharmacies",
    canonicalPath: path,
    entityType: "pharmacy",
    name,
    nameAr: stringValue(identity, "nameAr"),
    area: stringValue(geo, "area"),
    wilayat: stringValue(geo, "wilayat"),
    governorate: stringValue(geo, "governorate"),
    services: stringArray(taxonomy, "services"),
    departments: stringArray(taxonomy, "departments"),
    languages: stringArray(payload, "languages"),
    localSuggestions: [],
    phoneE164,
    whatsappE164,
    email,
    websiteUrl,
    googleMapsUrl,
    directionUrl,
    sourceName,
    sourceUrl,
    lastCheckedAt,
    qualityScore: Math.max(0, Math.min(100, numberValue(quality, "score") ?? queue.quality_score)),
  };
}

export async function getPublicImportPharmacyProfile(input: {
  locale: string;
  country: string;
  pharmacySlug: string;
}): Promise<GetPublicImportPharmacyProfileResult> {
  try {
    const slug = safeSlug(input.pharmacySlug);
    if (slug === null) return { ok: false, reason: "not_found" };

    const route = resolvePublicProviderCanonicalRoute({
      family: "pharmacy",
      slug,
      locale: input.locale,
      country: input.country,
    });
    if (!route.publicRouteEnabled || route.canonicalPath === null) {
      return { ok: false, reason: "not_found" };
    }
    const path = route.canonicalPath;

    const supabase = client();
    const queueResult = await supabase
      .from<PharmacyPublicNoindexQueueRow>("import_publish_queue")
      .select("id, target_entity_type, publish_status, index_policy, sitemap_policy, quality_score, metadata")
      .eq("target_entity_type", "pharmacy")
      .eq("sitemap_policy", "excluded")
      .eq("index_policy", "noindex")
      .eq("publish_status", "published_noindex")
      .order("updated_at", { ascending: false })
      .limit(lookupLimit);

    if (queueResult.error !== null || queueResult.data === null) return { ok: false, reason: "not_found" };

    const queue = queueResult.data.find((row) =>
      isPublicNoindexPharmacyQueueRow(row, path)
    );
    if (!queue) return { ok: false, reason: "not_found" };

    const id = candidateId(queue.metadata);
    if (id === null) return { ok: false, reason: "not_found" };

    const [authorizationResult, candidateResult] = await Promise.all([
      supabase
        .from<PharmacyPublicNoindexAuthorizationRow>("import_pharmacy_public_noindex_authorizations")
        .select("candidate_id, status, published_queue_id, canonical_path_en, canonical_path_ar")
        .eq("published_queue_id", queue.id)
        .eq("status", "published")
        .maybeSingle(),
      supabase
        .from<CandidateRow>("import_entity_candidates")
        .select("entity_type, candidate_status, candidate_payload")
        .eq("id", id)
        .eq("candidate_status", "approved")
        .maybeSingle(),
    ]);

    if (
      authorizationResult.error !== null ||
      authorizationResult.data === null ||
      candidateResult.error !== null ||
      candidateResult.data === null ||
      !isPublicNoindexPharmacyAuthorization(authorizationResult.data, queue, id, path)
    ) {
      return { ok: false, reason: "not_found" };
    }

    const profile = buildProfile(path, queue, candidateResult.data);
    return profile === null ? { ok: false, reason: "not_found" } : { ok: true, profile };
  } catch {
    return { ok: false, reason: "not_found" };
  }
}
