import "server-only";

export type ImportGeoResolutionStatus = "missing" | "inferred" | "low_confidence" | "verified" | "manually_verified";

export type ImportCanonicalGeo = {
  country_code: string | null;
  governorate_id: string | null;
  city_id: string | null;
  area_id: string | null;
  latitude: number | null;
  longitude: number | null;
  geo_confidence_score: number | null;
  geo_source: string | null;
  geo_resolution_status: ImportGeoResolutionStatus;
  geo_validated: boolean;
};

export type ImportCanonicalGeoBlocker =
  | "country_code_missing"
  | "country_not_oman"
  | "governorate_missing"
  | "city_missing"
  | "area_missing"
  | "latitude_missing"
  | "longitude_missing"
  | "latitude_invalid"
  | "longitude_invalid"
  | "geo_confidence_missing"
  | "geo_confidence_low"
  | "geo_resolution_not_verified"
  | "geo_not_validated";

export const IMPORT_CANONICAL_GEO_REQUIRED_TABLES = [
  "geo_countries",
  "geo_governorates",
  "geo_cities",
  "geo_areas",
] as const;

export const IMPORT_CANONICAL_OMAN_GEO_SEED_AREAS = [
  "oman",
  "muscat",
  "bausher",
  "al-khuwair",
  "azaiba",
  "seeb",
  "al-khoud",
  "mawaleh",
  "qurum",
  "ruwi",
  "muttrah",
  "amerat",
  "barka",
  "sohar",
  "salalah",
  "nizwa",
  "sur",
  "ibri",
] as const;

const minimumPublishGeoConfidenceScore = 80;

export function isValidLatitude(value: number | null): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number | null): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function isPublishableGeoResolutionStatus(status: ImportGeoResolutionStatus): boolean {
  return status === "verified" || status === "manually_verified";
}

export function getCanonicalGeoBlockers(geo: ImportCanonicalGeo): readonly ImportCanonicalGeoBlocker[] {
  const blockers: ImportCanonicalGeoBlocker[] = [];

  if (geo.country_code === null) blockers.push("country_code_missing");
  else if (geo.country_code !== "om") blockers.push("country_not_oman");

  if (geo.governorate_id === null) blockers.push("governorate_missing");
  if (geo.city_id === null) blockers.push("city_missing");
  if (geo.area_id === null) blockers.push("area_missing");

  if (geo.latitude === null) blockers.push("latitude_missing");
  else if (!isValidLatitude(geo.latitude)) blockers.push("latitude_invalid");

  if (geo.longitude === null) blockers.push("longitude_missing");
  else if (!isValidLongitude(geo.longitude)) blockers.push("longitude_invalid");

  if (geo.geo_confidence_score === null) blockers.push("geo_confidence_missing");
  else if (geo.geo_confidence_score < minimumPublishGeoConfidenceScore) blockers.push("geo_confidence_low");

  if (!isPublishableGeoResolutionStatus(geo.geo_resolution_status)) blockers.push("geo_resolution_not_verified");
  if (geo.geo_validated !== true) blockers.push("geo_not_validated");

  return blockers;
}

export function isCanonicalGeoPublishReady(geo: ImportCanonicalGeo): boolean {
  return getCanonicalGeoBlockers(geo).length === 0;
}
