import './check-directory-query-smoke.mjs';
import './check-public-profile-readiness-smoke.mjs';
import './check-public-profile-summary-contract.mjs';
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

const cardPath = 'src/components/public/public-listing-card.tsx';
const cardContent = readFile(cardPath);

for (const token of [
  'import Link from',
  'export function PublicListingCard',
  "variant: 'center'",
  "variant: 'doctor'",
  "variant: 'service'",
  'listingHref',
  "'center'",
  "'doctor'",
  'View profile',
  'Profile coming soon',
  'formatNeutralLabel',
]) {
  assertIncludes(cardContent, token, cardPath);
}

for (const forbiddenToken of [
  'PublicContactActions',
  'contactActions',
  'Call center',
  'WhatsApp center',
  'mailto:',
  'tel:',
  'wa.me',
  'Book now',
  'book now',
  'Open now',
  'open now',
  'Verified',
  'verified badge',
  'rating',
  'insurance',
]) {
  assertNotIncludes(cardContent, forbiddenToken, cardPath);
}

const directoryQueryHelperPath = 'src/lib/catalog/public-directory-query.ts';
const directoryQueryHelper = readFile(directoryQueryHelperPath);
for (const token of [
  'PublicDirectorySearchParamValue',
  'firstDirectorySearchParamValue',
  'isDirectorySearchQuery',
  'doctorDirectoryResultFromSearch',
  'centerDirectoryResultFromSearch',
  'centerTypeDirectoryResultFromSearch',
  'query.length >= 2',
  'PublicCatalogQueryResult<PublicCatalogSearchResult>',
]) {
  assertIncludes(directoryQueryHelper, token, directoryQueryHelperPath);
}

const queryNoticePath = 'src/components/public/public-directory-query-notice.tsx';
const queryNoticeContent = readFile(queryNoticePath);
for (const token of [
  'export function PublicDirectoryQueryNotice',
  'Showing search results for',
  'Clear search',
  'مسح البحث',
  'rounded-3xl',
  'from-white via-emerald-50/30 to-cyan-50/30',
]) {
  assertIncludes(queryNoticeContent, token, queryNoticePath);
}

const resultsShellPath = 'src/components/public/discovery/PublicDiscoveryResultsShell2026.tsx';
const resultsShellContent = readFile(resultsShellPath);
for (const token of [
  'activeQueryNotice?: ReactNode',
  'activeQueryNotice,',
  '{activeQueryNotice}',
]) {
  assertIncludes(resultsShellContent, token, resultsShellPath);
}

