import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-seo-profile-contract.ts';
const fixturePath = 'fixtures/import/import-seo-profile-contract.fixture.json';
const docsPath = 'docs/platform/DRMUSCAT_SEO_PROFILE_CONTRACT.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(contractPath);
const docs = await readText(docsPath);
const audit = await readText(auditPath);
const fixture = JSON.parse(await readText(fixturePath));

for (const token of [
  'ImportSeoProfileBlocker',
  'ImportSeoProfileReadinessInput',
  'ImportSeoProfileReadiness',
  'IMPORT_SEO_PROFILE_REQUIRED_PROJECTION_KINDS',
  'getUnifiedDraftEntityBlockers',
  'getImportPublicationValidationBlockers',
  'getImportPerformanceBlockers',
  'getImportSeoProfileReadiness',
  'isImportSeoProfileReady',
  'seoProfileReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `SEO profile contract must include ${token}.`);
}

for (const blocker of [
  'unified_draft_not_ready',
  'entity_domain_or_type_not_ready',
  'canonical_geo_not_ready',
  'source_evidence_not_ready',
  'duplicate_guard_not_ready',
  'publication_validation_not_ready',
  'public_projection_not_ready',
  'performance_budget_not_ready',
]) {
  assert(source.includes(blocker), `SEO profile blockers must include ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'sitemap.xml',
]) {
  assert(!source.includes(forbidden), `SEO profile contract must not include runtime mutation token ${forbidden}.`);
}

assert(
  audit.includes("import './check-import-seo-profile-contract.mjs';"),
  'publish readiness audit must chain the SEO profile validator.',
);

for (const token of [
  'SEO profile readiness is not publish readiness',
  'SEO profile readiness is not sitemap eligibility',
  'No database writes',
  'No public routes',
  'No sitemap XML',
  'No publish mutation',
]) {
  assert(docs.includes(token), `SEO profile docs must include ${token}.`);
}

assert(
  fixture.schemaVersion === 'drmuscat.import.seoProfileContract.v1',
  'SEO profile fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'SEO profile fixture must include at least four cases.');

for (const testCase of fixture.cases) {
  const values = Object.values(testCase.dependencies);
  const computedSeoReady = values.every((value) => value === true);
  assert(
    computedSeoReady === testCase.expected.seoProfileReady,
    `SEO profile fixture case ${testCase.id} has inconsistent readiness expectation.`,
  );
}

const separationCase = fixture.cases.find((testCase) => testCase.id === 'seo-ready-not-publish-ready');
assert(separationCase, 'SEO profile fixture must include the separation case.');
assert(separationCase.expected.seoProfileReady === true, 'separation case must be SEO-ready.');
assert(separationCase.expected.publishReady === false, 'separation case must remain publish-blocked.');
assert(separationCase.expected.sitemapEligible === false, 'separation case must remain sitemap-ineligible.');

console.log('import SEO profile contract check passed.');
