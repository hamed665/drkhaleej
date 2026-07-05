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
  'robots: { index: false, follow: true }',
  'profile.lastCheckedAt',
  'profile.sourceName ?? profile.sourceUrl',
  'Confirm details directly with the provider',
  'import Link from "next/link"',
  'PublicImportLocalSuggestion',
  'PublicImportLocalSuggestionFamily',
  'localSuggestionsTitle',
  'localSuggestionsDescription',
  'localSuggestionSourceLabel',
  'function localSuggestionDisplayName',
  'function localSuggestionFamilyLabel',
  'function publicLocalSuggestionHref',
  'suggestion.family === "doctor"',
  'suggestion.family === "pharmacy"',
  'suggestion.family === "hospital"',
  'profile.localSuggestions.length > 0',
  'profile.localSuggestions.map',
  'localSuggestionFamilyLabel(locale, suggestion.family)',
  'publicLocalSuggestionHref(locale, country, suggestion)',
  'suggestion.lastCheckedAt',
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
]) {
  assertNotIncludes(routeSource, forbiddenToken, `${routePath} must not include ${forbiddenToken}.`);
}

for (const token of [
  String.raw`^\/(en|ar)\/om\/doctor\/`,
  String.raw`^\/(en|ar)\/om\/pharmacies\/`,
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
