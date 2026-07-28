import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const guardPath = 'src/server/public/import-pharmacy-profile-guard.ts';
const localSuggestionGuardPath = 'src/server/public/import-local-suggestion-guard.ts';
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

const guardSource = await readText(guardPath);
const localSuggestionGuardSource = await readText(localSuggestionGuardPath);
const importSitemapSource = await readText(importSitemapPath);
const packageSource = await readText('package.json');

for (const token of [
  'export type PublicImportPharmacyProfile',
  'export async function getPublicImportPharmacyProfile',
  'family: "pharmacies"',
  'entityType: "pharmacy"',
  'pharmacySlug: string',
  'resolvePublicProviderCanonicalRoute',
  'family: "pharmacy"',
  'row.target_entity_type !== "pharmacy"',
  '.eq("target_entity_type", "pharmacy")',
  '.eq("sitemap_policy", "excluded")',
  '.eq("index_policy", "noindex")',
  '.eq("publish_status", "published_noindex")',
  'import_pharmacy_public_noindex_authorizations',
  'isPublicNoindexPharmacyAuthorization',
  'authorization.status !== "published"',
  'authorization.published_queue_id !== queue.id',
  'candidate.entity_type !== "pharmacy"',
  'candidate.candidate_status !== "approved"',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
  'hasLocalGeo(geo)',
  'localSuggestions: PublicImportLocalSuggestion[];',
  'localSuggestions: []',
]) {
  assertIncludes(guardSource, token, `${guardPath} must include ${token}`);
}

for (const token of [
  'export type PublicImportLocalSuggestionFamily',
  'export type PublicImportLocalSuggestion',
  'buildPublicImportLocalSuggestions',
  'localSuggestionFamilyAliases',
  'localSuggestionRows',
  'approvedLocalSuggestion',
  'publicVisible !== true',
  'confidence !== "high" && confidence !== "medium"',
  'family === sourceFamily && sourceSlug !== null && slug === sourceSlug',
]) {
  assertIncludes(localSuggestionGuardSource, token, `${localSuggestionGuardPath} must include ${token}`);
}

for (const token of [
  'robots_policy',
  'canonical_path',
  'canonical_paths',
  'public_noindex_schema_version',
  'sitemap_included !== false',
  'index_promoted !== false',
  'import_entity_candidate_id',
  'sourceUrl: string | null;',
  'lastCheckedAt: string | null;',
  'qualityScore: Math.max(0, Math.min(100',
]) {
  assertIncludes(guardSource, token, `${guardPath} must preserve public evidence token ${token}`);
}

for (const token of [
  'resolveImportProviderAuthority',
  'resolvePublicProviderCanonicalRoute',
  'resolvedRoute.publicRouteEnabled',
  'resolvedRoute.canonicalPath !== canonicalPath',
  'target_entity_type',
]) {
  assertIncludes(importSitemapSource, token, `import sitemap must include reviewed profile sitemap token ${token}`);
}

for (const packageToken of [
  'import:pharmacy-profile-guard:validate',
  'scripts/import/check-import-pharmacy-profile-guard.mjs',
  'pnpm import:pharmacy-profile-guard:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import pharmacy profile guard check passed.');
