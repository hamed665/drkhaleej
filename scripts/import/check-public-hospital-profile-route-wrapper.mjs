import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pagesRoutePath = 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx';
const apiRoutePath = 'src/app/api/_drk/hospital-profile/[locale]/[country]/[hospitalSlug]/route.ts';
const appHospitalSlugPath = 'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx';
const appHospitalSlugLayoutPath = 'src/app/[locale]/[country]/hospitals/[slug]/layout.tsx';
const appHospitalSlugPagePath = 'src/app/[locale]/[country]/hospitals/[slug]/page.tsx';
const sitemapPath = 'src/server/public/import-sitemap.ts';
const holdDocPath = 'docs/import/public-hospital-hold-contract.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertMissing(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    return;
  }
  throw new Error(`${relativePath} must not exist while imported hospital detail pages are on public hold.`);
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

await assertMissing(pagesRoutePath);
await assertMissing(apiRoutePath);
await assertMissing(appHospitalSlugPath);
await assertMissing(appHospitalSlugLayoutPath);
await assertMissing(appHospitalSlugPagePath);

const sitemapSource = await readText(sitemapPath);
const holdDocSource = await readText(holdDocPath);
const packageSource = await readText('package.json');

for (const token of [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital"',
  'resolveImportProviderAuthority',
  'resolvePublicProviderCanonicalRoute',
  'resolvedRoute.publicRouteEnabled',
  'resolvedRoute.canonicalPath !== canonicalPath',
  'hospital: 500',
  'hasReviewedImportEvidence',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  assertIncludes(sitemapSource, token, `import sitemap must include reviewed profile sitemap token ${token}`);
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
  assertNotIncludes(sitemapSource, forbiddenToken, `import sitemap must not include ${forbiddenToken}.`);
}

for (const token of [
  'The hospital detail route must not exist while imported hospital detail pages are blocked.',
  'A fail-closed detail layout still creates a public route structure',
  'hospital sitemap eligibility remains guarded by import queue readiness',
]) {
  assertIncludes(holdDocSource, token, `${holdDocPath} must include ${token}.`);
}

for (const packageToken of [
  'import:hospital-profile-route:validate',
  'scripts/import/check-public-hospital-profile-route-wrapper.mjs',
  'pnpm import:hospital-profile-route:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('public hospital profile route hold check passed.');
