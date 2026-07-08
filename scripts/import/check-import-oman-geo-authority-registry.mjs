import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-oman-geo-authority-registry.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await readText(contractPath);
const auditSource = await readText(auditPath);

for (const requiredToken of [
  'OmanGeoAuthorityRegistry',
  'OmanGeoAuthorityEntry',
  'OmanGeoAuthorityAlias',
  'OmanGeoAuthorityBoundary',
  'OmanGeoAuthorityRegistryBlocker',
  'OMAN_GEO_AUTHORITY_EXPECTED_COUNTRY_CODE',
  'OMAN_GEO_AUTHORITY_EXPECTED_GOVERNORATE_COUNT',
  'OMAN_GEO_AUTHORITY_EXPECTED_WILAYAT_COUNT',
  'OMAN_GOVERNORATE_SLUGS',
  'OMAN_WILAYAT_SLUGS_BY_GOVERNORATE',
  'OMAN_MUSCAT_REQUIRED_AREA_SEED_SLUGS',
  'OMAN_GEO_AUTHORITY_REQUIRED_TABLES',
  'normalizeOmanGeoAlias',
  'getExpectedOmanWilayatCount',
  'getOmanGeoAuthorityRegistryBlockers',
  'isOmanGeoAuthorityRegistryReady',
]) {
  assert(source.includes(requiredToken), `Oman geo authority registry contract must include ${requiredToken}.`);
}

for (const governorate of [
  'muscat',
  'dhofar',
  'musandam',
  'al-buraimi',
  'al-dakhiliyah',
  'al-dhahirah',
  'north-al-batinah',
  'south-al-batinah',
  'north-ash-sharqiyah',
  'south-ash-sharqiyah',
  'al-wusta',
]) {
  assert(source.includes(governorate), `Oman geo authority registry must include governorate ${governorate}.`);
}

for (const muscatArea of [
  'al-khuwair',
  'al-ghubrah',
  'azaiba',
  'qurum',
  'madinat-sultan-qaboos',
  'ruwi',
  'al-hail',
  'mawaleh',
  'al-khoud',
  'ghala',
]) {
  assert(source.includes(muscatArea), `Oman geo authority registry must seed Muscat area ${muscatArea}.`);
}

for (const blocker of [
  'country_missing',
  'governorate_count_incomplete',
  'wilayat_count_incomplete',
  'canonical_slug_missing',
  'canonical_slug_duplicate',
  'arabic_name_missing',
  'english_name_missing',
  'parent_missing',
  'alias_normalization_missing',
  'boundary_status_missing',
  'source_evidence_missing',
  'muscat_area_seed_incomplete',
]) {
  assert(source.includes(blocker), `Oman geo authority registry blockers must include ${blocker}.`);
}

for (const forbidden of ['public_indexable_entities', 'publishEntity', 'insert(', 'update(', 'delete(']) {
  assert(!source.includes(forbidden), `Oman geo authority registry must not include runtime publish or mutation token ${forbidden}.`);
}

assert(
  auditSource.includes("import './check-import-oman-geo-authority-registry.mjs';"),
  'publish readiness audit must chain the Oman geo authority registry validator.',
);

console.log('import Oman geo authority registry check passed.');
