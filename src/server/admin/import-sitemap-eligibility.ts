import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

type QueryResult<T> = { data: T[] | null; error: unknown | null };
type SingleQueryResult<T> = { data: T | null; error: unknown | null };

type ImportSitemapEligibilityQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportSitemapEligibilityQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportSitemapEligibilityQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportSitemapEligibilityQueryBuilder<T>;
  limit(count: number): ImportSitemapEligibilityQueryBuilder<T>;
  maybeSingle(): Promise<SingleQueryResult<T>>;
};

type ImportSitemapEligibilityClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportSitemapEligibilityQueryBuilder<T>;
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
  updated_at: string;
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

type CanonicalRouteFamily = "doctor" | "hospitals" | "clinics" | "pharmacies" | "labs";

export type AdminImportSitemapEligibilityCandidate = {
  publishQueueId: string;
  importEntityCandidateId: string | null;
  rawRowId: string;
  entityType: string;
  qualityScore: number;
  lastModified: string;
  canonicalPath: string | null;
  canonicalUrlCandidate: string | null;
  sitemapPolicy: "eligible";
  sitemapIncluded: false;
  robotsPolicy: "index_candidate" | "blocked";
  reasons: string[];
};

export type ListAdminImportSitemapEligibleCandidatesResult =
  | { ok: true; batchId: string; items: AdminImportSitemapEligibilityCandidate[]; limit: number }
  | { ok: false; reason: "not_found" | "unavailable" };

const sitemapEligibilityLimit = 500;
const launchLocales = ["en", "ar"] as const;
const launchCountry = "om";

function createImportSitemapEligibilityClient(): ImportSitemapEligibilityClient {
  return createSupabaseServiceRoleClient() as unknown as ImportSitemapEligibilityClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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

function canonicalRouteFamily(entityType: string): CanonicalRouteFamily | null {
  switch (entityType) {
    case "doctor":
      return "doctor";
    case "hospital":
      return "hospitals";
    case "pharmacy":
      return "pharmacies";
    case "clinic":
    case "medical_center":
      return "clinics";
    case "laboratory":
      return "labs";
    default:
      return null;
  }
}

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function canonicalSlugFromCandidatePayload(candidatePayload: unknown): string | null {
  const identity = readRecord(candidatePayload, "identity");
  const slugCandidate = readString(identity, "slugCandidate");
  if (slugCandidate === null) return null;
  return isSafeSlug(slugCandidate) ? slugCandidate : null;
}

function buildCanonicalPath(entityType: string, candidatePayload: unknown): { path: string | null; reasons: string[] } {
  const reasons: string[] = [];
  const routeFamily = canonicalRouteFamily(entityType);
  const slug = canonicalSlugFromCandidatePayload(candidatePayload);

  if (routeFamily === null) {
    reasons.push("unsupported_entity_type_for_canonical_route");
  }

  if (slug === null) {
    reasons.push("missing_safe_slug_candidate");
  }

  if (routeFamily === null || slug === null) {
    return { path: null, reasons };
  }

  return { path: `/${launchLocales[0]}/${launchCountry}/${routeFamily}/${slug}`, reasons };
}

function buildCanonicalUrlCandidate(canonicalPath: string | null): string | null {
  if (canonicalPath === null) return null;
  return canonicalPath;
}

function evaluateSitemapCandidate(
  queueRow: PublishQueueCandidate,
  candidate: ApprovedEntityCandidate | undefined,
): AdminImportSitemapEligibilityCandidate {
  const reasons: string[] = [];

  if (queueRow.publish_status !== "index_eligible") reasons.push("publish_status_not_index_eligible");
  if (queueRow.index_policy !== "index_eligible") reasons.push("index_policy_not_index_eligible");
  if (queueRow.sitemap_policy !== "eligible") reasons.push("sitemap_policy_not_eligible");

  if (!candidate) {
    reasons.push("missing_approved_public_safe_candidate");
  } else {
    if (candidate.candidate_status !== "approved") reasons.push("candidate_not_approved");
    if (candidate.entity_type !== queueRow.target_entity_type) reasons.push("entity_type_mismatch");
  }

  const canonical = candidate
    ? buildCanonicalPath(candidate.entity_type, candidate.candidate_payload)
    : { path: null, reasons: [] };

  reasons.push(...canonical.reasons);

  return {
    publishQueueId: queueRow.id,
    importEntityCandidateId: candidate?.id ?? null,
    rawRowId: queueRow.raw_row_id,
    entityType: queueRow.target_entity_type,
    qualityScore: queueRow.quality_score,
    lastModified: queueRow.updated_at,
    canonicalPath: canonical.path,
    canonicalUrlCandidate: buildCanonicalUrlCandidate(canonical.path),
    sitemapPolicy: "eligible",
    sitemapIncluded: false,
    robotsPolicy: reasons.length === 0 ? "index_candidate" : "blocked",
    reasons,
  };
}

export async function listAdminImportSitemapEligibleCandidates(
  batchId: string,
): Promise<ListAdminImportSitemapEligibleCandidatesResult> {
  await requireAdminPermission("imports.read");

  if (!isUuid(batchId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createImportSitemapEligibilityClient();
  const batchResult = await supabase.from<{ id: string }>("import_batches").select("id").eq("id", batchId).maybeSingle();

  if (batchResult.error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (batchResult.data === null) {
    return { ok: false, reason: "not_found" };
  }

  const [queueResult, candidatesResult] = await Promise.all([
    supabase
      .from<PublishQueueCandidate>("import_publish_queue")
      .select("id, batch_id, raw_row_id, target_entity_type, target_entity_id, publish_status, index_policy, sitemap_policy, quality_score, updated_at, metadata")
      .eq("batch_id", batchId)
      .eq("publish_status", "index_eligible")
      .eq("index_policy", "index_eligible")
      .eq("sitemap_policy", "eligible")
      .order("updated_at", { ascending: false })
      .limit(sitemapEligibilityLimit),
    supabase
      .from<ApprovedEntityCandidate>("import_entity_candidates")
      .select("id, raw_row_id, entity_type, candidate_status, quality_score, candidate_payload")
      .eq("batch_id", batchId)
      .eq("candidate_status", "approved")
      .limit(sitemapEligibilityLimit),
  ]);

  if (queueResult.error !== null || queueResult.data === null || candidatesResult.error !== null || candidatesResult.data === null) {
    return { ok: false, reason: "unavailable" };
  }

  const candidatesByRawRowId = new Map(candidatesResult.data.map((candidate) => [candidate.raw_row_id, candidate]));

  return {
    ok: true,
    batchId,
    items: queueResult.data.map((queueRow) =>
      evaluateSitemapCandidate(queueRow, candidatesByRawRowId.get(queueRow.raw_row_id)),
    ),
    limit: sitemapEligibilityLimit,
  };
}
