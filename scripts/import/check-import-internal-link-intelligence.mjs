import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-internal-link-intelligence.ts';
const fixturePath = 'fixtures/import/import-internal-link-intelligence.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_INTERNAL_LINK_INTELLIGENCE_2026.md';
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
  'ImportInternalLinkIntelligenceBlocker',
  'ImportInternalLinkIntelligenceInput',
  'ImportInternalLinkIntelligenceResult',
  'getImportInternalLinkIntelligence',
  'isImportInternalLinkIntelligenceReady',
  'internalLinksReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `internal link intelligence must include ${token}.`);
}

for (const blocker of [
  'page_value_not_ready',
  'internal_links_projection_not_ready',
  'cache_rows_missing',
  'cache_row_stale',
  'duplicate_target',
  'self_link_detected',
  'anchor_language_missing',
  'target_not_public_projection_ready',
  'target_quality_too_low',
  'link_group_over_capacity',
]) {
  assert(source.includes(blocker), `internal link intelligence blockers must include ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'sitemap.xml',
]) {
  assert(!source.includes(forbidden), `internal link intelligence must not include runtime mutation token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.internalLinkIntelligence.v1',
  'internal link intelligence fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 5, 'fixture must include at least five cases.');

for (const testCase of fixture.cases) {
  const input = testCase.input;
  const ready =
    input.pageValueReady &&
    input.internalLinksProjectionReady &&
    input.cacheRowsPresent &&
    input.cacheFresh &&
    !input.hasSelfLink &&
    !input.hasDuplicateTarget &&
    input.anchorsBilingual &&
    input.targetsProjectionReady &&
    input.targetQualityReady &&
    input.withinGroupCapacity;
  assert(ready === testCase.expected.internalLinksReady, `${testCase.id} has invalid readiness expectation.`);
}

const privateReady = fixture.cases.find((testCase) => testCase.id === 'ready-but-private');
assert(privateReady?.expected.internalLinksReady === true, 'fixture must include a ready case.');
assert(privateReady?.expected.publishReady === false, 'ready case must remain publish-blocked.');
assert(privateReady?.expected.sitemapEligible === false, 'ready case must remain sitemap-ineligible.');

for (const token of [
  'Internal link readiness is not publish readiness',
  'Internal link readiness is not sitemap eligibility',
  'No database writes',
  'No public routes',
  'No sitemap XML',
  'No publish mutation',
]) {
  assert(docs.includes(token), `internal link docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-internal-link-intelligence.mjs';"),
  'publish readiness audit must chain internal link intelligence validator.',
);

console.log('import internal link intelligence check passed.');
