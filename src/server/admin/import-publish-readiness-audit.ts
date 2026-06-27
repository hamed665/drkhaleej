import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type ImportAuditFamily = "doctor" | "pharmacy" | "hospital";

export type ImportAuditBlockerReason =
  | "unsupported_entity_type"
  | "queue_not_index_eligible"
  | "robots_not_index"
  | "sitemap_not_included"
  | "sitemap_flag_missing"
  | "canonical_missing"
  | "canonical_unsafe"
  | "candidate_missing"
  | "candidate_not_approved"
  | "candidate_type_mismatch"
  | "source_missing"
  | "contact_or_map_missing"
  | "geo_missing";

export type ImportAuditFamilySummary = {
  family: ImportAuditFamily;
  queueRows: number;
  indexEligibleRows: number;
  sitemapIncludedRows: number;
  canonicalReadyRows: number;
  candidateLinkedRows: number;
  approvedCandidateRows: number;
  sourceReadyRows: number;
  contactReadyRows: number;
  geoReadyRows: number;
  readyForPublicIndexRows: number;
  blockerCounts: Record<ImportAuditBlockerReason, number>;
};

export type ImportAuditRowIssue = {
  queueId: string;
  family: ImportAuditFamily | "unsupported";
  canonicalPath: string | null;
  candidateId: string | null;
  qualityScore: number | null;
  blockers: ImportAuditBlockerReason[];
};

export type ImportPublishReadinessAudit = {
  generatedAt: string;
  totalQueueRows: number;
  supportedQueueRows: number;
  readyForPublicIndexRows: number;
  familySummaries: Record<ImportAuditFamily, ImportAuditFamilySummary>;
  rowIssues: ImportAuditRowIssue[];
};

type QueryResult<T> = { data: T[] | null; error: unknown | null };

type QueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  in(column: string, values: readonly string[]): QueryBuilder<T>;
};

type AuditClient = {
  from<T extends object = Record<string, unknown>>(table: string): QueryBuilder<T>;
};

type QueueRow = {
  id: string;
  target_entity_type: string;
  publish_status: string;
  index_policy: string;
  sitemap_policy: string;
  quality_score: number | null;
  updated_at: string | null;
  metadata: unknown;
};

type CandidateRow = {
  id: string;
  entity_type: string;
  candidate_status: string;
  candidate_payload: unknown;
};

type JsonRecord = Record<string, unknown>;

const auditFamilies = ["doctor", "pharmacy", "hospital"] as const satisfies readonly ImportAuditFamily[];
const defaultAuditLimit = 2000;

function client(): AuditClient {
  return createSupabaseServiceRoleClient() as unknown as AuditClient;
}

function emptyBlockerCounts(): Record<ImportAuditBlockerReason, number> {
  return {
    unsupported_entity_type: 0,
    queue_not_index_eligible: 0,
    robots_not_index: 0,
    sitemap_not_included: 0,
    sitemap_flag_missing: 0,
    canonical_missing: 0,
    canonical_unsafe: 0,
    candidate_missing: 0,
    candidate_not_approved: 0,
    candidate_type_mismatch: 0,
    source_missing: 0,
    contact_or_map_missing: 0,
    geo_missing: 0,
  };
}

function emptyFamilySummary(family: ImportAuditFamily): ImportAuditFamilySummary {
  return {
    family,
    queueRows: 0,
    indexEligibleRows: 0,
    sitemapIncludedRows: 0,
    canonicalReadyRows: 0,
    candidateLinkedRows: 0,
    approvedCandidateRows: 0,
    sourceReadyRows: 0,
    contactReadyRows: 0,
    geoReadyRows: 0,
    readyForPublicIndexRows: 0,
    blockerCounts: emptyBlockerCounts(),
  };
}

function supportedFamily(value: string): ImportAuditFamily | null {
  return auditFamilies.includes(value as ImportAuditFamily) ? (value as ImportAuditFamily) : null;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nestedRecord(value: JsonRecord, key: string): JsonRecord {
  const result = value[key];
  return isRecord(result) ? result : {};
}

function readString(value: JsonRecord, key: string): string | null {
  const result = value[key];
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumber(value: JsonRecord, key: string): number | null {
  const result = value[key];
  return typeof result === "number" && Number.isFinite(result) ? result : null;
}

function metadataRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function canonicalIsSafe(family: ImportAuditFamily, canonicalPath: string | null): boolean {
  if (canonicalPath === null) return false;

  switch (family) {
    case "doctor":
      return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalPath);
    case "pharmacy":
      return /^\/(en|ar)\/om\/pharmacies\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalPath);
    case "hospital":
      return /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalPath);
  }
}

function candidateEvidence(candidate: CandidateRow | null): {
  sourceReady: boolean;
  contactReady: boolean;
  geoReady: boolean;
} {
  if (candidate === null || !isRecord(candidate.candidate_payload)) {
    return { sourceReady: false, contactReady: false, geoReady: false };
  }

  const payload = candidate.candidate_payload;
  const source = nestedRecord(payload, "source");
  const contact = nestedRecord(payload, "contact");
  const geo = nestedRecord(payload, "geo");

  const sourceReady =
    (readString(source, "sourceName") !== null || readString(source, "sourceUrl") !== null) &&
    readString(source, "lastCheckedAt") !== null;

  const contactReady =
    readString(contact, "phoneE164") !== null ||
    readString(contact, "whatsappE164") !== null ||
    readString(contact, "email") !== null ||
    readString(contact, "websiteUrl") !== null ||
    readString(contact, "googleMapsUrl") !== null ||
    readString(contact, "directionUrl") !== null;

  const geoReady =
    readString(geo, "area") !== null ||
    readString(geo, "wilayat") !== null ||
    readString(geo, "governorate") !== null ||
    readNumber(geo, "latitude") !== null ||
    readNumber(geo, "longitude") !== null;

  return { sourceReady, contactReady, geoReady };
}

