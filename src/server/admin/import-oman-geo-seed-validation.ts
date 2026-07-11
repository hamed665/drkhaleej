import "server-only";

export type ImportOmanGeoSeedBlocker =
  | "country_invalid"
  | "governorate_count_invalid"
  | "wilayat_count_invalid"
  | "governorate_slug_duplicate"
  | "wilayat_slug_duplicate"
  | "bilingual_name_missing"
  | "muscat_area_seed_incomplete"
  | "area_parent_invalid"
  | "area_alias_missing"
  | "nearby_area_reference_invalid"
  | "source_evidence_missing"
  | "manual_review_not_required";

export type ImportOmanGeoSeedSummary = {
  countryCode: string;
  governorateCount: number;
  wilayatCount: number;
  muscatAreaCount: number;
  duplicateGovernorateSlugs: readonly string[];
  duplicateWilayatSlugs: readonly string[];
  missingBilingualNames: number;
  invalidAreaParents: readonly string[];
  areasWithoutAliases: readonly string[];
  invalidNearbyReferences: readonly string[];
  hasSourceEvidence: boolean;
  manualReviewRequired: boolean;
};

export type ImportOmanGeoSeedReadiness = {
  seedReady: boolean;
  databaseWriteReady: false;
  publicGeoReady: false;
  blockers: readonly ImportOmanGeoSeedBlocker[];
};

export const IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES = 11;
export const IMPORT_OMAN_GEO_EXPECTED_WILAYATS = 63;
export const IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS = 16;

export function getImportOmanGeoSeedReadiness(summary: ImportOmanGeoSeedSummary): ImportOmanGeoSeedReadiness {
  const blockers: ImportOmanGeoSeedBlocker[] = [];
  if (summary.countryCode !== "om") blockers.push("country_invalid");
  if (summary.governorateCount !== IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES) blockers.push("governorate_count_invalid");
  if (summary.wilayatCount !== IMPORT_OMAN_GEO_EXPECTED_WILAYATS) blockers.push("wilayat_count_invalid");
  if (summary.duplicateGovernorateSlugs.length > 0) blockers.push("governorate_slug_duplicate");
  if (summary.duplicateWilayatSlugs.length > 0) blockers.push("wilayat_slug_duplicate");
  if (summary.missingBilingualNames > 0) blockers.push("bilingual_name_missing");
  if (summary.muscatAreaCount < IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS) blockers.push("muscat_area_seed_incomplete");
  if (summary.invalidAreaParents.length > 0) blockers.push("area_parent_invalid");
  if (summary.areasWithoutAliases.length > 0) blockers.push("area_alias_missing");
  if (summary.invalidNearbyReferences.length > 0) blockers.push("nearby_area_reference_invalid");
  if (!summary.hasSourceEvidence) blockers.push("source_evidence_missing");
  if (!summary.manualReviewRequired) blockers.push("manual_review_not_required");

  return {
    seedReady: blockers.length === 0,
    databaseWriteReady: false,
    publicGeoReady: false,
    blockers: Array.from(new Set(blockers)),
  };
}
