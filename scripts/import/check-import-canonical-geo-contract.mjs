import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const geoPath = 'src/server/admin/import-canonical-geo.ts';
const architecturePath = 'docs/platform/DRMUSCAT_IMPORT_READINESS_CONTROLLED_PUBLISHING_ARCHITECTURE_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const geoSource = await readText(geoPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportGeoResolutionStatus',
  '"missing" | "inferred" | "low_confidence" | "verified" | "manually_verified"',
  'export type ImportCanonicalGeo',
  'country_code: string | null',
  'governorate_id: string | null',
  'city_id: string | null',
  'area_id: string | null',
  'latitude: number | null',
  'longitude: number | null',
  'geo_confidence_score: number | null',
  'geo_source: string | null',
  'geo_resolution_status: ImportGeoResolutionStatus',
  'geo_validated: boolean',
  'export type ImportCanonicalGeoBlocker',
  'IMPORT_CANONICAL_GEO_REQUIRED_TABLES',
  'geo_countries',
  'geo_governorates',
  'geo_cities',
  'geo_areas',
  'IMPORT_CANONICAL_OMAN_GEO_SEED_AREAS',
  'muscat',
  'bausher',
  'al-khuwair',
  'azaiba',
  'seeb',
  'al-khoud',
  'mawaleh',
  'qurum',
  'ruwi',
  'muttrah',
  'amerat',
  'barka',
  'sohar',
  'salalah',
  'nizwa',
  'sur',
  'ibri',
  'minimumPublishGeoConfidenceScore = 80',
  'export function isValidLatitude',
  'export function isValidLongitude',
  'export function isPublishableGeoResolutionStatus',
  'export function getCanonicalGeoBlockers',
  'export function isCanonicalGeoPublishReady',
  'country_code_missing',
  'country_not_oman',
  'governorate_missing',
  'city_missing',
  'area_missing',
  'latitude_missing',
  'longitude_missing',
  'geo_confidence_low',
  'geo_resolution_not_verified',
  'geo_not_validated',
]) {
  assertIncludes(geoSource, token, `${geoPath} must include ${token}`);
}

for (const forbiddenToken of [
  'country_code: "om"',
  'geo_validated: true',
  'return true;',
]) {
  assertNotIncludes(geoSource, forbiddenToken, `${geoPath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'PR 4: Canonical Geo',
  'geo_countries',
  'geo_governorates',
  'geo_cities',
  'geo_areas',
  'country_code',
  'governorate_id',
  'city_id',
  'area_id',
  'latitude',
  'longitude',
  'geo_confidence_score',
  'geo_source',
  'geo_resolution_status',
  'geo_validated',
  'missing',
  'inferred',
  'low_confidence',
  'verified',
  'manually_verified',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 4 contract token ${token}`);
}

console.log('import canonical geo contract check passed.');
