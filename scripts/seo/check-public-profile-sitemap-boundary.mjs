import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

const sitemapPath = 'src/app/sitemap.ts';
const sitemap = readFile(sitemapPath);
for (const token of [
  'MetadataRoute',
  'listSitemapEligibleSeoPageDefinitions',
  'listPublicImportSitemapEntries',
  'const importEntries = await listPublicImportSitemapEntries()',
  'return [...staticEntries, ...importedEntries]',
]) {
  assertIncludes(sitemap, token, sitemapPath);
}
for (const forbiddenToken of [
  'getPublicDoctorBySlug',
  'getPublicCenterBySlug',
  'listPublicDoctors',
  'listPublicCenters',
  'isPublicProfileIndexEligible',
  'doctorSlug',
  'centerSlug',
  'generateStaticParams',
  '?q=',
  'searchParams',
  'provider-dashboard',
  'admin',
  'preview',
  'booking',
  'insurance',
  'AggregateRating',
  'Review',
]) {
  assertNotIncludes(sitemap, forbiddenToken, sitemapPath);
}

for (const routePath of [
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
]) {
  const route = readFile(routePath);
  for (const token of [
    'generateMetadata',
    'buildNoindexFallbackMetadata',
    'robots: { index: false, follow: true }',
  ]) {
    assertIncludes(route, token, routePath);
  }
  for (const forbiddenToken of [
    'generateStaticParams',
    'sitemapPolicy',
    'profileSitemap',
  ]) {
    assertNotIncludes(route, forbiddenToken, routePath);
  }
}

const importSitemapPath = 'src/server/public/import-sitemap.ts';
const importSitemap = readFile(importSitemapPath);
for (const token of [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital"',
  'publicImportSitemapFamilyCaps',
  'publicImportSitemapLimit',
  'hasReviewedImportEvidence',
  'metadata.sitemap_included !== true',
  'readString(metadata, "robots_policy") !== "index"',
  'readString(metadata, "canonical_path") === null',
  'readString(metadata, "import_entity_candidate_id") === null',
  'resolveImportProviderAuthority',
  'resolvePublicProviderCanonicalRoute',
  'resolvedRoute.publicRouteEnabled',
  'resolvedRoute.canonicalPath !== canonicalPath',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
  'applyFamilyCaps(entries)',
]) {
  assertIncludes(importSitemap, token, importSitemapPath);
}
for (const forbiddenToken of [
  'rating',
  'booking',
  'insurance',
  'claim',
  'provider-dashboard',
  'href="/admin',
  'preview',
]) {
  assertNotIncludes(importSitemap, forbiddenToken, importSitemapPath);
}

const docPath = 'docs/seo/public-profile-sitemap-boundary.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile sitemap boundary',
  'must not use `generateStaticParams`',
  'query and filter URLs must not appear in sitemap output',
  'listSitemapEligibleSeoPageDefinitions()',
  'listPublicImportSitemapEntries()',
  'publish_status = index_eligible',
  'index_policy = index',
  'sitemap_policy = included',
  'isPublicProfileIndexEligible',
  'family caps remain in place',
]) {
  assertIncludes(doc, token, docPath);
}

const metadataGatePath = 'scripts/seo/check-public-profile-metadata-index-gate.mjs';
const metadataGate = readFile(metadataGatePath);
assertIncludes(metadataGate, "import './check-public-profile-sitemap-boundary.mjs';", metadataGatePath);

console.log('Public profile sitemap boundary guard passed.');
