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

const directoryContracts = [
  {
    path: 'src/app/[locale]/[country]/doctors/page.tsx',
    tokens: ['listPublicDoctors({ country: safeCountry })', 'searchPublicCatalog(query, { limit: 24 })', 'doctorResultFromSearch', 'query.length >= 2', 'PublicDirectoryListingContent', 'variant="doctor"', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/centers/page.tsx',
    tokens: ['listPublicCenters({ country: safeCountry })', 'searchPublicCatalog(query, { limit: 24 })', 'centerResultFromSearch', 'query.length >= 2', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/labs/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "laboratory"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeResultFromSearch', 'query.length >= 2', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/pharmacies/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "pharmacy"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeResultFromSearch', 'query.length >= 2', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}', 'emptyText={emptyText}'],
  },
  {
    path: 'src/app/[locale]/[country]/hospitals/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "hospital"', 'searchPublicCatalog(query, { limit: 24 })', 'centerTypeResultFromSearch', 'query.length >= 2', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}', 'emptyText={emptyText}'],
  },
];

for (const contract of directoryContracts) {
  const content = readFile(contract.path);
  for (const token of contract.tokens) {
    assertIncludes(content, token, contract.path);
  }
  for (const forbiddenToken of ['contactActions', 'Book now', 'Open now', 'Verified', 'rating', 'insurance']) {
    assertNotIncludes(content, forbiddenToken, contract.path);
  }
}

const doctorsPage = readFile('src/app/[locale]/[country]/doctors/page.tsx');
for (const token of [
  'type SearchParams = Record<string, string | string[] | undefined>',
  'searchParams: Promise<SearchParams>',
  'firstSearchParamValue',
  'searchResultsHeading',
  'searchResultsSubtext',
  'searchEmptyText',
  'pathname: "/doctors"',
]) {
  assertIncludes(doctorsPage, token, 'src/app/[locale]/[country]/doctors/page.tsx');
}
for (const forbiddenToken of ['sitemapPolicy', 'generateStaticParams', 'specialtySlug', 'areaSlug', 'geo_area', 'AggregateRating']) {
  assertNotIncludes(doctorsPage, forbiddenToken, 'src/app/[locale]/[country]/doctors/page.tsx');
}

const centersPage = readFile('src/app/[locale]/[country]/centers/page.tsx');
for (const token of [
  'type SearchParams = Record<string, string | string[] | undefined>',
  'searchParams: Promise<SearchParams>',
  'firstSearchParamValue',
  'searchEmptyCopyByLocale',
  'centerResultFromSearch',
  'pathname: "/centers"',
]) {
  assertIncludes(centersPage, token, 'src/app/[locale]/[country]/centers/page.tsx');
}
for (const forbiddenToken of ['sitemapPolicy', 'generateStaticParams', 'specialtySlug', 'areaSlug', 'geo_area', 'AggregateRating']) {
  assertNotIncludes(centersPage, forbiddenToken, 'src/app/[locale]/[country]/centers/page.tsx');
}

for (const routePath of [
  'src/app/[locale]/[country]/labs/page.tsx',
  'src/app/[locale]/[country]/pharmacies/page.tsx',
  'src/app/[locale]/[country]/hospitals/page.tsx',
]) {
  const routePage = readFile(routePath);
  for (const token of [
    'type SearchParams = Record<string, string | string[] | undefined>',
    'searchParams: Promise<SearchParams>',
    'firstSearchParamValue',
    'searchEmptyCopyByLocale',
    'centerTypeResultFromSearch',
  ]) {
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

console.log('Public listing card safety, directory graph, and center-type q SSR directory search checks passed.');
