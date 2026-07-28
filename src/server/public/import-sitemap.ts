import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { resolvePublicProviderCanonicalRoute } from "@/lib/catalog/public-provider-route-resolver";
import { resolveImportProviderAuthority } from "@/server/admin/import-provider-authority-adapter";

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

export type IncludedImportSitemapRow = {
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
  hospital: 500,
  doctor: 3000,
  pharmacy: 1500,
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
    hospital: 0,
    doctor: 0,
    pharmacy: 0,
  };
}

function routeIdentity(pathname: string): {
  locale: "en" | "ar";
  country: "om";
  slug: string;
} | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 4) return null;

  const [locale, country, , slug] = parts;
  if (locale !== "en" && locale !== "ar") return null;
  if (country !== "om") return null;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  return { locale, country, slug };
}

function parseLastModified(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function hasReviewedImportEvidence(
  entityType: SupportedImportSitemapEntityType,
  metadata: JsonRecord,
): boolean {
  if (metadata.sitemap_included !== true) return false;
  if (readString(metadata, "robots_policy") !== "index") return false;
  if (readString(metadata, "canonical_path") === null) return false;
  if (readString(metadata, "import_entity_candidate_id") === null) return false;
  if (
    entityType === "pharmacy" &&
    readString(metadata, "pharmacy_sitemap_promotion_schema_version") !==
      "drkhaleej.import.pharmacySitemapPromotion.v1"
  ) {
    return false;
  }
  return true;
}

export function buildPublicImportSitemapEntry(
  row: IncludedImportSitemapRow,
): InternalImportSitemapEntry | null {
  const entityType = supportedEntityType(row.target_entity_type);
  if (entityType === null) return null;
  if (!isRecord(row.metadata)) return null;
  if (!hasReviewedImportEvidence(entityType, row.metadata)) return null;

  const canonicalPath = readString(row.metadata, "canonical_path");
  if (canonicalPath === null) return null;

  const identity = routeIdentity(canonicalPath);
  if (identity === null) return null;

  const authorityResolution = resolveImportProviderAuthority(entityType);
  if (!authorityResolution.ok) return null;

  const routeFamily = authorityResolution.authority.routeRelease.family;
  if (routeFamily === null) return null;

  const resolvedRoute = resolvePublicProviderCanonicalRoute({
    family: routeFamily,
    slug: identity.slug,
    locale: identity.locale,
    country: identity.country,
  });
  if (!resolvedRoute.publicRouteEnabled || resolvedRoute.canonicalPath !== canonicalPath) {
    return null;
  }

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

function dedupePublicEntries(entries: readonly PublicImportSitemapEntry[]): readonly PublicImportSitemapEntry[] {
  const uniqueEntries = new Map<string, PublicImportSitemapEntry>();
  for (const entry of entries) {
    if (!uniqueEntries.has(entry.pathname)) {
      uniqueEntries.set(entry.pathname, entry);
    }
  }

  return [...uniqueEntries.values()];
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

  return dedupePublicEntries([...uniqueEntries.values()].map(toPublicSitemapEntry));
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
      .map(buildPublicImportSitemapEntry)
      .filter((entry): entry is InternalImportSitemapEntry => entry !== null);

    return applyFamilyCaps(entries);
  } catch {
    return [];
  }
}
