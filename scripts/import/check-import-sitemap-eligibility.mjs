import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-sitemap-eligibility-2026.ts';
const legacyContractPath = 'src/server/admin/import-sitemap-eligibility-contract.ts';
const existingAdminPath = 'src/server/admin/import-sitemap-eligibility.ts';
const fixturePath = 'fixtures/import/import-sitemap-eligibility-2026.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_SITEMAP_ELIGIBILITY_2026.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = await readText(contractPath);
const legacyContract = await readText(legacyContractPath);
const existingAdmin = await readText(existingAdminPath);
const docs = await readText(docsPath);
const fixture = JSON.parse(await readText(fixturePath));

for (const token of [
  'ImportSitemap2026PageClass',
  'ImportSitemapEligibility2026Input',
  'ImportSitemapEligibility2026Blocker',
  'ImportSitemapEligibility2026Result',
  'IMPORT_SITEMAP_2026_VALIDATED_PROJECTION',
  'IMPORT_SITEMAP_2026_FILES',
  'getImportSitemapEligibility2026',
  'isImportSitemapEligible2026',
  'public_indexable_entities',
]) {
  assert(contract.includes(token), `Sitemap Eligibility 2026 contract must include ${token}.`);
}

for (const blocker of [
  'visibility_not_public',
  'index_policy_not_index',
  'sitemap_policy_not_included',
  'publish_not_ready',
  'seo_profile_not_ready',
  'page_value_not_ready',
  'internal_links_not_ready',
  'area_landing_not_eligible',
  'public_projection_not_ready',
  'schema_projection_not_ready',
  'performance_budget_not_ready',
  'duplicate_check_not_passed',
  'manual_approval_missing',
  'canonical_path_missing',
  'canonical_route_mismatch',
]) {
  assert(contract.includes(blocker), `Sitemap Eligibility 2026 blockers must include ${blocker}.`);
}

for (const sitemapFile of [
  '/sitemaps/doctors.xml',
  '/sitemaps/pharmacies.xml',
  '/sitemaps/hospitals.xml',
  '/sitemaps/clinics.xml',
  '/sitemaps/dental.xml',
  '/sitemaps/beauty.xml',
  '/sitemaps/pet.xml',
  '/sitemaps/locations.xml',
  '/sitemaps/articles.xml',
]) {
  assert(contract.includes(sitemapFile), `Sitemap Eligibility 2026 must preserve family file ${sitemapFile}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'generateSitemapXml',
]) {
  assert(!contract.includes(forbidden), `Sitemap Eligibility 2026 must not include runtime mutation token ${forbidden}.`);
}

for (const token of [
  'ImportSitemapEligibilityEntity',
  'getSitemapBlockers',
  'isSitemapEligible',
]) {
  assert(legacyContract.includes(token), `Legacy sitemap compatibility contract must preserve ${token}.`);
}

for (const token of [
  'listAdminImportSitemapEligibleCandidates',
  'requireAdminPermission("imports.read")',
  'sitemapIncluded: false',
]) {
  assert(existingAdmin.includes(token), `Existing admin sitemap read model must preserve ${token}.`);
}

for (const token of [
  'replaces the old boolean-only sitemap authority',
  'public_indexable_entities',
  'publishReady',
  'sitemapEligible',
  'No sitemap XML',
  'No database write or migration',
  'No publish mutation',
]) {
  assert(docs.includes(token), `Sitemap Eligibility 2026 docs must include ${token}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.sitemapEligibility2026.v1',
  'Sitemap Eligibility 2026 fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 5, 'Sitemap Eligibility 2026 fixture must include at least five cases.');

for (const testCase of fixture.cases) {
  const dependencies = testCase.dependencies;
  const required = [
    dependencies.visibilityPublic,
    dependencies.indexPolicyIndex,
    dependencies.sitemapPolicyIncluded,
    dependencies.publishReady,
    dependencies.seoProfileReady,
    dependencies.pageValueReady,
    dependencies.internalLinksReady,
    dependencies.publicProjectionReady,
    dependencies.schemaProjectionReady,
    dependencies.performanceBudgetReady,
    dependencies.duplicateCheckPassed,
    dependencies.manualApprovalComplete,
    dependencies.canonicalRouteAligned,
  ];
  if (testCase.pageClass === 'area_landing') required.push(dependencies.areaLandingEligible);
  const computed = required.every((value) => value === true);
  assert(
    computed === testCase.expected.sitemapEligible,
    `Sitemap Eligibility 2026 fixture case ${testCase.id} has inconsistent expectation.`,
  );
}

const privateCase = fixture.cases.find((item) => item.id === 'area-eligible-but-private');
assert(privateCase?.expected.sitemapEligible === false, 'Eligible area fixture must remain sitemap-ineligible while private.');

console.log('import Sitemap Eligibility 2026 check passed.');
