import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const fixturePath = 'fixtures/import/oman-geo-authority.seed.json';
const contractPath = 'src/server/admin/import-oman-geo-seed-validation.ts';
const docsPath = 'docs/platform/DRKHALEEJ_OMAN_GEO_SEED_VALIDATION.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fixture = JSON.parse(await readFile(path.join(root, fixturePath), 'utf8'));
const contract = await readFile(path.join(root, contractPath), 'utf8');
const docs = await readFile(path.join(root, docsPath), 'utf8');
const audit = await readFile(path.join(root, auditPath), 'utf8');

assert(fixture.schemaVersion === 'drkhaleej.import.omanGeoAuthoritySeed.v1', 'Oman geo seed schema version is invalid.');
assert(fixture.country?.id === 'om', 'Oman geo seed country must be om.');
assert(Array.isArray(fixture.country.sourceEvidence) && fixture.country.sourceEvidence.length > 0, 'Country source evidence is required.');
assert(Array.isArray(fixture.governorates) && fixture.governorates.length === 11, 'Oman geo seed must contain exactly 11 governorates.');

const governorateSlugs = fixture.governorates.map((item) => item.slug);
assert(new Set(governorateSlugs).size === governorateSlugs.length, 'Governorate slugs must be unique.');

const wilayats = fixture.governorates.flatMap((governorate) =>
  governorate.wilayats.map(([slug, nameEn, nameAr]) => ({slug, nameEn, nameAr, governorate: governorate.slug})),
);
assert(wilayats.length === 63, 'Oman geo seed must contain exactly 63 wilayats.');
assert(new Set(wilayats.map((item) => `${item.governorate}:${item.slug}`)).size === wilayats.length, 'Wilayat slugs must be unique within their governorate.');

for (const governorate of fixture.governorates) {
  assert(governorate.slug && governorate.nameEn && governorate.nameAr, `Governorate ${governorate.slug ?? 'unknown'} requires bilingual names.`);
  assert(Array.isArray(governorate.wilayats) && governorate.wilayats.length > 0, `Governorate ${governorate.slug} requires wilayats.`);
}
for (const wilayat of wilayats) {
  assert(wilayat.slug && wilayat.nameEn && wilayat.nameAr, `Wilayat ${wilayat.slug ?? 'unknown'} requires bilingual names.`);
}

const requiredAreas = [
  'al-khuwair','al-ghubrah','azaiba','qurum','madinat-sultan-qaboos','ruwi','muttrah','al-hail',
  'mawaleh','al-khoud','al-seeb','al-amerat','wadi-kabir','al-wattayah','ghala','al-ansab',
];
assert(Array.isArray(fixture.muscatAreas) && fixture.muscatAreas.length >= requiredAreas.length, 'Muscat area fixture is incomplete.');
const areaIds = new Set(fixture.muscatAreas.map((area) => area.id));
const areaSlugs = new Set(fixture.muscatAreas.map((area) => area.slug));
for (const slug of requiredAreas) assert(areaSlugs.has(slug), `Muscat area seed must include ${slug}.`);

const muscatWilayats = new Set(fixture.governorates.find((item) => item.slug === 'muscat').wilayats.map(([slug]) => slug));
for (const area of fixture.muscatAreas) {
  assert(area.id && area.slug && area.nameEn && area.nameAr, `Area ${area.slug ?? 'unknown'} requires id, slug, and bilingual names.`);
  assert(muscatWilayats.has(area.parentWilayat), `Area ${area.slug} has invalid Muscat wilayat parent ${area.parentWilayat}.`);
  assert(Array.isArray(area.aliases) && area.aliases.length > 0, `Area ${area.slug} requires aliases.`);
  assert(new Set(area.aliases.map((alias) => alias.trim().toLowerCase())).size === area.aliases.length, `Area ${area.slug} aliases must be unique.`);
  assert(!area.nearbyAreaIds.includes(area.id), `Area ${area.slug} must not reference itself as nearby.`);
  for (const nearbyId of area.nearbyAreaIds) assert(areaIds.has(nearbyId), `Area ${area.slug} references unknown nearby area ${nearbyId}.`);
}

assert(fixture.defaults?.boundaryStatus !== 'missing', 'Seed boundary status must be explicit and non-missing.');
assert(fixture.defaults?.authorityStatus === 'draft', 'Actual seed fixture must remain draft before manual review.');
assert(Array.isArray(fixture.defaults?.sourceEvidence) && fixture.defaults.sourceEvidence.length >= 2, 'Seed defaults require source evidence and manual review evidence.');
assert(fixture.defaults.sourceEvidence.includes('drkhaleej-manual-review-required'), 'Seed fixture must require manual review.');

for (const token of [
  'ImportOmanGeoSeedBlocker','ImportOmanGeoSeedSummary','ImportOmanGeoSeedReadiness',
  'IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES','IMPORT_OMAN_GEO_EXPECTED_WILAYATS',
  'IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS','getImportOmanGeoSeedReadiness',
  'databaseWriteReady: false','publicGeoReady: false',
]) assert(contract.includes(token), `Oman geo seed contract must include ${token}.`);

for (const forbidden of ['createSupabaseServiceRoleClient','insert(','update(','delete(','publishEntity']) {
  assert(!contract.includes(forbidden), `Oman geo seed contract must not include mutation token ${forbidden}.`);
}

assert(audit.includes("import './check-import-oman-geo-seed-validation.mjs';"), 'Publish readiness audit must chain Oman geo seed validator.');
for (const token of ['No database writes','No migrations','No public routes','Manual review remains required']) {
  assert(docs.includes(token), `Oman geo seed docs must include ${token}.`);
}

console.log('import Oman geo seed validation check passed.');
