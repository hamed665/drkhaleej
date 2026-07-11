import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-keyword-intent-bank.ts';
const fixturePath = 'fixtures/import/import-keyword-intent-bank.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_KEYWORD_INTENT_BANK.md';
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
  'ImportKeywordLanguage',
  'ImportKeywordPriority',
  'ImportKeywordRisk',
  'ImportKeywordDecision',
  'ImportKeywordRouteStatus',
  'ImportKeywordRouteFamily',
  'ImportKeywordIntentType',
  'ImportKeywordIntentRecord',
  'ImportKeywordIntentBankManifest',
  'ImportKeywordIntentBankBlocker',
  'getImportKeywordIntentBankBlockers',
  'isImportKeywordIntentBankReady',
]) {
  assert(source.includes(token), `keyword intent bank contract must include ${token}.`);
}

for (const blocker of [
  'schema_version_invalid',
  'source_hash_invalid',
  'row_count_invalid',
  'language_balance_invalid',
  'duplicate_keywords_present',
  'locale_parity_missing',
  'persian_content_present',
  'record_invalid',
  'runtime_import_enabled',
  'runtime_route_enabled',
]) {
  assert(source.includes(blocker), `keyword intent bank blockers must include ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'generateMetadata(',
]) {
  assert(!source.includes(forbidden), `keyword intent bank must not include runtime token ${forbidden}.`);
}

assert(fixture.schemaVersion === 'drkhaleej.import.keywordIntentBank.v1', 'fixture schema version is invalid.');
assert(fixture.sourceFile === 'drkhaleej-seo-keyword-universe-master-v1.2-completed.xlsx', 'fixture source file is invalid.');
assert(/^[a-f0-9]{64}$/.test(fixture.sourceSha256), 'fixture source hash is invalid.');
assert(fixture.totalRows === 1532, 'fixture total row count must match reviewed workbook.');
assert(fixture.englishRows === 766 && fixture.arabicRows === 766, 'fixture language counts must remain balanced.');
assert(fixture.exactDuplicateCount === 0, 'fixture must report zero exact duplicates.');
assert(fixture.missingLocaleParityCount === 0, 'fixture must report zero missing locale pairs.');
assert(fixture.persianCharacterHitCount === 0, 'fixture must report zero Persian content.');
assert(Array.isArray(fixture.records) && fixture.records.length >= 4, 'fixture must include representative records.');

const keywordKeys = new Set();
for (const record of fixture.records) {
  const key = `${record.language}:${record.keyword.trim().toLowerCase()}`;
  assert(!keywordKeys.has(key), `fixture contains duplicate keyword ${key}.`);
  keywordKeys.add(key);
  assert(record.routeStatus === 'planning_only', `fixture record ${record.id} must remain planning-only.`);
  assert(['DO_NOT_IMPORT_YET', 'blocked'].includes(record.importDecision), `fixture record ${record.id} must remain fail-closed.`);
  if (record.routeFamily === 'blocked') {
    assert(record.urlCandidate === 'blocked', `blocked fixture record ${record.id} must not have a route.`);
  } else {
    assert(record.urlCandidate.startsWith(`/${record.language}/om/`), `fixture record ${record.id} locale path is invalid.`);
  }
}

for (const token of [
  'Planning data only',
  'No database writes',
  'No public routes',
  'No sitemap eligibility',
  'No publish mutation',
  'English and Arabic only',
]) {
  assert(docs.includes(token), `keyword intent bank docs must include ${token}.`);
}

assert(
  audit.includes("import './check-import-keyword-intent-bank.mjs';"),
  'publish readiness audit must chain the keyword intent bank validator.',
);

console.log('import keyword intent bank check passed.');
