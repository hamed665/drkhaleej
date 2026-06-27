import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const snapshotPath = 'docs/seo/DRKHALEEJ_ROUTE_INDEXABILITY_SNAPSHOT_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function routeBlock(source, route) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(String.raw`\{[\s\S]*?pathname:\s*['"]${escaped}['"][\s\S]*?\}`, 'm'));
  if (!match) throw new Error(`Missing static route registry block for ${route}.`);
  return match[0];
}

function registryIndexStatus(registrySource, route) {
  if (route === '/') return 'index-ready';
  const block = routeBlock(registrySource, route);
  const indexable = block.includes("indexPolicy: 'index'") && block.includes("readiness: 'ready'") && block.includes('sitemapEligible: true');
  const noindex = block.includes("indexPolicy: 'noindex_until_ready'") && block.includes('sitemapEligible: false');

  if (indexable) return 'index-ready';
  if (noindex) return 'sitemap-excluded';
  throw new Error(`Static route ${route} is neither launch-ready nor noindex-gated.`);
}

function localizedUrl(route, locale) {
  return route === '/' ? `/${locale}/om` : `/${locale}/om${route}`;
}

const registrySource = await readText('src/lib/seo/page-registry.ts');
const snapshotSource = await readText(snapshotPath);
const packageSource = await readText('package.json');
const sitemapSource = await readText('src/app/sitemap.ts');
const metadataSource = await readText('src/lib/seo/metadata.ts');

for (const token of [
  '# DrKhaleej Route Indexability Snapshot V1',
  '## Static public route snapshot',
  '## Dynamic imported provider route snapshot',
  '## Import sitemap caps and smoke gates',
  '## Launch sitemap allowlist',
  '## Blocked from first clean launch sitemap',
  '| Route | Localized URLs | Index policy | Readiness | Sitemap | Robots | Snapshot decision | Next action |',
]) {
  assertIncludes(snapshotSource, token, `${snapshotPath} is missing required section or table marker: ${token}`);
}

const staticRoutes = [
  '/',
  '/doctors',
  '/centers',
  '/labs',
  '/pharmacies',
  '/hospitals',
  '/services',
  '/for-providers',
  '/dental',
  '/beauty',
  '/offers',
  '/pet-clinics',
  '/pet-shops',
  '/search',
];

for (const route of staticRoutes) {
  const expectedStatus = registryIndexStatus(registrySource, route);
  assertIncludes(snapshotSource, `\`${route}\``, `${snapshotPath} must include route ${route}.`);
  assertIncludes(snapshotSource, `\`${localizedUrl(route, 'en')}\``, `${snapshotPath} must include English URL for ${route}.`);
  assertIncludes(snapshotSource, `\`${localizedUrl(route, 'ar')}\``, `${snapshotPath} must include Arabic URL for ${route}.`);
  assertIncludes(snapshotSource, expectedStatus, `${snapshotPath} must include status ${expectedStatus} for ${route}.`);
}

for (const token of [
  '`/en/om/doctor/{slug}`',
  '`/ar/om/doctor/{slug}`',
  '`/en/om/pharmacies/{slug}`',
  '`/ar/om/pharmacies/{slug}`',
  '`/en/om/hospitals/{slug}`',
  '`/ar/om/hospitals/{slug}`',
  'PROFILE-GATE-B imported-pharmacy-profile-guard-v1',
  'PROFILE-GATE-C public-pharmacy-profile-route-wrapper-v1',
  'PROFILE-GATE-D imported-hospital-profile-guard-v1',
  'PROFILE-GATE-E public-hospital-profile-route-wrapper-v1',
  'SITEMAP-GUARD-B import-sitemap-family-caps-v1',
  'PROFILE-SMOKE-A public-import-profile-smoke-v1',
  'doctor cap: 3000',
  'pharmacy cap: 1500',
  'hospital cap: 500',
  'pnpm import:profile-smoke:validate',
  'source evidence exists, contact/map evidence exists, and Oman geo evidence exists',
]) {
  assertIncludes(snapshotSource, token, `${snapshotPath} must include dynamic route snapshot token: ${token}`);
}

for (const token of [
  'import_publish_queue',
  'sitemap_included: true',
  'robots_policy: index',
  'the canonical path is exact',
  'the candidate is approved',
  'required evidence exists',
]) {
  assertIncludes(snapshotSource, token, `${snapshotPath} must include import sitemap allowlist token: ${token}`);
}

assertIncludes(packageSource, 'seo:route-snapshot:validate', 'package.json must expose route snapshot validation.');
assertIncludes(packageSource, 'pnpm seo:route-snapshot:validate', 'seo:check must run route snapshot validation.');
assertIncludes(packageSource, 'pnpm import:profile-smoke:validate', 'seo:check must run public import profile smoke validation.');
assertIncludes(sitemapSource, 'listSitemapEligibleSeoPageDefinitions()', 'sitemap must still use the readiness-filtered registry.');
assertIncludes(sitemapSource, 'listPublicImportSitemapEntries()', 'sitemap must still merge guarded import profile entries.');
assertIncludes(metadataSource, 'robotsForStaticSeoPage', 'metadata must still use static route readiness for robots.');

console.log('route indexability snapshot check passed.');