const directoryContracts = [
  {
    path: 'src/app/[locale]/[country]/doctors/page.tsx',
    route: '/doctors',
    variantToken: 'variant="doctor"',
    tokens: ['listPublicDoctors({ country: safeCountry })', 'searchPublicCatalog(query, { limit: 24 })', 'doctorDirectoryResultFromSearch', 'isDirectorySearchQuery(query)', 'firstDirectorySearchParamValue', 'PublicDirectoryQueryNotice', 'clearSearchHref', 'PublicDirectoryListingContent', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/centers/page.tsx',
    route: '/centers',
    variantToken: 'variant="center"',
    tokens: ['listPublicCenters({ country: safeCountry })', 'searchPublicCatalog(query, { limit: 24 })', 'centerDirectoryResultFromSearch', 'isDirectorySearchQuery(query)', 'firstDirectorySearchParamValue', 'PublicDirectoryQueryNotice', 'activeQueryNotice', 'hasActiveQuery={isDirectorySearch}', 'clearSearchHref', 'PublicDirectoryListingContent', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/labs/page.tsx',
    route: '/labs',
    variantToken: 'variant="center"',
    tokens: ['listPublicCenters({', 'centerType: "laboratory"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeDirectoryResultFromSearch', 'isDirectorySearchQuery(query)', 'firstDirectorySearchParamValue', 'PublicDirectoryQueryNotice', 'activeQueryNotice', 'hasActiveQuery={isDirectorySearch}', 'clearSearchHref', 'PublicDirectoryListingContent', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/pharmacies/page.tsx',
    route: '/pharmacies',
    variantToken: 'variant="center"',
    tokens: ['listPublicCenters({', 'centerType: "pharmacy"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeDirectoryResultFromSearch', 'isDirectorySearchQuery(query)', 'firstDirectorySearchParamValue', 'PublicDirectoryQueryNotice', 'activeQueryNotice', 'hasActiveQuery={isDirectorySearch}', 'clearSearchHref', 'PublicDirectoryListingContent', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/hospitals/page.tsx',
    route: '/hospitals',
    variantToken: 'variant="center"',
    tokens: ['listPublicCenters({', 'centerType: "hospital"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeDirectoryResultFromSearch', 'isDirectorySearchQuery(query)', 'firstDirectorySearchParamValue', 'PublicDirectoryQueryNotice', 'activeQueryNotice', 'hasActiveQuery={isDirectorySearch}', 'clearSearchHref', 'PublicDirectoryListingContent', 'result={result}', 'emptyText={emptyText}'],
  },
];

for (const contract of directoryContracts) {
  const content = readFile(contract.path);
  for (const token of [...contract.tokens, contract.variantToken, `pathname: "${contract.route}"`, `/${'${safeLocale}'}/${'${safeCountry}'}${contract.route}`]) {
    assertIncludes(content, token, contract.path);
  }
  for (const forbiddenToken of [
    'contactActions',
    'Book now',
    'Open now',
    'Verified',
    'rating',
    'insurance',
    'function firstSearchParamValue',
    'function doctorResultFromSearch',
    'function centerResultFromSearch',
    'function centerTypeResultFromSearch',
  ]) {
    assertNotIncludes(content, forbiddenToken, contract.path);
  }
}

for (const routePath of [
  'src/app/[locale]/[country]/doctors/page.tsx',
  'src/app/[locale]/[country]/centers/page.tsx',
  'src/app/[locale]/[country]/labs/page.tsx',
  'src/app/[locale]/[country]/pharmacies/page.tsx',
  'src/app/[locale]/[country]/hospitals/page.tsx',
]) {
  const routePage = readFile(routePath);
  for (const token of [
    'type SearchParams = Record<string, string | string[] | undefined>',
    'searchParams: Promise<SearchParams>',
    'searchEmptyCopyByLocale',
  ]) {
    if (routePath.includes('/doctors/') && token === 'searchEmptyCopyByLocale') {
      continue;
    }
    assertIncludes(routePage, token, routePath);
  }
  for (const forbiddenToken of ['sitemapPolicy', 'generateStaticParams', 'specialtySlug', 'areaSlug', 'geo_area', 'AggregateRating']) {
    assertNotIncludes(routePage, forbiddenToken, routePath);
  }
}

const directorySearchContractPath = 'docs/seo/directory-search-filter-contract.md';
const directorySearchContract = readFile(directorySearchContractPath);
for (const token of [
  'Directory search and filter contract',
  'Query and filter URL variants are user state only.',
  'Directory query variants must not enter the sitemap.',
  'Canonical metadata remains the base directory path.',
  '`q` text search on `/doctors`',
  '`q` text search on `/centers`',
  '`q` text search on `/labs` with `centerType: "laboratory"`',
  '`q` text search on `/pharmacies` with `centerType: "pharmacy"`',
  '`q` text search on `/hospitals` with `centerType: "hospital"`',
  'center results narrowed to `PublicCenterSummary[]`',
  'center-type directory results narrowed to the required `PublicCenterSummary["centerType"]`',
  'SSR execution using `searchPublicCatalog`',
  'client-only filtering that changes the URL without changing the server-rendered results',
  'Specialty and area filters only after their gates and canonical rules exist.',
]) {
  assertIncludes(directorySearchContract, token, directorySearchContractPath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);
for (const token of [
  '"seo:public-listing-card-safety:validate": "node scripts/seo/check-public-listing-card-safety.mjs"',
  'pnpm seo:public-listing-card-safety:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Public listing card safety, directory graph, shared query helpers, and active query UX checks passed.');
