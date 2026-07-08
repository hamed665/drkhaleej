import "server-only";

export type OmanGeoLevel = "country" | "governorate" | "wilayat" | "city" | "area";
export type OmanGeoNameLocale = "en" | "ar" | "omani_ar";
export type OmanGeoBoundaryStatus = "missing" | "approximate" | "verified" | "manually_verified";
export type OmanGeoAuthorityStatus = "draft" | "verified" | "manually_verified" | "deprecated";

export type OmanGeoAuthorityName = {
  locale: OmanGeoNameLocale;
  value: string;
  isCanonical: boolean;
};

export type OmanGeoAuthorityAlias = {
  value: string;
  locale: OmanGeoNameLocale;
  normalizedValue: string;
  source: string | null;
};

export type OmanGeoAuthorityBoundary = {
  centroidLatitude: number | null;
  centroidLongitude: number | null;
  boundingBox: readonly [number, number, number, number] | null;
  boundaryStatus: OmanGeoBoundaryStatus;
};

export type OmanGeoAuthorityEntry = {
  id: string;
  level: OmanGeoLevel;
  slug: string;
  parentId: string | null;
  governorateId: string | null;
  wilayatId: string | null;
  cityId: string | null;
  canonicalNameEn: string;
  canonicalNameAr: string;
  names: readonly OmanGeoAuthorityName[];
  aliases: readonly OmanGeoAuthorityAlias[];
  nearbyAreaIds: readonly string[];
  boundary: OmanGeoAuthorityBoundary;
  status: OmanGeoAuthorityStatus;
  sourceEvidence: readonly string[];
};

export type OmanGeoAuthorityRegistry = {
  version: string;
  countryCode: "om";
  entries: readonly OmanGeoAuthorityEntry[];
};

export type OmanGeoAuthorityRegistryBlocker =
  | "country_missing"
  | "governorate_count_incomplete"
  | "wilayat_count_incomplete"
  | "canonical_slug_missing"
  | "canonical_slug_duplicate"
  | "arabic_name_missing"
  | "english_name_missing"
  | "parent_missing"
  | "alias_normalization_missing"
  | "boundary_status_missing"
  | "source_evidence_missing"
  | "muscat_area_seed_incomplete";

export const OMAN_GEO_AUTHORITY_EXPECTED_COUNTRY_CODE = "om" as const;
export const OMAN_GEO_AUTHORITY_EXPECTED_GOVERNORATE_COUNT = 11;
export const OMAN_GEO_AUTHORITY_EXPECTED_WILAYAT_COUNT = 63;

export const OMAN_GOVERNORATE_SLUGS = [
  "muscat",
  "dhofar",
  "musandam",
  "al-buraimi",
  "al-dakhiliyah",
  "al-dhahirah",
  "north-al-batinah",
  "south-al-batinah",
  "north-ash-sharqiyah",
  "south-ash-sharqiyah",
  "al-wusta",
] as const;

export const OMAN_WILAYAT_SLUGS_BY_GOVERNORATE = {
  muscat: ["muscat", "muttrah", "bausher", "seeb", "al-amerat", "qurayyat"],
  dhofar: [
    "salalah",
    "taqah",
    "mirbat",
    "sadah",
    "rakhyut",
    "dhalkut",
    "thumrait",
    "muqshin",
    "al-mazyona",
    "shalim-and-the-hallaniyat-islands",
  ],
  musandam: ["khasab", "bukha", "dibba", "madha"],
  "al-buraimi": ["al-buraimi", "mahdah", "al-sunaynah"],
  "al-dakhiliyah": ["nizwa", "samail", "bahla", "adam", "al-hamra", "manah", "izki", "bidbid", "jabal-akhdar"],
  "al-dhahirah": ["ibri", "yanqul", "dhank"],
  "north-al-batinah": ["sohar", "shinas", "liwa", "saham", "al-khaburah", "al-suwaiq"],
  "south-al-batinah": ["rustaq", "al-awabi", "nakhal", "wadi-al-maawil", "barka", "al-musannah"],
  "north-ash-sharqiyah": ["ibra", "al-mudhaibi", "bidiyah", "al-qabil", "wadi-bani-khalid", "dima-wa-al-taien", "sinaw"],
  "south-ash-sharqiyah": ["sur", "al-kamil-wa-al-wafi", "jalan-bani-bu-hassan", "jalan-bani-bu-ali", "masirah"],
  "al-wusta": ["haima", "mahout", "duqm", "al-jazir"],
} as const satisfies Record<(typeof OMAN_GOVERNORATE_SLUGS)[number], readonly string[]>;

