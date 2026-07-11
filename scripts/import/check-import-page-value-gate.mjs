import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-page-value-gate.ts';
const fixturePath = 'fixtures/import/import-page-value-gate.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_PAGE_VALUE_GATE.md';
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
  'ImportPageValuePageClass',
  'ImportPageValueMetrics',
  'ImportPageValueGateInput',
  'ImportPageValueBlocker',
  'ImportPageValueGateResult',
  'IMPORT_PAGE_VALUE_MIN_UNIQUE_FACTS',
  'IMPORT_PAGE_VALUE_MIN_SOURCE_EVIDENCE',
  'IMPORT_PAGE_VALUE_MIN_CONTENT_COMPLETENESS_PERCENT',
  'IMPORT_PAGE_VALUE_MAX_DUPLICATE_SIMILARITY_PERCENT',
  'IMPORT_PAGE_VALUE_MIN_GEO_SPECIFICITY_SCORE',
  'IMPORT_PAGE_VALUE_MIN_ACTIONABLE_CONTACT_FIELDS',
  'IMPORT_PAGE_VALUE_MIN_INTERNAL_LINKS',
  'IMPORT_PAGE_VALUE_MAX_TEMPLATED_CONTENT_RATIO_PERCENT',
  'IMPORT_PAGE_VALUE_MIN_PROVIDER_COVERAGE_BY_CLASS',
  'getImportPageValueGate',
  'isImportPageValueReady',
  'pageValueReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `Page value gate must include ${token}.`);
}

for (const blocker of [
  'composition_not_ready',
  'content_projection_not_ready',
  'insufficient_unique_facts',
  'insufficient_source_evidence',
  'content_completeness_below_minimum',
  'duplicate_similarity_above_maximum',
  'geo_specificity_below_minimum',
  'actionable_contact_missing',
  'internal_link_value_below_minimum',
  'templated_content_ratio_above_maximum',
  'verified_provider_coverage_below_minimum',
  'thin_page_risk',
]) {
  assert(source.includes(blocker), `Page value blockers must include ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'generateMetadata(',
  'sitemap.xml',
]) {
  assert(!source.includes(forbidden), `Page value gate must not include runtime token ${forbidden}.`);
}

assert(fixture.schemaVersion === 'drkhaleej.import.pageValueGate.v1', 'fixture schema version is invalid.');
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 5, 'fixture must include at least five cases.');

const minimumCoverageByClass = {
  entity_profile: 1,
  specialty_directory: 3,
  service_directory: 3,
  area_landing: 5,
  guide: 1,
};

for (const testCase of fixture.cases) {
  const m = testCase.metrics;
  const ready =
    testCase.compositionReady &&
    testCase.contentProjectionReady &&
    m.verifiedUniqueFactCount >= 6 &&
    m.sourceEvidenceCount >= 2 &&
    m.contentCompletenessPercent >= 70 &&
    m.duplicateSimilarityPercent <= 35 &&
    m.geoSpecificityScore >= 60 &&
    m.actionableContactFieldCount >= 1 &&
    m.usefulInternalLinkCount >= 3 &&
    m.templatedContentRatioPercent <= 65 &&
    m.verifiedProviderCoverageCount >= minimumCoverageByClass[testCase.pageClass] &&
    m.thinPageRisk === false;
  assert(ready === testCase.expected.pageValueReady, `${testCase.id} has invalid page value expectation.`);
}

const privateReady = fixture.cases.find((testCase) => testCase.id === 'valuable-private-entity-profile');
assert(privateReady?.expected.pageValueReady === true, 'fixture must include a page-value-ready case.');
assert(privateReady?.expected.publishReady === false, 'page-value-ready case must remain publish-blocked.');
assert(privateReady?.expected.sitemapEligible === false, 'page-value-ready case must remain sitemap-ineligible.');

for (const token of [
  'Page value readiness is not publish readiness',
  'Page value readiness is not sitemap eligibility',
  'No database writes',
  'No public routes',
  'No sitemap XML',
  'No publish mutation',
]) {
  assert(docs.includes(token), `Page value docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-page-value-gate.mjs';"),
  'publish readiness audit must chain the page value validator.',
);

console.log('import page value gate check passed.');
