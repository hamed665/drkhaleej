import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workflowPath = '.github/workflows/import-readiness-contract.yml';
const manifestPath = 'fixtures/import/import-readiness-runner.manifest.json';

const workflow = await readFile(path.join(root, workflowPath), 'utf8');
const runner = await readFile(path.join(root, 'scripts/import/run-import-readiness.mjs'), 'utf8');
const manifest = await readFile(path.join(root, manifestPath), 'utf8');

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

function mustNotContain(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include ${token}`);
}

mustContain(workflow, 'Run import readiness contract', 'import readiness workflow');
mustContain(workflow, 'node scripts/import/run-import-readiness.mjs', 'import readiness workflow');
mustContain(runner, manifestPath, 'import readiness runner');

for (const token of [
  'check-imported-hospital-public-hold.mjs',
  'check-first-batch-real-fixture.mjs',
  'generate-first-batch-dry-run-fixture.mjs --check',
  'check-first-batch-generator-bridge-alignment.mjs',
  'check-first-batch-bridge-runtime-preflight.mjs',
  'check-first-batch-bridge-runtime-path-decision.mjs',
  'check-tsx-dependency-implementation-preflight.mjs',
  'check-import-public-release-preflight-contract.mjs',
  'check-import-readiness-combined-smoke.mjs',
  'check-import-readiness-status-after-manifest.mjs',
]) {
  mustNotContain(workflow, token, 'import readiness workflow direct check list');
}

for (const token of [
  'check-import-readiness-runner-manifest.mjs',
  'check-import-readiness-workflow-runner.mjs',
  'check-import-readiness-status-after-manifest.mjs',
  'check-first-batch-bridge-runtime-path-decision.mjs',
  'check-tsx-dependency-implementation-preflight.mjs',
  'check-imported-hospital-public-hold.mjs',
  'check-first-batch-real-fixture.mjs',
  'generate-first-batch-dry-run-fixture.mjs',
  '--check',
  'check-first-batch-generator-bridge-alignment.mjs',
  'check-first-batch-bridge-runtime-preflight.mjs',
  'check-import-public-release-preflight-contract.mjs',
  'check-import-readiness-combined-smoke.mjs',
]) {
  mustContain(manifest, token, 'import readiness runner manifest');
}

console.log('import readiness workflow runner check passed.');
