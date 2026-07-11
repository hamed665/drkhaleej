import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-llm-answer-projection.ts';
const fixturePath = 'fixtures/import/import-llm-answer-projection.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_LLM_ANSWER_PROJECTION.md';
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
  'ImportLlmAnswerProjectionBlocker',
  'ImportLlmAnswerCitation',
  'ImportLlmAnswerProjectionPayload',
  'ImportLlmAnswerProjectionInput',
  'ImportLlmAnswerProjectionResult',
  'getImportLlmAnswerProjectionReadiness',
  'isImportLlmAnswerProjectionReady',
  'llmAnswerProjectionReady',
  'publishReady',
  'sitemapEligible',
]) {
  assert(source.includes(token), `LLM answer projection must include ${token}.`);
}

for (const blocker of [
  'llm_readiness_not_ready',
  'llm_projection_record_missing',
  'llm_projection_route_mismatch',
  'llm_projection_stale',
  'answer_en_missing',
  'answer_ar_missing',
  'citations_missing',
  'evidence_ids_missing',
  'medical_disclaimer_missing',
  'unsafe_claim_present',
  'answer_too_long',
  'source_version_missing',
  'projection_version_missing',
]) {
  assert(source.includes(blocker), `LLM answer blockers must include ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'fetch(',
  'openai',
]) {
  assert(!source.includes(forbidden), `LLM answer projection must not include runtime token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.llmAnswerProjection.v1',
  'LLM answer fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 6, 'fixture must include at least six cases.');

for (const testCase of fixture.cases) {
  const input = testCase.input;
  const ready =
    input.llmReady &&
    input.projectionRecordReady &&
    input.routeMatches &&
    input.answerEnPresent &&
    input.answerArPresent &&
    input.citationsPresent &&
    input.evidenceIdsPresent &&
    input.disclaimersPresent &&
    !input.unsafeClaimPresent &&
    input.withinLengthLimit &&
    input.versionsPresent;
  assert(ready === testCase.expected.llmAnswerProjectionReady, `${testCase.id} has invalid readiness expectation.`);
}

const privateReady = fixture.cases.find((testCase) => testCase.id === 'ready-but-private');
assert(privateReady?.expected.llmAnswerProjectionReady === true, 'fixture must include a ready case.');
assert(privateReady?.expected.publishReady === false, 'ready case must remain publish-blocked.');
assert(privateReady?.expected.sitemapEligible === false, 'ready case must remain sitemap-ineligible.');

for (const token of [
  'LLM answer projection readiness is not publish readiness',
  'LLM answer projection readiness is not sitemap eligibility',
  'No runtime model generation',
  'No database writes',
  'No public routes',
  'No publish mutation',
]) {
  assert(docs.includes(token), `LLM answer docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-llm-answer-projection.mjs';"),
  'publish readiness audit must chain LLM answer projection validator.',
);

console.log('import LLM answer projection check passed.');
