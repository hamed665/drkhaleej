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
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy";',
  'target_entity_type: string;',
  'supportedEntityType(row.target_entity_type)',
  'isSafePublicCanonicalPathForEntity',
  'case "doctor":',
  'case "pharmacy":',
  '^\\/(en|ar)\\/om\\/doctor\\/',
  '^\\/(en|ar)\\/om\\/pharmacies\\/',
  'hasReviewedImportEvidence',
  'metadata.sitemap_included !== true',
  'readString(metadata, "robots_policy") !== "index"',
  'readString(metadata, "canonical_path") === null',
  'readString(metadata, "import_entity_candidate_id") !== null',
  '.select("id, target_entity_type, updated_at, metadata")',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  assertIncludes(sitemapSource, token, `${sitemapPath} must include ${token}`);
}

for (const forbiddenToken of [
  '/pharmacy/',
  '/hospitals/',
  'rating',
  'booking',
  'insurance',
  'claim',
  'provider-dashboard',
]) {
  assertNotIncludes(sitemapSource, forbiddenToken, `${sitemapPath} must not include ${forbiddenToken}.`);
}

for (const packageToken of [
  'import:pharmacy-sitemap:validate',
  'scripts/import/check-import-pharmacy-sitemap-promotion.mjs',
  'pnpm import:pharmacy-sitemap:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import pharmacy sitemap promotion check passed.');
