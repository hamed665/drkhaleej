import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

function mustNotHave(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} has forbidden token: ${token}`);
}

function routeBlock(source, route) {
  const marker = `pathname: '${route}'`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Missing page-registry block for ${route}.`);
  const start = source.lastIndexOf('{', markerIndex);
  const end = source.indexOf('},', markerIndex);
  return source.slice(start, end === -1 ? markerIndex : end);
}

function requireRoutePolicy(source, route, tokens) {
  const block = routeBlock(source, route);
  for (const token of tokens) mustHave(block, token, `page-registry ${route}`);
}

const sitemapPath = 'src/app/sitemap.ts';
const metadataPath = 'src/lib/seo/metadata.ts';
const pageRegistryPath = 'src/lib/seo/page-registry.ts';
const urlRegistryPath = 'src/lib/seo/url-registry-v2.ts';
const importSitemapPath = 'src/server/public/import-sitemap.ts';
const seoCheckPath = 'scripts/seo-check.mjs';

const sitemap = read(sitemapPath);
const metadata = read(metadataPath);
const pageRegistry = read(pageRegistryPath);
const urlRegistry = read(urlRegistryPath);
const importSitemap = read(importSitemapPath);
const seoCheck = read(seoCheckPath);

for (const token of [
  'sitemapMarketCountries.flatMap',
  'siteConfig.locales.map',
  'localizedRootPath(locale, country)',
  'listSitemapEligibleSeoPageDefinitions()',
  'listPublicImportSitemapEntries()',
  'new URL(page.pathname, siteConfig.baseUrl).toString()',
  'new URL(entry.pathname, siteConfig.baseUrl).toString()',
]) {
  mustHave(sitemap, token, sitemapPath);
}

for (const token of ['searchParams', 'URLSearchParams', '?q=', 'q=', 'filter=', 'specialty=', 'area=', 'city=', 'sort=']) {
  mustNotHave(sitemap, token, sitemapPath);
}

for (const token of ['/doctor/[', '/center/[', '/pharmacies/[', '/hospitals/[', '/services/[', '[slug]']) {
  mustNotHave(sitemap, token, sitemapPath);
}

for (const route of ['/doctors', '/centers', '/labs', '/pharmacies', '/hospitals', '/services', '/for-providers']) {
  requireRoutePolicy(pageRegistry, route, ["indexPolicy: 'index'", "readiness: 'ready'", 'sitemapEligible: true']);
}

for (const route of ['/search', '/dental', '/beauty', '/offers', '/pet-clinics', '/pet-shops', '/source-policy']) {
  requireRoutePolicy(pageRegistry, route, ["indexPolicy: 'noindex_until_ready'", 'sitemapEligible: false']);
}

for (const token of [
  'const canonical = buildCanonicalUrl(pathname, locale, country)',
  "const englishAlternate = toAbsoluteUrl(localizedPathname(pathname, 'en', country))",
  "const arabicAlternate = toAbsoluteUrl(localizedPathname(pathname, 'ar', country))",
  "[regionalLanguageCode('en', country)]: englishAlternate",
  "[regionalLanguageCode('ar', country)]: arabicAlternate",
  'en: englishAlternate',
  'ar: arabicAlternate',
  "'x-default': englishAlternate",
  'robotsForStaticSeoPage(pathname, locale, country)',
]) {
  mustHave(metadata, token, metadataPath);
}

for (const token of [
  "id: 'search'",
  "indexPolicy: 'noindex'",
  "sitemapPolicy: 'exclude'",
  "gate: 'search_noindex'",
  "gate: 'provider_eligibility'",
  "gate: 'geo_promotion'",
  "gate: 'private_exclusion'",
  "indexPolicy: 'gate_before_index'",
  "sitemapPolicy: 'gate_before_include'",
]) {
  mustHave(urlRegistry, token, urlRegistryPath);
}

for (const token of [
  'publicImportSitemapFamilyCaps',
  'doctor: 3000',
  'pharmacy: 1500',
  'hospital: 500',
  'hasReviewedImportEvidence',
  'metadata.sitemap_included !== true',
  'readString(metadata, "robots_policy") !== "index"',
  'readString(metadata, "canonical_path") === null',
  'readString(metadata, "import_entity_candidate_id") !== null',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
  'isSafePublicCanonicalPathForEntity',
]) {
  mustHave(importSitemap, token, importSitemapPath);
}

mustHave(seoCheck, "import './seo/check-sitemap-hreflang-parity-guard.mjs';", seoCheckPath);
console.log('sitemap hreflang parity guard checks passed.');
