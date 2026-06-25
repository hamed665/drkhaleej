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

type IncludedImportSitemapRow = {
  id: string;
  updated_at: string;
  metadata: unknown;
};

type JsonRecord = Record<string, unknown>;

export type PublicImportSitemapEntry = {
  pathname: string;
  lastModified: Date;
};

const publicImportSitemapLimit = 1000;

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

function isSafePublicCanonicalPath(pathname: string): boolean {
  return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname);
}

function parseLastModified(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function rowToSitemapEntry(row: IncludedImportSitemapRow): PublicImportSitemapEntry | null {
  if (!isRecord(row.metadata)) return null;

  if (row.metadata.sitemap_included !== true) return null;
  if (readString(row.metadata, "robots_policy") !== "index") return null;

  const canonicalPath = readString(row.metadata, "canonical_path");
  if (canonicalPath === null || !isSafePublicCanonicalPath(canonicalPath)) return null;

  return {
    pathname: canonicalPath,
    lastModified: parseLastModified(row.updated_at),
  };
}

export async function listPublicImportSitemapEntries(): Promise<readonly PublicImportSitemapEntry[]> {
  try {
    const supabase = createImportSitemapClient();
    const result = await supabase
      .from<IncludedImportSitemapRow>("import_publish_queue")
      .select("id, updated_at, metadata")
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
      .filter((entry): entry is PublicImportSitemapEntry => entry !== null);

    const uniqueEntries = new Map<string, PublicImportSitemapEntry>();
    for (const entry of entries) {
      if (!uniqueEntries.has(entry.pathname)) {
        uniqueEntries.set(entry.pathname, entry);
      }
    }

    return [...uniqueEntries.values()];
  } catch {
    return [];
  }
}
