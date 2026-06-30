import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include: ${token}`);
}

function mustNotHave(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include: ${token}`);
}

const searchPath = 'src/app/[locale]/[country]/search/page.tsx';
const registryPath = 'src/lib/seo/page-registry.ts';
const urlRegistryPath = 'src/lib/seo/url-registry-v2.ts';

const search = read(searchPath);
const registry = read(registryPath);
const urlRegistry = read(urlRegistryPath);

for (const token of [
  'Search results are being prepared',
  'does not show fake counts, ratings, reviews, or verified badges',
  'Your search is preserved in the route query parameters.',
  'submittedFilters',
  'firstSearchParamValue',
  'searchParams: Promise<SearchParams>',
  "pathname: '/search'",
]) {
  mustHave(search, token, searchPath);
}

for (const token of [
  'searchPublicCatalog',
  'PublicListingGrid',
  'PublicListingCard',
  'results.map',
  'Total results',
  'Top rated',
  'Verified badge',
]) {
  mustNotHave(search, token, searchPath);
}

for (const token of [
  "pathname: '/search'",
  "indexPolicy: 'noindex_until_ready'",
  "sitemapEligible: false",
  "launchGateReason: 'search-utility-noindex'",
]) {
  mustHave(registry, token, registryPath);
}

for (const token of [
  "id: 'search'",
  "family: 'search_utility'",
  "indexPolicy: 'noindex'",
  "sitemapPolicy: 'exclude'",
  "gate: 'search_noindex'",
]) {
  mustHave(urlRegistry, token, urlRegistryPath);
}

console.log('Search mode contract checks passed.');
