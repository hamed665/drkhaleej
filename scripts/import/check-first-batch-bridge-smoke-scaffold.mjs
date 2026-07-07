import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function requireText(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} missing required token: ${token}`);
}

function rejectText(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} includes blocked token: ${token}`);
}

const smoke = await read('scripts/import/smoke-first-batch-dry-run-bridge.ts');
const manifest = await read('fixtures/import/import-readiness-runner.manifest.json');
const packageJson = await read('package.json');
const preflight = await read('docs/import/TSX_DEPENDENCY_IMPLEMENTATION_PREFLIGHT.md');

for (const token of [
  'pending_tsx_dependency',
  'first-batch-dry-run.input.json',
  'buildFirstBatchDryRunReport',
  'no_go',
]) {
  requireText(smoke, token, 'first batch bridge smoke scaffold');
}

for (const token of [
  'from "../../src/server/admin/import-first-batch-dry-run-bridge"',
  'await readFile(',
  'buildFirstBatchDryRunReport({',
  'report.decision !== "no_go"',
]) {
  rejectText(smoke, token, 'first batch bridge smoke scaffold before tsx implementation');
}

rejectText(packageJson, '"tsx"', 'package json before dependency implementation');
rejectText(manifest, 'smoke-first-batch-dry-run-bridge.ts', 'import readiness manifest before tsx implementation');
requireText(preflight, 'The first-batch generator must remain fixture-only', 'tsx dependency preflight');

console.log('first batch bridge smoke scaffold check passed.');
