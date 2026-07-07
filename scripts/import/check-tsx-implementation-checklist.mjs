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

const checklist = await read('docs/import/TSX_IMPLEMENTATION_CHECKLIST.md');
const packageJson = await read('package.json');
const preflight = await read('docs/import/TSX_DEPENDENCY_IMPLEMENTATION_PREFLIGHT.md');
const vercelRule = await read('docs/import/VERCEL_SAFE_IMPORT_SCAFFOLD_RULE.md');

for (const token of [
  '# TSX Implementation Checklist',
  'pnpm add -D tsx',
  'Do not edit `pnpm-lock.yaml` by hand.',
  '`package.json` with `tsx` in dev dependencies',
  '`pnpm-lock.yaml` with the generated lockfile entries',
  '`scripts/import/smoke-first-batch-dry-run-bridge.ts` restored as an executable smoke',
  'imported hospital public hold remains active',
  'hospital sitemap URL count remains zero',
  'no public route is opened',
  'If `package.json` contains `tsx`',
]) {
  requireText(checklist, token, 'tsx implementation checklist');
}

rejectText(packageJson, '"tsx"', 'package json before tsx implementation');
requireText(preflight, 'selected bridge runtime path: `tsx`', 'tsx dependency preflight');
requireText(vercelRule, 'Until the `tsx` dependency and lockfile are added together', 'vercel-safe scaffold rule');

console.log('tsx implementation checklist check passed.');
