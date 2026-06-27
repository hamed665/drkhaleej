import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sitemapPath = 'src/server/public/import-sitemap.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const sitemapSource = await readText(sitemapPath);
const packageSource = await readText('package.json');

for (const token of [
  'type InternalImportSitemapEntry = PublicImportSitemapEntry &',
  'const publicImportSitemapFamilyCaps = {',
  'doctor: 3000,',
  'pharmacy: 1500,',
  'hospital: 500,',
  'satisfies Record<SupportedImportSitemapEntityType, number>',
  'const publicImportSitemapLimit = Object.values(publicImportSitemapFamilyCaps).reduce',
  'function emptyFamilyCounters():',
  'function applyFamilyCaps(entries: readonly InternalImportSitemapEntry[]):',
  'familyCounts[entry.entityType] >= publicImportSitemapFamilyCaps[entry.entityType]',
  'familyCounts[entry.entityType] += 1;',
  'return applyFamilyCaps(entries);',
  'filter((entry): entry is InternalImportSitemapEntry => entry !== null)',
]) {
  assertIncludes(sitemapSource, token, `${sitemapPath} must include ${token}`);
}

for (const token of [
  '^\\/(en|ar)\\/om\\/doctor\\/',
  '^\\/(en|ar)\\/om\\/pharmacies\\/',
  '^\\/(en|ar)\\/om\\/hospitals\\/',
  'hasReviewedImportEvidence',
  '.select("id, target_entity_type, updated_at, metadata")',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  assertIncludes(sitemapSource, token, `${sitemapPath} must preserve reviewed sitemap token ${token}`);
}

for (const forbiddenToken of [
  'booking',
  'insurance',
  'claim',
  'provider-dashboard',
  'rating',
]) {
  assertNotIncludes(sitemapSource, forbiddenToken, `${sitemapPath} must not include ${forbiddenToken}.`);
}

for (const packageToken of [
  'import:sitemap-family-caps:validate',
  'scripts/import/check-import-sitemap-family-caps.mjs',
  'pnpm import:sitemap-family-caps:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import sitemap family caps check passed.');
