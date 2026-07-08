import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

function mustNotContain(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include ${token}`);
}

function mustNotMatch(source, pattern, label) {
  if (pattern.test(source)) throw new Error(`${label} must not match ${pattern}`);
}

const doc = await readText('docs/import/first-batch-bridge-runtime-preflight.md');
const generator = await readText('scripts/import/generate-first-batch-dry-run-fixture.mjs');
const packageJson = await readText('package.json');
const manifest = await readText('fixtures/import/import-readiness-runner.manifest.json');

for (const token of [
  '# First Batch Bridge Runtime Preflight',
  'src/server/admin/import-first-batch-dry-run-bridge.ts',
  'scripts/import/generate-first-batch-dry-run-fixture.mjs',
  '--bridge-contract',
  'add a pinned TypeScript execution dependency such as `tsx`',
  'compile the bridge to JavaScript before the fixture check',
  'move the reusable dry-run bridge logic into a plain JavaScript module',
  'generator must stay fixture-only',
  'demonstrates the chosen runtime path in CI',
]) {
  mustContain(doc, token, 'first batch bridge runtime preflight docs');
}

for (const token of [
  'bridgeContract',
  '--bridge-contract',
  'Keep this generator fixture-only until Node can execute the TypeScript bridge directly in CI.',
]) {
  mustContain(generator, token, 'first batch fixture generator');
}

for (const pattern of [
  /from\s+['"][^'"]*import-first-batch-dry-run-bridge['"]/, 
  /import\(\s*['"][^'"]*import-first-batch-dry-run-bridge['"]\s*\)/,
  /require\(\s*['"][^'"]*import-first-batch-dry-run-bridge['"]\s*\)/,
  /buildFirstBatchDryRunReport\s*\(/,
]) {
  mustNotMatch(generator, pattern, 'fixture-only generator runtime import');
}

for (const token of ['"tsx"', '"ts-node"', '"tsimp"', '"esbuild-register"']) {
  mustNotContain(packageJson, token, 'package TypeScript script runner state');
}

for (const token of [
  'first batch bridge runtime preflight',
  'scripts/import/check-first-batch-bridge-runtime-preflight.mjs',
  'combined smoke',
  'scripts/import/check-import-readiness-combined-smoke.mjs',
]) {
  mustContain(manifest, token, 'import readiness runner manifest');
}

console.log('first batch bridge runtime preflight check passed.');
