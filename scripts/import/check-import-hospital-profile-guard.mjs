import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const guardPath = 'src/server/public/import-hospital-profile-guard.ts';
const importSitemapPath = 'src/server/public/import-sitemap.ts';

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

const guardSource = await readText(guardPath);
const importSitemapSource = await readText(importSitemapPath);
const packageSource = await readText('package.json');

for (const token of [
  'export type PublicImportHospitalProfile',
  'export async function getPublicImportHospitalProfile',
  'family: "hospitals"',
  'entityType: "hospital"',
  'hospitalSlug: string',
  'return `/${locale}/${country}/hospitals/${slug}`;',
  'row.target_entity_type !== "hospital"',
  '.eq("target_entity_type", "hospital")',
  '.eq("sitemap_policy", "included")',
  '.eq("index_policy", "index")',
  '.eq("publish_status", "index_eligible")',
  'candidate.entity_type !== "hospital"',
  'candidate.candidate_status !== "approved"',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
  'hasLocalGeo(geo)',
]) {
  assertIncludes(guardSource, token, `${guardPath} must include ${token}`);
}

for (const token of [
  'robots_policy',
  'canonical_path',
  'import_entity_candidate_id',
  'sourceUrl: string | null;',
  'lastCheckedAt: string | null;',
  'qualityScore: Math.max(0, Math.min(100',
]) {
  assertIncludes(guardSource, token, `${guardPath} must preserve public evidence token ${token}`);
}

for (const token of [
  '^\\/(en|ar)\\/om\\/doctor\\/',
  '^\\/(en|ar)\\/om\\/pharmacies\\/',
  'target_entity_type',
]) {
  assertIncludes(importSitemapSource, token, `import sitemap must preserve existing reviewed sitemap token ${token}`);
}

assertNotIncludes(importSitemapSource, '^\\/(en|ar)\\/om\\/hospitals\\/', 'import sitemap must not include hospital profile URLs in this guard-only PR.');

for (const packageToken of [
  'import:hospital-profile-guard:validate',
  'scripts/import/check-import-hospital-profile-guard.mjs',
  'pnpm import:hospital-profile-guard:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import hospital profile guard check passed.');
