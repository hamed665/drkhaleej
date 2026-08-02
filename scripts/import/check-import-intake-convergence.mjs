import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  module: 'src/server/admin/import-intake-convergence.ts',
  tests: 'src/server/admin/import-intake-convergence.test.ts',
  contract: 'docs/import/INTAKE_CONTRACT_CONVERGENCE.md',
  audit: 'scripts/import/check-import-publish-readiness-audit.mjs',
};

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sources = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readText(file)])),
);

for (const token of [
  'drkhaleej.import.intake.v1',
  'convergeImportIntake',
  'normalizeManualImport',
  'normalizeCsvImport',
  'normalizeExcelImport',
  'normalizeApiImport',
  'normalizeAiAssistedImport',
  'evidence_reference_count_exceeded',
  'schema_version_unsupported',
  'readyForValidation',
  'draft: ImportUnifiedDraftEntity | null',
  'directEntityWriteAllowed: false',
  'selectFirstPrivatePublishFamily',
  'family_evidence_missing',
  'family_score_tie',
  'no_family_ready',
]) {
  assert(sources.module.includes(token), `${files.module} must include ${token}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  '.insert(',
  '.update(',
  '.delete(',
  '.upsert(',
  '.rpc(',
  'publishEntity',
  'authorizePublish',
]) {
  assert(!sources.module.includes(forbidden), `${files.module} must not include mutation token ${forbidden}.`);
}

for (const sourceName of ['manual', 'csv', 'excel', 'api', 'ai_assisted']) {
  assert(sources.tests.includes(`\"${sourceName}\"`), `${files.tests} must verify ${sourceName} source identity.`);
}

for (const token of [
  'Execution Phase: 9',
  'Lock Scope: 10',
  'Product Module: 6',
  'SOURCE-EVIDENCE-LEDGER',
  'No Migration',
  'No Worker or Agent runtime',
  'Production remains disconnected',
]) {
  assert(sources.contract.includes(token), `${files.contract} must include ${token}.`);
}

assert(sources.tests.includes('toBe("pharmacy")'), `${files.tests} must preserve the current family-selection evidence.`);
assert(sources.tests.includes('toBe("needs_review")'), `${files.tests} must prove the AI-assisted review boundary.`);
assert(sources.audit.includes("import './check-import-intake-convergence.mjs';"), `${files.audit} must chain intake convergence validation.`);

console.log('import intake convergence check passed.');
