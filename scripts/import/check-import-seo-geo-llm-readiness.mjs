import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-seo-geo-llm-readiness.ts';
const fixturePath = 'fixtures/import/import-seo-geo-llm-readiness.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_SEO_GEO_LLM_READINESS.md';
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
  'ImportSeoGeoLlmReadinessBlocker',
  'ImportSeoGeoLlmReadinessInput',
  'ImportSeoGeoLlmReadiness',
  'IMPORT_SEO_GEO_LLM_REQUIRED_PROJECTION_KINDS',
  'getImportSeoGeoLlmReadiness',
  'isImportSeoGeoLlmCompositionReady',
  'seoReady',
  'geoReady',
  'llmReady',
  'compositionReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `SEO/GEO/LLM readiness contract must include ${token}.`);
}

for (const blocker of [
  'seo_profile_not_ready',
  'keyword_intent_bank_not_ready',
  'geo_authority_not_ready',
  'geo_projection_not_ready',
  'llm_projection_not_ready',
  'llm_answer_target_missing',
  'llm_evidence_missing',
  'llm_safety_review_missing',
  'blocked_or_unsafe_intent',
]) {
  assert(source.includes(blocker), `SEO/GEO/LLM blockers must include ${blocker}.`);
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
  assert(!source.includes(forbidden), `SEO/GEO/LLM readiness must not include runtime token ${forbidden}.`);
}

assert(fixture.schemaVersion === 'drkhaleej.import.seoGeoLlmReadiness.v1', 'fixture schema version is invalid.');
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

for (const testCase of fixture.cases) {
  const input = testCase.input;
  const seoReady = input.seoProfileReady && input.keywordBankReady;
  const geoReady = input.geoAuthorityReady && input.geoProjectionReady;
  const llmReady = seoReady && geoReady && input.llmProjectionReady && input.hasBilingualLlmAnswerTarget && input.hasEvidenceCitations && input.hasRequiredMedicalSafetyReview && !input.blockedOrUnsafeIntent;
  assert(seoReady === testCase.expected.seoReady, `${testCase.id} has invalid SEO expectation.`);
  assert(geoReady === testCase.expected.geoReady, `${testCase.id} has invalid GEO expectation.`);
  assert(llmReady === testCase.expected.llmReady, `${testCase.id} has invalid LLM expectation.`);
  assert((seoReady && geoReady && llmReady) === testCase.expected.compositionReady, `${testCase.id} has invalid composition expectation.`);
}

const privateReady = fixture.cases.find((testCase) => testCase.id === 'all-readiness-green-but-private');
assert(privateReady?.expected.compositionReady === true, 'fixture must include a composition-ready case.');
assert(privateReady?.expected.publishReady === false, 'composition-ready case must remain publish-blocked.');
assert(privateReady?.expected.sitemapEligible === false, 'composition-ready case must remain sitemap-ineligible.');

for (const token of [
  'SEO readiness is not GEO readiness',
  'GEO readiness is not LLM readiness',
  'Composition readiness is not publish readiness',
  'No database writes',
  'No public routes',
  'No sitemap XML',
  'No publish mutation',
]) {
  assert(docs.includes(token), `SEO/GEO/LLM docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-seo-geo-llm-readiness.mjs';"),
  'publish readiness audit must chain the SEO/GEO/LLM validator.',
);

console.log('import SEO GEO LLM readiness check passed.');