function addBlocker(summary: ImportAuditFamilySummary, blockers: ImportAuditBlockerReason[], reason: ImportAuditBlockerReason): void {
  blockers.push(reason);
  summary.blockerCounts[reason] += 1;
}

function summarizeRow(
  row: QueueRow,
  candidateById: Map<string, CandidateRow>,
  summaries: Record<ImportAuditFamily, ImportAuditFamilySummary>,
): ImportAuditRowIssue {
  const family = supportedFamily(row.target_entity_type);
  const metadata = metadataRecord(row.metadata);
  const canonicalPath = readString(metadata, "canonical_path");
  const candidateId = readString(metadata, "import_entity_candidate_id");
  const blockers: ImportAuditBlockerReason[] = [];

  if (family === null) {
    return {
      queueId: row.id,
      family: "unsupported",
      canonicalPath,
      candidateId,
      qualityScore: row.quality_score,
      blockers: ["unsupported_entity_type"],
    };
  }

  const summary = summaries[family];
  summary.queueRows += 1;

  if (row.publish_status === "index_eligible") summary.indexEligibleRows += 1;
  else addBlocker(summary, blockers, "queue_not_index_eligible");

  if (row.index_policy !== "index") addBlocker(summary, blockers, "robots_not_index");

  if (row.sitemap_policy === "included") summary.sitemapIncludedRows += 1;
  else addBlocker(summary, blockers, "sitemap_not_included");

  if (metadata.sitemap_included !== true) addBlocker(summary, blockers, "sitemap_flag_missing");

  if (canonicalPath === null) addBlocker(summary, blockers, "canonical_missing");
  else if (canonicalIsSafe(family, canonicalPath)) summary.canonicalReadyRows += 1;
  else addBlocker(summary, blockers, "canonical_unsafe");

  if (candidateId !== null) summary.candidateLinkedRows += 1;
  else addBlocker(summary, blockers, "candidate_missing");

  const candidate = candidateId === null ? null : candidateById.get(candidateId) ?? null;
  if (candidate !== null && candidate.candidate_status === "approved") summary.approvedCandidateRows += 1;
  else if (candidateId !== null) addBlocker(summary, blockers, "candidate_not_approved");

  if (candidate !== null && candidate.entity_type !== family) addBlocker(summary, blockers, "candidate_type_mismatch");

  const evidence = candidateEvidence(candidate);
  if (evidence.sourceReady) summary.sourceReadyRows += 1;
  else addBlocker(summary, blockers, "source_missing");

  if (evidence.contactReady) summary.contactReadyRows += 1;
  else addBlocker(summary, blockers, "contact_or_map_missing");

  if (evidence.geoReady) summary.geoReadyRows += 1;
  else addBlocker(summary, blockers, "geo_missing");

  if (blockers.length === 0) summary.readyForPublicIndexRows += 1;

  return {
    queueId: row.id,
    family,
    canonicalPath,
    candidateId,
    qualityScore: row.quality_score,
    blockers,
  };
}

async function loadCandidateMap(candidateIds: readonly string[]): Promise<Map<string, CandidateRow>> {
  if (candidateIds.length === 0) return new Map();

  const supabase = client();
  const result = await supabase
    .from<CandidateRow>("import_entity_candidates")
    .select("id, entity_type, candidate_status, candidate_payload")
    .in("id", candidateIds);

  if (result.error !== null || result.data === null) return new Map();
  return new Map(result.data.map((candidate) => [candidate.id, candidate]));
}

export async function getImportPublishReadinessAudit(options: { limit?: number } = {}): Promise<ImportPublishReadinessAudit> {
  const limit = Math.max(1, Math.min(options.limit ?? defaultAuditLimit, defaultAuditLimit));
  const supabase = client();
  const queueResult = await supabase
    .from<QueueRow>("import_publish_queue")
    .select("id, target_entity_type, publish_status, index_policy, sitemap_policy, quality_score, updated_at, metadata")
    .order("updated_at", { ascending: false })
    .limit(limit);

  const rows = queueResult.error === null && queueResult.data !== null ? queueResult.data : [];
  const candidateIds = Array.from(
    new Set(
      rows
        .map((row) => readString(metadataRecord(row.metadata), "import_entity_candidate_id"))
        .filter((candidateId): candidateId is string => candidateId !== null),
    ),
  );
  const candidateById = await loadCandidateMap(candidateIds);
  const familySummaries: Record<ImportAuditFamily, ImportAuditFamilySummary> = {
    doctor: emptyFamilySummary("doctor"),
    pharmacy: emptyFamilySummary("pharmacy"),
    hospital: emptyFamilySummary("hospital"),
  };

  const rowIssues = rows
    .map((row) => summarizeRow(row, candidateById, familySummaries))
    .filter((issue) => issue.blockers.length > 0)
    .slice(0, 200);

  return {
    generatedAt: new Date().toISOString(),
    totalQueueRows: rows.length,
    supportedQueueRows: Object.values(familySummaries).reduce((sum, family) => sum + family.queueRows, 0),
    readyForPublicIndexRows: Object.values(familySummaries).reduce(
      (sum, family) => sum + family.readyForPublicIndexRows,
      0,
    ),
    familySummaries,
    rowIssues,
  };
}
