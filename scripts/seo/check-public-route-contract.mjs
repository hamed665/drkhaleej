import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const locales = ['en', 'ar'];
const country = 'om';
const configBuilderPattern = /\bbuild[A-Za-z0-9]+DiscoveryConfig\s*\(/;
const protectedConfigPattern = /\bcleanConfigBrand\s*\(\s*build[A-Za-z0-9]+DiscoveryConfig\s*\(/;

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function ensureFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing file: ${relativePath}`);
  }
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertExcludes(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}

function routeFileForPathname(pathname) {
  return pathname === '/'
    ? 'src/app/[locale]/[country]/page.tsx'
    : `src/app/[locale]/[country]${pathname}/page.tsx`;
}

function localizedPath(locale, pathname) {
  return pathname === '/' ? `/${locale}/${country}` : `/${locale}/${country}${pathname}`;
}

function assertProtectedConfig(file, source) {
  if (!configBuilderPattern.test(source)) return;
  assertIncludes(source, 'cleanConfigBrand', `${file} must import the config brand cleaner.`);
  if (!protectedConfigPattern.test(source)) {
    throw new Error(`${file} must wrap discovery config builder output with cleanConfigBrand(...).`);
  }
}

const llmsSource = await readText('public/llms.txt');
const registrySource = await readText('src/lib/seo/page-registry.ts');
const urlRegistryV2Source = await readText('src/lib/seo/url-registry-v2.ts');
const searchModeContractSource = await readText('docs/seo/search-mode-contract.md');
const searchPageSource = await readText('src/app/[locale]/[country]/search/page.tsx');
const searchComponentSource = await readText('src/components/public/public-search-results-page.tsx');
const searchHelperSource = await readText('src/lib/catalog/public-search.ts');
const searchHelperTestSource = await readText('src/lib/catalog/public-search.test.ts');
const searchRuntimeSource = `${searchPageSource}\n${searchComponentSource}`;
const staticRouteMatches = [...registrySource.matchAll(/['"](\/[a-z0-9-]+)['"]/gi)].map((match) => match[1]);
const publicPathnames = ['/', ...new Set(staticRouteMatches)].sort();

if (publicPathnames.length < 10) {
  throw new Error('Route contract did not discover the expected routes.');
}

for (const token of [
  'seoUrlRegistryV2',
  'provider_eligibility',
  'geo_promotion',
  'search_noindex',
  'gate_before_index',
  'gate_before_include',
  'private_exclusion',
]) {
  assertIncludes(urlRegistryV2Source, token, `src/lib/seo/url-registry-v2.ts must include URL registry token: ${token}`);
}

for (const token of [
  'Search mode contract',
  'noindex, follow',
  'Search URLs and filtered query URLs must not enter the sitemap.',
  'searchPublicCatalog',
  'mobile-first layout',
  'touch-friendly cards and filters',
  'Indexable SEO landing pages must be created through GEO, service, and specialty gates',
]) {
  assertIncludes(searchModeContractSource, token, `docs/seo/search-mode-contract.md must include search mode token: ${token}`);
}

for (const token of [
  "pathname: '/search'",
  "indexPolicy: 'noindex_until_ready'",
  'sitemapEligible: false',
  "launchGateReason: 'search-utility-noindex'",
]) {
  assertIncludes(registrySource, token, `page registry must keep search noindex/excluded token: ${token}`);
}

for (const token of [
  "id: 'search'",
  "pattern: '/:locale/:country/search'",
  "indexPolicy: 'noindex'",
  "sitemapPolicy: 'exclude'",
  "gate: 'search_noindex'",
]) {
  assertIncludes(urlRegistryV2Source, token, `URL registry v2 must keep search noindex/exclude token: ${token}`);
}

for (const token of [
  'generateMetadata',
  "pathname: '/search'",
  'SearchParams',
  'explicitSearchRobots',
  'robots: explicitSearchRobots',
  'PublicSearchResultsPage',
]) {
  assertIncludes(searchPageSource, token, `search page must keep route-safe token: ${token}`);
}

for (const token of [
  'searchPublicCatalog',
  'searchPublicCatalogWithVariants(query, { limit: SEARCH_RESULT_LIMIT })',
  'buildPublicSearchQueryVariants',
  'dedupePublicSearchItems',
  'dm-public-search',
  'home-foundation dm2026-home-page dm-public-search',
  'publicDoctorDetailRoute',
  'publicCenterDetailRoute',
  'ResultCard',
  'ResultGroup',
  'query.length >= 2',
  'copy.previewOnly',
  'Centers, hospitals, labs and pharmacies',
]) {
  assertIncludes(searchComponentSource, token, `search component must keep runtime-safe token: ${token}`);
}

for (const token of [
  'PUBLIC_SEARCH_MIN_QUERY_LENGTH',
  'buildPublicSearchQueryVariants',
  'Aster',
  'Astra',
  'dedupePublicSearchItems',
]) {
  assertIncludes(searchHelperSource, token, `search helper must keep public variant token: ${token}`);
}

for (const token of [
  'buildPublicSearchQueryVariants',
  'Aster',
  'Astra',
  'dedupePublicSearchItems',
]) {
  assertIncludes(searchHelperTestSource, token, `search helper test must keep public variant coverage token: ${token}`);
}

for (const token of [
  'submittedFilters',
  'listPublicImportSitemapEntries',
  'sitemapEligible: true',
  "sitemapPolicy: 'include'",
  'rating',
  'insurance',
  'Book now',
  'Open now',
  'verified badge',
]) {
  assertExcludes(searchRuntimeSource, token, `search runtime must not include unsafe or stale token: ${token}`);
}

for (const token of [
  '## Index-ready public routes',
  '## Noindex preview routes',
  '## AI and LLM safety rules',
  'DrKhaleej is not a healthcare provider',
  'Do not claim MOH approval',
  'Do not generate diagnosis',
  'Do not call any provider the best',
  'directory facts only',
  'For emergencies, direct users to local emergency services',
]) {
  assertIncludes(llmsSource, token, `public/llms.txt must include LLM policy token: ${token}`);
}

for (const pathname of publicPathnames) {
  for (const locale of locales) {
    assertIncludes(llmsSource, localizedPath(locale, pathname), `Missing listed path for ${locale} ${pathname}.`);
  }

  const file = routeFileForPathname(pathname);
  await ensureFile(file);
  const source = await readText(file);
  assertIncludes(source, 'generateMetadata', `${file} must expose metadata generation.`);
  assertIncludes(source, 'export default', `${file} must expose a page component.`);
  assertProtectedConfig(file, source);
}

await import('./check-sitemap-hreflang-parity.mjs');

console.log('route contract and LLM policy check passed.');
