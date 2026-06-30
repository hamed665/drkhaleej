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

function assertExcludes(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}

function localizedUrl(route, locale) {
  return route === '/' ? `/${locale}/om` : `/${locale}/om${route}`;
}

function explicitStaticRouteBlock(registrySource, route) {
  const start = registrySource.indexOf(`staticRoute({ route: '${route}'`);
  if (start === -1) return '';
  const end = registrySource.indexOf('}),', start);
  return registrySource.slice(start, end === -1 ? undefined : end);
}

function registryIndexStatus(registrySource, route) {
  if (route === '/') return 'index-ready';
  if (registrySource.includes(`indexDirectory('${route}'`)) return 'index-ready';
  if (registrySource.includes(`promotionDirectory('${route}'`) || registrySource.includes(`blockedDirectory('${route}'`)) return 'sitemap-excluded';
  const block = explicitStaticRouteBlock(registrySource, route);
  if (block.includes("indexPolicy: 'index'") && block.includes("sitemapPolicy: 'included'")) return 'index-ready';
  if (block.includes("sitemapPolicy: 'excluded'") || block.includes("sitemapPolicy: 'eligible_after_gate'")) return 'sitemap-excluded';
  throw new Error(`Static route ${route} is not represented in URL registry v2.`);
}

const registrySource = await readText('src/lib/seo/url-registry.ts');
const pageRegistrySource = await readText('src/lib/seo/page-registry.ts');
const snapshotSource = await readText(snapshotPath);
const packageSource = await readText('package.json');
const sitemapSource = await readText('src/app/sitemap.ts');
const metadataSource = await readText('src/lib/seo/metadata.ts');
const cpRuntimeSource = await readText('src/lib/geo/oman-location-candidate-cp-plan.ts');
const verifiedCountRuntimeSource = await readText('src/lib/geo/oman-location-candidate-verified-count.ts');
const evidenceReferenceRuntimeSource = await readText('src/lib/geo/evidence-reference-runtime.ts');

for (const token of ['# DrKhaleej Route Indexability Snapshot V1', '## Static public route snapshot', '## Dynamic imported provider route snapshot', '## Import sitemap caps and smoke gates', '## Launch sitemap allowlist', '## Blocked from first clean launch sitemap']) {
  assertIncludes(snapshotSource, token, `${snapshotPath} is missing required marker: ${token}`);
}

for (const token of ['PublicUrlFamily', 'PublicUrlIndexPolicy', 'PublicUrlSitemapPolicy', 'canonicalPath', 'parentRoute', 'parentCanonicalPath', 'requiredGuards', 'internalLinkRequirement', 'schemaPolicy', 'launchStatus', 'hasRequiredInternalLinkContract']) {
  assertIncludes(registrySource, token, `URL registry v2 must include ${token}.`);
}

for (const token of ['listPublicUrlRegistryEntries', 'getPublicUrlRegistryEntry', 'listSitemapIncludedPublicUrlEntries', 'isSitemapIncludedPublicUrlEntry']) {
  assertIncludes(pageRegistrySource, token, `page registry wrapper must use URL registry v2 token: ${token}`);
}

const staticRoutes = ['/', '/doctors', '/centers', '/labs', '/pharmacies', '/hospitals', '/services', '/for-providers', '/dental', '/beauty', '/offers', '/pet-clinics', '/pet-shops', '/search'];
for (const route of staticRoutes) {
  const expectedStatus = registryIndexStatus(registrySource, route);
  assertIncludes(snapshotSource, `\`${route}\``, `${snapshotPath} must include route ${route}.`);
  assertIncludes(snapshotSource, `\`${localizedUrl(route, 'en')}\``, `${snapshotPath} must include English URL for ${route}.`);
  assertIncludes(snapshotSource, `\`${localizedUrl(route, 'ar')}\``, `${snapshotPath} must include Arabic URL for ${route}.`);
  assertIncludes(snapshotSource, expectedStatus, `${snapshotPath} must include status ${expectedStatus} for ${route}.`);
}

for (const route of ['/doctors', '/centers', '/labs', '/pharmacies', '/hospitals', '/services']) {
  assertIncludes(registrySource, `indexDirectory('${route}'`, `Indexable route ${route} must use indexDirectory helper.`);
}
assertIncludes(registrySource, "'parent-internal-link-contract'", 'Indexable static routes must carry parent internal link contract guard.');

for (const token of ['`/en/om/doctor/{slug}`', '`/ar/om/doctor/{slug}`', '`/en/om/pharmacies/{slug}`', '`/ar/om/pharmacies/{slug}`', '`/en/om/hospitals/{slug}`', '`/ar/om/hospitals/{slug}`', 'SITEMAP-GUARD-B import-sitemap-family-caps-v1', 'PROFILE-SMOKE-A public-import-profile-smoke-v1', 'doctor cap: 3000', 'pharmacy cap: 1500', 'hospital cap: 500', 'pnpm import:profile-smoke:validate', 'import_publish_queue', 'sitemap_included: true', 'robots_policy: index', 'required evidence exists']) {
  assertIncludes(snapshotSource, token, `${snapshotPath} must include dynamic/import token: ${token}`);
}

for (const token of ['oman-location-candidate-cp-plan', 'oman-location-candidate-verified-count', 'evidence-reference-runtime']) {
  assertExcludes(registrySource, token, `URL registry v2 must not reference ${token}.`);
  assertExcludes(sitemapSource, token, `sitemap must not reference ${token}.`);
  assertExcludes(metadataSource, token, `metadata must not reference ${token}.`);
}

for (const source of [cpRuntimeSource, verifiedCountRuntimeSource, evidenceReferenceRuntimeSource]) {
  for (const token of ["status: 'disabled'", 'routeCreationAllowed: false', 'sitemapAllowed: false', 'jsonLdAllowed: false', 'indexPromotionAllowed: false']) {
    assertIncludes(source, token, `disabled GEO runtime source must include ${token}.`);
  }
}

assertIncludes(packageSource, 'seo:route-snapshot:validate', 'package.json must expose route snapshot validation.');
assertIncludes(packageSource, 'pnpm seo:route-snapshot:validate', 'seo:check must run route snapshot validation.');
assertIncludes(packageSource, 'pnpm import:profile-smoke:validate', 'seo:check must run public import profile smoke validation.');
assertIncludes(sitemapSource, 'listSitemapIncludedPublicUrlEntries()', 'sitemap must use URL registry v2 included route helper.');
assertIncludes(sitemapSource, 'listPublicImportSitemapEntries()', 'sitemap must still merge guarded import profile entries.');
assertIncludes(metadataSource, 'robotsForStaticSeoPage', 'metadata must still use static route readiness for robots.');
assertIncludes(metadataSource, 'getPublicUrlRegistryEntry', 'metadata must use URL registry v2 for robots.');
assertIncludes(metadataSource, 'isIndexablePublicUrlEntry', 'metadata must use URL registry v2 indexability helper.');

console.log('route indexability snapshot check passed.');
