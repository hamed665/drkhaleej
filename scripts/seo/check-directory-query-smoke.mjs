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

const helperPath = 'src/lib/catalog/public-directory-query.ts';
const helper = readFile(helperPath);
for (const token of [
  'firstDirectorySearchParamValue',
  'isDirectorySearchQuery',
  'doctorDirectoryResultFromSearch',
  'centerDirectoryResultFromSearch',
  'centerTypeDirectoryResultFromSearch',
  'query.length >= 2',
  'trim().slice(0, 80)',
]) {
  assertIncludes(helper, token, helperPath);
}

const queryNoticePath = 'src/components/public/public-directory-query-notice.tsx';
const queryNotice = readFile(queryNoticePath);
for (const token of [
  'export function PublicDirectoryQueryNotice',
  'clearHref',
  'Showing search results for',
  'Clear search',
  'عرض نتائج البحث عن',
  'مسح البحث',
]) {
  assertIncludes(queryNotice, token, queryNoticePath);
}
for (const forbiddenToken of ['?q=', 'noindex', 'sitemap']) {
  assertNotIncludes(queryNotice, forbiddenToken, queryNoticePath);
}

const shellPath = 'src/components/public/discovery/PublicDiscoveryResultsShell2026.tsx';
const shell = readFile(shellPath);
for (const token of ['activeQueryNotice?: ReactNode', '{activeQueryNotice}', 'hasActiveQuery']) {
  assertIncludes(shell, token, shellPath);
}

const routes = [
  {
    path: 'src/app/[locale]/[country]/doctors/page.tsx',
    baseRoute: '/doctors',
    fallbackToken: 'listPublicDoctors({ country: safeCountry })',
    mapperToken: 'doctorDirectoryResultFromSearch',
    variantToken: 'variant="doctor"',
  },
  {
    path: 'src/app/[locale]/[country]/centers/page.tsx',
    baseRoute: '/centers',
    fallbackToken: 'listPublicCenters({ country: safeCountry })',
    mapperToken: 'centerDirectoryResultFromSearch',
    variantToken: 'variant="center"',
  },
  {
    path: 'src/app/[locale]/[country]/labs/page.tsx',
    baseRoute: '/labs',
    fallbackToken: 'centerType: "laboratory"',
    mapperToken: 'centerTypeDirectoryResultFromSearch',
    variantToken: 'variant="center"',
  },
  {
    path: 'src/app/[locale]/[country]/pharmacies/page.tsx',
    baseRoute: '/pharmacies',
    fallbackToken: 'centerType: "pharmacy"',
    mapperToken: 'centerTypeDirectoryResultFromSearch',
    variantToken: 'variant="center"',
  },
  {
    path: 'src/app/[locale]/[country]/hospitals/page.tsx',
    baseRoute: '/hospitals',
    fallbackToken: 'centerType: "hospital"',
    mapperToken: 'centerTypeDirectoryResultFromSearch',
    variantToken: 'variant="center"',
  },
];

for (const route of routes) {
  const content = readFile(route.path);
  const clearHrefToken = `/${'${safeLocale}'}/${'${safeCountry}'}${route.baseRoute}`;

  for (const token of [
    'searchParams: Promise<SearchParams>',
    'firstDirectorySearchParamValue((await searchParams).q)',
    'isDirectorySearchQuery(query)',
    'searchPublicCatalog(query, { limit: 24 })',
    route.mapperToken,
    route.fallbackToken,
    route.variantToken,
    'PublicDirectoryListingContent',
    'PublicDirectoryQueryNotice',
    'clearSearchHref',
    clearHrefToken,
    `pathname: "${route.baseRoute}"`,
  ]) {
    assertIncludes(content, token, route.path);
  }

  for (const forbiddenToken of [
    '?q=',
    'sitemapPolicy',
    'generateStaticParams',
    'robots:',
    'noindex',
    'AggregateRating',
    'specialtySlug',
    'areaSlug',
    'geo_area',
    'rating',
    'insurance',
    'Book now',
    'Open now',
    'Verified',
    'contactActions',
  ]) {
    assertNotIncludes(content, forbiddenToken, route.path);
  }
}

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-directory-query-smoke.mjs';", listingSafetyPath);

console.log('Directory query smoke guard passed.');
