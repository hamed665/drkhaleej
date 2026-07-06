import type {
  PublicProviderDiscoveryEntry,
  PublicProviderEntityType,
  PublicProviderFamily,
} from "./public-provider-projection";

export type PublicImportJson =
  | string
  | number
  | boolean
  | null
  | PublicImportJson[]
  | { [key: string]: PublicImportJson | undefined };

type JsonRecord = { [key: string]: PublicImportJson | undefined };

export type PublicImportProviderQueueRow = {
  id: string;
  metadata: PublicImportJson;
  target_entity?: string | null;
  target_entity_type?: string | null;
  publish_status: string | null;
  index_policy: string | null;
  sitemap_policy: string | null;
  robots_policy?: string | null;
  updated_at: string | null;
};

export type PublicImportProviderCandidateRow = {
  id: string;
  candidate_payload: PublicImportJson;
  candidate_status: string | null;
  entity_type: string | null;
};

const FAMILY_BY_ENTITY: Partial<Record<PublicProviderEntityType, PublicProviderFamily>> = {
  doctor: "doctors",
  pharmacy: "pharmacies",
  hospital: "hospitals",
  clinic: "centers",
  lab: "labs",
  radiology: "radiology",
  dentistry: "dentistry",
  beauty: "beauty",
};

function record(value: PublicImportJson | undefined): JsonRecord {
  if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function text(source: JsonRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function list(source: JsonRecord, ...keys: string[]): string[] {
  for (const key of keys) {
    const value = source[key];
    if (!Array.isArray(value)) continue;
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  }
  return [];
}

function entity(value: string | null): PublicProviderEntityType | null {
  if (value === "doctor" || value === "pharmacy" || value === "hospital" || value === "clinic" || value === "lab" || value === "radiology" || value === "dentistry" || value === "beauty") {
    return value;
  }
  return null;
}

function normalizedPath(path: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (trimmed.length === 0) return null;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function slugFromPath(path: string): string | null {
  const slug = path.split("/").filter(Boolean).at(-1);
  return slug && /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

function candidateRoot(candidate: PublicImportProviderCandidateRow | null): JsonRecord {
  return record(candidate?.candidate_payload);
}

function candidatePart(candidate: PublicImportProviderCandidateRow | null, key: string): JsonRecord {
  return record(candidateRoot(candidate)[key]);
}

function candidateText(candidate: PublicImportProviderCandidateRow | null, ...keys: string[]): string | null {
  const root = candidateRoot(candidate);
  const profile = candidatePart(candidate, "profile");
  const identity = candidatePart(candidate, "identity");
  return text(profile, ...keys) ?? text(identity, ...keys) ?? text(root, ...keys);
}

function candidateList(candidate: PublicImportProviderCandidateRow | null, ...keys: string[]): string[] {
  const root = candidateRoot(candidate);
  const profile = candidatePart(candidate, "profile");
  const taxonomy = candidatePart(candidate, "taxonomy");
  return [...list(taxonomy, ...keys), ...list(profile, ...keys), ...list(root, ...keys)];
}

function candidateLocation(candidate: PublicImportProviderCandidateRow | null): Pick<PublicProviderDiscoveryEntry, "governorate" | "wilayat" | "area"> {
  const root = candidateRoot(candidate);
  const profile = candidatePart(candidate, "profile");
  const geo = candidatePart(candidate, "geo");
  return {
    governorate: text(profile, "governorate") ?? text(geo, "governorate") ?? text(root, "governorate"),
    wilayat: text(profile, "wilayat") ?? text(geo, "wilayat") ?? text(root, "wilayat"),
    area: text(profile, "area") ?? text(geo, "area") ?? text(root, "area"),
  };
}

function sourceEvidence(metadata: JsonRecord, candidate: PublicImportProviderCandidateRow | null): Pick<PublicProviderDiscoveryEntry, "sourceName" | "sourceUrl" | "lastCheckedAt"> {
  const root = candidateRoot(candidate);
  const evidence = candidatePart(candidate, "evidence");
  return {
    sourceName: text(evidence, "sourceName", "source_name") ?? text(root, "sourceName", "source_name") ?? text(metadata, "sourceName", "source_name"),
    sourceUrl: text(evidence, "sourceUrl", "source_url", "url") ?? text(root, "sourceUrl", "source_url", "url") ?? text(metadata, "sourceUrl", "source_url", "url"),
    lastCheckedAt: text(evidence, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at") ?? text(root, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at") ?? text(metadata, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at"),
  };
}

function hasContactOrMap(metadata: JsonRecord, candidate: PublicImportProviderCandidateRow | null): boolean {
  return Boolean(
    text(metadata, "mapUrl", "map_url", "googleMapsUrl", "google_maps_url", "phone", "website") ??
      candidateText(candidate, "mapUrl", "map_url", "googleMapsUrl", "google_maps_url", "phone", "website"),
  );
}

function approvedCandidate(candidate: PublicImportProviderCandidateRow | null, expectedEntity: PublicProviderEntityType): boolean {
  if (!candidate) return true;
  if (candidate.entity_type !== null && candidate.entity_type !== expectedEntity) return false;
  return candidate.candidate_status === null || candidate.candidate_status === "approved";
}

export function buildImportedProviderDiscoveryEntry(
  row: PublicImportProviderQueueRow,
  candidate: PublicImportProviderCandidateRow | null,
): PublicProviderDiscoveryEntry | null {
  const entityType = entity(row.target_entity_type ?? row.target_entity ?? null);
  if (!entityType) return null;

  const family = FAMILY_BY_ENTITY[entityType];
  if (!family) return null;

  const metadata = record(row.metadata);
  const canonicalPath = normalizedPath(text(metadata, "canonical_path", "canonicalPath"));
  if (!canonicalPath) return null;

  const slug = slugFromPath(canonicalPath);
  if (!slug) return null;

  const nameEn = candidateText(candidate, "name", "nameEn", "name_en", "fullNameEn", "full_name_en") ?? text(metadata, "name", "nameEn", "name_en", "title");
  if (!nameEn) return null;

  const location = candidateLocation(candidate);
  const evidence = sourceEvidence(metadata, candidate);
  const lastCheckedAt = evidence.lastCheckedAt ?? row.updated_at;
  const routeMatchesFamily = canonicalPath.split("/").filter(Boolean).includes(family);
  const hasGeo = location.area !== null || location.wilayat !== null || location.governorate !== null;
  const hasSource = evidence.sourceName !== null || evidence.sourceUrl !== null;
  const statusAllowsDetail = row.publish_status === "index_eligible" || row.publish_status === "published";
  const robotsAllowsIndex = row.robots_policy === undefined || row.robots_policy === null || row.robots_policy === "index";

  const publicDetailEligible = Boolean(statusAllowsDetail && row.index_policy === "index" && approvedCandidate(candidate, entityType) && hasGeo && hasSource && lastCheckedAt !== null && hasContactOrMap(metadata, candidate));
  const publicDiscoveryEligible = Boolean(publicDetailEligible && routeMatchesFamily);
  const publicSitemapEligible = Boolean(publicDiscoveryEligible && row.sitemap_policy === "included" && robotsAllowsIndex);

  return {
    id: `import:${row.id}`,
    sourceKind: "import",
    entityType,
    family,
    slug,
    canonicalPath,
    nameEn,
    nameAr: candidateText(candidate, "nameAr", "name_ar", "fullNameAr", "full_name_ar") ?? text(metadata, "nameAr", "name_ar"),
    descriptionEn: candidateText(candidate, "description", "descriptionEn", "description_en", "summary") ?? text(metadata, "description", "descriptionEn", "description_en"),
    descriptionAr: candidateText(candidate, "descriptionAr", "description_ar", "summaryAr", "summary_ar") ?? text(metadata, "descriptionAr", "description_ar"),
    country: "om",
    governorate: location.governorate,
    wilayat: location.wilayat,
    area: location.area,
    services: Array.from(new Set(candidateList(candidate, "services", "service_slugs"))),
    departments: Array.from(new Set(candidateList(candidate, "departments", "department_slugs"))),
    languages: Array.from(new Set(candidateList(candidate, "languages"))),
    sourceName: evidence.sourceName,
    sourceUrl: evidence.sourceUrl,
    lastCheckedAt,
    publicDetailEligible,
    publicDiscoveryEligible,
    publicSitemapEligible,
  };
}

export function buildImportedProviderDiscoveryEntries(
  rows: readonly PublicImportProviderQueueRow[],
  candidatesById: ReadonlyMap<string, PublicImportProviderCandidateRow>,
): PublicProviderDiscoveryEntry[] {
  return rows.flatMap((row) => {
    const metadata = record(row.metadata);
    const candidateId = text(metadata, "import_entity_candidate_id", "candidate_id", "candidateId");
    const entry = buildImportedProviderDiscoveryEntry(row, candidateId ? candidatesById.get(candidateId) ?? null : null);
    return entry ? [entry] : [];
  });
}
