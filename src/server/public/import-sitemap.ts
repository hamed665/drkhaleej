import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type QueryResult<T> = { data: T[] | null; error: unknown | null };

type ImportSitemapQueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  select(columns: string): ImportSitemapQueryBuilder<T>;
  eq(column: string, value: string | number | boolean): ImportSitemapQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): ImportSitemapQueryBuilder<T>;
  limit(count: number): ImportSitemapQueryBuilder<T>;
};

type ImportSitemapClient = {
  from<T extends object = Record<string, unknown>>(table: string): ImportSitemapQueryBuilder<T>;
};

type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital";

type IncludedImportSitemapRow = {
  id: string;
  target_entity_type: string;
  updated_at: string;
  metadata: unknown;
};

type JsonRecord = Record<string, unknown>;

export type PublicImportSitemapEntry = {
  pathname: string;
  lastModified: Date;
};

type InternalImportSitemapEntry = PublicImportSitemapEntry & {
  entityType: SupportedImportSitemapEntityType;
};

const publicImportSitemapFamilyCaps = {
  doctor: 3000,
  pharmacy: 1500,
  hospital: 500,
} as const satisfies Record<SupportedImportSitemapEntityType, number>;

const publicImportSitemapLimit = Object.values(publicImportSitemapFamilyCaps).reduce(
  (total, cap) => total + cap,
  0,
);

function createImportSitemapClient(): ImportSitemapClient {
  return createSupabaseServiceRoleClient() as unknown as ImportSitemapClient;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: JsonRecord, key: string): string | null {
  const result = value[key];
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function supportedEntityType(value: string): SupportedImportSitemapEntityType | null {
  if (value === "doctor" || value === "pharmacy" || value === "hospital") return value;
  return null;
}

function emptyFamilyCounters(): Record<SupportedImportSitemapEntityType, number> {
  return {
    doctor: 0,
    pharmacy: 0,
    hospital: 0,
  };
}

function isSafePublicCanonicalPathForEntity(
  entityType: SupportedImportSitemapEntityType,
  pathname: string,
): boolean {
  switch (entityType) {
    case "doctor":
      return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname);
    case "pharmacy":
      return /^\/(en|ar)\/om\/pharmacies\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname);
    case "hospital":
      return /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname);
  }
}

function parseLastModified(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function hasReviewedImportEvidence(metadata: JsonRecord): boolean {
  if (metadata.sitemap_included !== true) return false;
  if (readString(metadata, "robots_policy") !== "index") return false;
  if (readString(metadata, "canonical_path") === null) return false;
  return readString(metadata, "import_entity_candidate_id") !== null;
}

function rowToSitemapEntry(row: IncludedImportSitemapRow): InternalImportSitemapEntry | null {
  const entityType = supportedEntityType(row.target_entity_type);
  if (entityType === null) return null;
  if (!isRecord(row.metadata)) return null;
  if (!hasReviewedImportEvidence(row.metadata)) return null;

  const canonicalPath = readString(row.metadata, "canonical_path");
  if (canonicalPath === null || !isSafePublicCanonicalPathForEntity(entityType, canonicalPath)) return null;

  return {
    entityType,
    pathname: canonicalPath,
    lastModified: parseLastModified(row.updated_at),
  };
}

function toPublicSitemapEntry(entry: InternalImportSitemapEntry): PublicImportSitemapEntry {
  return {
    pathname: entry.pathname,
    lastModified: entry.lastModified,
  };
}

function applyFamilyCaps(entries: readonly InternalImportSitemapEntry[]): readonly PublicImportSitemapEntry[] {
  const familyCounts = emptyFamilyCounters();
  const uniqueEntries = new Map<string, InternalImportSitemapEntry>();

  for (const entry of entries) {
    if (uniqueEntries.has(entry.pathname)) continue;
    if (familyCounts[entry.entityType] >= publicImportSitemapFamilyCaps[entry.entityType]) continue;

    uniqueEntries.set(entry.pathname, entry);
    familyCounts[entry.entityType] += 1;
  }

  return [...uniqueEntries.values()].map(toPublicSitemapEntry);
}

export async function listPublicImportSitemapEntries(): Promise<readonly PublicImportSitemapEntry[]> {
  try {
    const supabase = createImportSitemapClient();
    const result = await supabase
      .from<IncludedImportSitemapRow>("import_publish_queue")
      .select("id, target_entity_type, updated_at, metadata")
      .eq("publish_status", "index_eligible")
      .eq("index_policy", "index")
      .eq("sitemap_policy", "included")
      .order("updated_at", { ascending: false })
      .limit(publicImportSitemapLimit);

    if (result.error !== null || result.data === null) {
      return [];
    }

    const entries = result.data
      .map(rowToSitemapEntry)
      .filter((entry): entry is InternalImportSitemapEntry => entry !== null);

    return applyFamilyCaps(entries);
  } catch {
    return [];
  }
}
