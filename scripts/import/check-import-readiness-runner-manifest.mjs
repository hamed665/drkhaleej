import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'fixtures/import/import-readiness-runner.manifest.json';

const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));
const runner = await readFile(path.join(root, 'scripts/import/run-import-readiness.mjs'), 'utf8');

function check(condition, message) {
  if (!condition) throw new Error(message);
}

check(manifest.schemaVersion === 'drkhaleej.import.readinessRunnerManifest.v1', 'runner manifest schema mismatch');
check(Array.isArray(manifest.checks), 'runner manifest checks must be an array');
check(manifest.checks.length === 14, 'runner manifest must keep the full import-readiness chain');

const expected = [
  ['runner manifest guard', 'scripts/import/check-import-readiness-runner-manifest.mjs'],
  ['workflow runner guard', 'scripts/import/check-import-readiness-workflow-runner.mjs'],
  ['import readiness status after manifest', 'scripts/import/check-import-readiness-status-after-manifest.mjs'],
  ['controlled publish dry-run executor', 'scripts/import/check-import-controlled-publish-dry-run-executor.mjs'],
  ['first batch bridge runtime path decision', 'scripts/import/check-first-batch-bridge-runtime-path-decision.mjs'],
  ['tsx dependency implementation preflight', 'scripts/import/check-tsx-dependency-implementation-preflight.mjs'],
  ['tsx implementation checklist', 'scripts/import/check-tsx-implementation-checklist.mjs'],
  ['hospital public hold', 'scripts/import/check-imported-hospital-public-hold.mjs'],
  ['first batch dry-run fixture', 'scripts/import/check-first-batch-real-fixture.mjs'],
  ['generated first batch dry-run fixture', 'scripts/import/generate-first-batch-dry-run-fixture.mjs'],
  ['first batch generator bridge alignment', 'scripts/import/check-first-batch-generator-bridge-alignment.mjs'],
  ['first batch bridge runtime preflight', 'scripts/import/check-first-batch-bridge-runtime-preflight.mjs'],
  ['import public release preflight', 'scripts/import/check-import-public-release-preflight-contract.mjs'],
  ['combined smoke', 'scripts/import/check-import-readiness-combined-smoke.mjs'],
];

const labels = new Set();
const scripts = new Set();

manifest.checks.forEach((item, index) => {
  const [expectedLabel, expectedScript] = expected[index];
  check(item.label === expectedLabel, `unexpected check label at position ${index + 1}`);
  check(Array.isArray(item.command), `${item.label} command must be an array`);
  check(item.command[0] === expectedScript, `${item.label} command script mismatch`);
  check(!labels.has(item.label), `duplicate check label: ${item.label}`);
  check(!scripts.has(item.command[0]), `duplicate check script: ${item.command[0]}`);
  labels.add(item.label);
  scripts.add(item.command[0]);
});

const generatedFixtureCheck = manifest.checks.find((item) => item.label === 'generated first batch dry-run fixture');
check(generatedFixtureCheck.command.includes('--check'), 'generated first batch dry-run fixture must run in check mode');
check(runner.includes(manifestPath), 'runner must read the manifest');
check(!runner.includes('const checks = ['), 'runner must not keep a hard-coded checks array');

console.log('import readiness runner manifest check passed.');
