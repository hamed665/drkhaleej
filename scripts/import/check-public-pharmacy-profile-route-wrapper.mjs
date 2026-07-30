import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const routePath = 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx';
const sitemapPath = 'src/server/public/import-sitemap.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing file: ${relativePath}`);
  }
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

await assertFile(routePath);
const routeSource = await readText(routePath);
const sitemapSource = await readText(sitemapPath);
const packageSource = await readText('package.json');

for (const token of [
  'generateMetadata',
  'export default async function PublicImportedPharmacyProfilePage',
  'getPublicImportPharmacyProfile',
  'pharmacySlug: string',
  'pathname: `/pharmacies/${pharmacySlug}`',
  'notFound()',
  'result.profile.indexPolicy === "index"',
  'buildProfileNoindexMetadata(metadata)',
  'data-index-policy={profile.indexPolicy}',
  'data-sitemap-policy="excluded"',
  'profile.lastCheckedAt',
  'profile.sourceName ?? profile.sourceUrl',
  'providerConfirmation',
  'import Link from "next/link"',
  'href={`/${locale}/${country}/pharmacies`}',
  'تصفح الصيدليات',
  'يرجى تأكيد التفاصيل مباشرةً مع مقدم الخدمة.',
]) {
  assertIncludes(routeSource, token, `${routePath} must include ${token}`);
}

for (const forbiddenToken of [
  'application/ld+json',
  'buildFaqJsonLd',
  'Review',
  'rating',
  'booking',
  'insurance',
  'claim',
  'provider-dashboard',
  'listPublicImportSitemapEntries',
  '<dt className="font-semibold text-slate-950">Canonical path</dt>',
  'profile.canonicalPath',
  'profile.qualityScore',
  'Quality score',
  'PublicImportLocalSuggestion',
  'profile.localSuggestions',
  'function publicLocalSuggestionHref',
]) {
  assertNotIncludes(routeSource, forbiddenToken, `${routePath} must not include ${forbiddenToken}.`);
}

for (const token of [
  'resolveImportProviderAuthority',
  'resolvePublicProviderCanonicalRoute',
  'resolvedRoute.publicRouteEnabled',
  'resolvedRoute.canonicalPath !== canonicalPath',
  'hasReviewedImportEvidence',
  'import_entity_candidate_id',
]) {
  assertIncludes(sitemapSource, token, `import sitemap must include reviewed profile sitemap token ${token}`);
}

for (const packageToken of [
  'import:pharmacy-profile-route:validate',
  'scripts/import/check-public-pharmacy-profile-route-wrapper.mjs',
  'pnpm import:pharmacy-profile-route:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('public pharmacy profile route wrapper check passed.');
