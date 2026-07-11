import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-nearby-projection-engine.ts';
const fixturePath = 'fixtures/import/import-nearby-projection-engine.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_NEARBY_PROJECTION_ENGINE.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(contractPath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const token of [
  'ImportNearbyRelation',
  'ImportNearbyCandidate',
  'ImportNearbyProjectionEngineInput',
  'ImportNearbyProjectionBlocker',
  'ImportNearbyProjectionEngineResult',
  'getImportNearbyProjectionEngineResult',
  'isImportNearbyProjectionReady',
  'isOmanGeoAuthorityRegistryReady',
  'ImportInternalLinkIntelligenceResult',
  'nearbyProjectionReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `nearby projection engine must include ${token}.`);
}

for (const blocker of [
  'geo_registry_not_ready',
  'source_geo_missing',
  'internal_links_not_ready',
  'entity_projection_not_ready',
  'candidate_missing',
  'self_candidate',
  'domain_mismatch',
  'geo_relation_not_authoritative',
  'distance_not_precomputed',
  'distance_out_of_range',
  'candidate_quality_too_low',
  'candidate_projection_not_ready',
  'candidate_label_missing',
  'candidate_duplicate',
  'candidate_limit_invalid',
]) {
  assert(source.includes(blocker), `nearby projection blockers must include ${blocker}.`);
}

for (const relation of ['same_area', 'nearby_area', 'same_city']) {
  assert(source.includes(relation), `nearby projection relation must include ${relation}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'sitemap.xml',
  'haversine',
  'ST_Distance',
  'navigator.geolocation',
]) {
  assert(!source.includes(forbidden), `nearby projection engine must not include runtime token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.nearbyProjectionEngine.v1',
  'nearby projection fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 6, 'nearby projection fixture must include at least six cases.');

for (const testCase of fixture.cases) {
  const input = testCase.input;
  const ready =
    input.geoRegistryReady &&
    input.sourceGeoReady &&
    input.internalLinksReady &&
    input.entityProjectionReady &&
    input.candidatePresent &&
    input.notSelf &&
    input.sameDomain &&
    input.authoritativeGeoRelation &&
    input.distancePrecomputed &&
    input.distanceInRange &&
    input.qualityReady &&
    input.candidateProjectionReady &&
    input.labelsBilingual &&
    input.notDuplicate &&
    input.candidateLimitValid;
  assert(ready === testCase.expected.nearbyProjectionReady, `${testCase.id} has invalid readiness expectation.`);
}

const privateReady = fixture.cases.find((testCase) => testCase.id === 'ready-but-private');
assert(privateReady?.expected.nearbyProjectionReady === true, 'fixture must include a ready nearby case.');
assert(privateReady?.expected.publishReady === false, 'ready nearby case must remain publish-blocked.');
assert(privateReady?.expected.sitemapEligible === false, 'ready nearby case must remain sitemap-ineligible.');

for (const token of [
  'Nearby projection readiness is not publish readiness',
  'Nearby projection readiness is not sitemap eligibility',
  'No runtime distance calculation',
  'No database writes',
  'No public routes',
  'No sitemap XML',
  'No publish mutation',
]) {
  assert(docs.includes(token), `nearby projection docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-nearby-projection-engine.mjs';"),
  'publish readiness audit must chain nearby projection validator.',
);

console.log('import nearby projection engine check passed.');
