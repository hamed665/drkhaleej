import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const statusPath = 'docs/launch/SOFT_LAUNCH_MAIN_STATUS.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, token) {
  if (!source.includes(token)) throw new Error(`${statusPath} must include ${token}`);
}

const source = await readText(statusPath);

for (const token of [
  '# DrKhaleej Soft Launch Main Status',
  'Current state',
  'Crawler and index policy',
  'Launch-core public routes',
  'Preview and utility route families',
  'Provider profile policy',
  'Observability status',
  'Batch-one status',
  'Next recommended PRs',
  'Stop expansion if',
]) {
  assertIncludes(source, token);
}

for (const token of [
  'sitemap is an allowlist',
  'preview routes must not emit JSON-LD',
  'location pages stay noindex and sitemap-excluded',
  'Public profile body must not expose raw implementation-only fields',
  'No batch-one import has been promoted by this status note.',
]) {
  assertIncludes(source, token);
}

console.log('main status doc check passed.');
