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
const holdDocSource = await readText('docs/import/public-hospital-hold-contract.md');

for (const token of [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy";',
  'if (value === "doctor" || value === "pharmacy") return value;',
  'doctor: 3000',
  'pharmacy: 1500',
  'hasReviewedImportEvidence',
  'decidePublicSitemapEligibility',
  'minimumInternalLinksPassed',
  'hreflangReady',
  'blockedByImportedHospitalRelease',
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
  '| "hospital"',
  'value === "hospital"',
  'case "hospital":',
  '^\\/(en|ar)\\/om\\/hospitals\\/',
  '/hospital/',
  '/hospitals/',
  'rating',
  'booking',
  'insurance',
  'claim',
  'provider-dashboard',
]) {
  assertNotIncludes(sitemapSource, forbiddenToken, `${sitemapPath} must not include ${forbiddenToken}.`);
}

for (const holdToken of [
  '# Imported Hospital Public Hold Contract',
  'public sitemap entry',
  'public sitemap eligibility is downstream of public discovery eligibility, canonical resolution, hreflang readiness, minimum internal-link coverage, and content score',
]) {
  assertIncludes(holdDocSource, holdToken, `docs/import/public-hospital-hold-contract.md must include ${holdToken}.`);
}

for (const packageToken of [
  'import:hospital-sitemap:validate',
  'scripts/import/check-import-hospital-sitemap-promotion.mjs',
  'pnpm import:hospital-sitemap:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import hospital sitemap public hold check passed.');
