import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const routePath = 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx';
const appHospitalsPath = 'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx';
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

async function assertMissing(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    return;
  }
  throw new Error(`${relativePath} must not exist in this route-wrapper PR.`);
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
await assertMissing(appHospitalsPath);

const routeSource = await readText(routePath);
const sitemapSource = await readText(sitemapPath);
const packageSource = await readText('package.json');

for (const token of [
  'getServerSideProps',
  'PublicImportedHospitalProfilePage',
  'getPublicImportHospitalProfile',
  'hospitalSlug',
  'notFound: true',
  'href={canonical}',
  'hrefLang="en-OM"',
  'hrefLang="ar-OM"',
  'profile.canonicalPath',
  'profile.lastCheckedAt',
  'profile.sourceName ?? profile.sourceUrl',
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
]) {
  assertNotIncludes(routeSource, forbiddenToken, `${routePath} must not include ${forbiddenToken}.`);
}

assertNotIncludes(sitemapSource, '^\\/(en|ar)\\/om\\/hospitals\\/', 'import sitemap must not include hospital profile URLs in this route-wrapper PR.');

for (const packageToken of [
  'import:hospital-profile-route:validate',
  'scripts/import/check-public-hospital-profile-route-wrapper.mjs',
  'pnpm import:hospital-profile-route:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('public hospital profile route wrapper check passed.');