export const OMAN_MUSCAT_REQUIRED_AREA_SEED_SLUGS = [
  "al-khuwair",
  "al-ghubrah",
  "azaiba",
  "qurum",
  "madinat-sultan-qaboos",
  "ruwi",
  "muttrah",
  "al-hail",
  "mawaleh",
  "al-khoud",
  "al-seeb",
  "al-amerat",
  "wadi-kabir",
  "al-wattayah",
  "ghala",
  "al-ansab",
] as const;

export const OMAN_GEO_AUTHORITY_REQUIRED_TABLES = [
  "geo_countries",
  "geo_governorates",
  "geo_wilayats",
  "geo_cities",
  "geo_areas",
  "geo_area_aliases",
  "geo_area_neighbors",
  "geo_boundaries",
  "geo_source_evidence",
] as const;

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isUnique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export function normalizeOmanGeoAlias(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

export function getExpectedOmanWilayatCount(): number {
  return Object.values(OMAN_WILAYAT_SLUGS_BY_GOVERNORATE).reduce((total, wilayats) => total + wilayats.length, 0);
}

export function getOmanGeoAuthorityRegistryBlockers(registry: OmanGeoAuthorityRegistry): readonly OmanGeoAuthorityRegistryBlocker[] {
  const blockers: OmanGeoAuthorityRegistryBlocker[] = [];
  const entries = registry.entries;
  const slugs = entries.map((entry) => entry.slug);

  if (registry.countryCode !== OMAN_GEO_AUTHORITY_EXPECTED_COUNTRY_CODE) blockers.push("country_missing");
  if (entries.filter((entry) => entry.level === "governorate").length < OMAN_GEO_AUTHORITY_EXPECTED_GOVERNORATE_COUNT) {
    blockers.push("governorate_count_incomplete");
  }
  if (entries.filter((entry) => entry.level === "wilayat").length < OMAN_GEO_AUTHORITY_EXPECTED_WILAYAT_COUNT) {
    blockers.push("wilayat_count_incomplete");
  }

  if (slugs.some((slug) => !hasText(slug))) blockers.push("canonical_slug_missing");
  if (!isUnique(slugs)) blockers.push("canonical_slug_duplicate");

  for (const entry of entries) {
    if (!hasText(entry.canonicalNameEn)) blockers.push("english_name_missing");
    if (!hasText(entry.canonicalNameAr)) blockers.push("arabic_name_missing");
    if (entry.level !== "country" && !hasText(entry.parentId)) blockers.push("parent_missing");
    if (entry.aliases.some((alias) => !hasText(alias.normalizedValue))) blockers.push("alias_normalization_missing");
    if (entry.boundary.boundaryStatus === "missing") blockers.push("boundary_status_missing");
    if (entry.sourceEvidence.length === 0) blockers.push("source_evidence_missing");
  }

  const areaSlugs = new Set(entries.filter((entry) => entry.level === "area").map((entry) => entry.slug));
  if (OMAN_MUSCAT_REQUIRED_AREA_SEED_SLUGS.some((slug) => !areaSlugs.has(slug))) blockers.push("muscat_area_seed_incomplete");

  return [...new Set(blockers)];
}

export function isOmanGeoAuthorityRegistryReady(registry: OmanGeoAuthorityRegistry): boolean {
  return getOmanGeoAuthorityRegistryBlockers(registry).length === 0;
}
