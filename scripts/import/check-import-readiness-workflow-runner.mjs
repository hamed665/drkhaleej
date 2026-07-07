import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workflowPath = '.github/workflows/import-readiness-contract.yml';

const workflow = await readFile(path.join(root, workflowPath), 'utf8');
const runner = await readFile(path.join(root, 'scripts/import/run-import-readiness.mjs'), 'utf8');

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

function mustNotContain(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include ${token}`);
}

mustContain(workflow, 'Run import readiness contract', 'import readiness workflow');
mustContain(workflow, 'node scripts/import/run-import-readiness.mjs', 'import readiness workflow');

for (const token of [
  'check-imported-hospital-public-hold.mjs',
  'check-first-batch-real-fixture.mjs',
  'generate-first-batch-dry-run-fixture.mjs --check',
  'check-first-batch-generator-bridge-alignment.mjs',
  'check-first-batch-bridge-runtime-preflight.mjs',
  'check-import-public-release-preflight-contract.mjs',
  'check-import-readiness-combined-smoke.mjs',
]) {
  mustNotContain(workflow, token, 'import readiness workflow direct check list');
}

for (const token of [
  'check-imported-hospital-public-hold.mjs',
  'check-first-batch-real-fixture.mjs',
  'generate-first-batch-dry-run-fixture.mjs',
  '--check',
  'check-first-batch-generator-bridge-alignment.mjs',
  'check-first-batch-bridge-runtime-preflight.mjs',
  'check-import-public-release-preflight-contract.mjs',
  'check-import-readiness-combined-smoke.mjs',
]) {
  mustContain(runner, token, 'import readiness runner');
}

console.log('import readiness workflow runner check passed.');
