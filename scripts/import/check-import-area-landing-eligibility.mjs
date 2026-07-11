import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-area-landing-eligibility.ts';
const fixturePath = 'fixtures/import/import-area-landing-eligibility.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_AREA_LANDING_ELIGIBILITY.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = await readFile(path.join(root, contractPath), 'utf8');
const fixture = JSON.parse(await readFile(path.join(root, fixturePath), 'utf8'));
const docs = await readFile(path.join(root, docsPath), 'utf8');
const audit = await readFile(path.join(root, auditPath), 'utf8');

for (const token of [
  'ImportAreaLandingEligibilityBlocker',
  'ImportAreaLandingEligibilityInput',
  'ImportAreaLandingEligibilityResult',
  'IMPORT_AREA_LANDING_MIN_VERIFIED_PROVIDERS',
  'IMPORT_AREA_LANDING_MIN_DISTINCT_SPECIALTIES',
  'IMPORT_AREA_LANDING_MIN_UNIQUE_LOCAL_FACTS',
  'getImportAreaLandingEligibility',
  'isImportAreaLandingEligible',
  'areaLandingEligible',
  'publishReady',
  'sitemapEligible',
]) {
  assert(contract.includes(token), `Area landing eligibility contract must include ${token}.`);
}

for (const blocker of [
  'geo_seed_not_ready',
  'canonical_area_missing',
  'area_projection_not_ready',
  'page_value_not_ready',
  'internal_links_not_ready',
  'nearby_projection_not_ready',
  'bilingual_keyword_target_missing',
  'verified_provider_density_below_minimum',
  'distinct_specialty_coverage_below_minimum',
  'unique_local_fact_coverage_below_minimum',
  'duplicate_area_risk',
  'manual_review_missing',
]) {
  assert(contract.includes(blocker), `Area landing blockers must include ${blocker}.`);
}

for (const forbidden of ['createSupabaseServiceRoleClient', 'insert(', 'update(', 'delete(', 'publishEntity', 'sitemap.xml']) {
  assert(!contract.includes(forbidden), `Area landing eligibility must not include runtime mutation token ${forbidden}.`);
}

assert(fixture.schemaVersion === 'drkhaleej.import.areaLandingEligibility.v1', 'Area landing fixture schema version is invalid.');
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'Area landing fixture must include at least four cases.');
const separationCase = fixture.cases.find((item) => item.id === 'eligible-but-private');
assert(separationCase?.expected.areaLandingEligible === true, 'Separation case must be area-eligible.');
assert(separationCase?.expected.publishReady === false, 'Separation case must remain publish-blocked.');
assert(separationCase?.expected.sitemapEligible === false, 'Separation case must remain sitemap-ineligible.');

for (const token of [
  'Area landing eligibility is not publish readiness',
  'Area landing eligibility is not sitemap eligibility',
  'No database writes',
  'No public routes',
  'No sitemap changes',
  'No publish mutation',
]) {
  assert(docs.includes(token), `Area landing docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-area-landing-eligibility.mjs';"),
  'Publish readiness audit must chain the area landing eligibility validator.',
);

console.log('import area landing eligibility check passed.');
