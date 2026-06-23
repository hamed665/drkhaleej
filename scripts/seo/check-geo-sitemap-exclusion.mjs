import fs from 'node:fs';

const sitemapPath = 'src/app/sitemap.ts';
const contractPath = 'src/config/geo/route-contract.ts';

const forbiddenSitemapTokens = [
  '/oman/governorates',
  '/oman/wilayats',
  '/oman/areas',
  'governorateSlug',
  'wilayatSlug',
  'areaSlug',
  'OMAN_GOVERNORATES',
  'OMAN_WILAYATS',
  'OMAN_AREAS',
  'OMAN_GEO_REGISTRY',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const sitemapSource = readFile(sitemapPath);
const contractSource = readFile(contractPath);

assert(contractSource.includes("status: 'metadata-noindex'"), 'Geo route contract must remain metadata-noindex before sitemap inclusion.');
assert(contractSource.includes('noindexEnabled: true'), 'Geo route contract must keep noindex enabled before sitemap inclusion.');
assert(contractSource.includes('sitemapEnabled: false'), 'Geo route contract must keep sitemap disabled before sitemap inclusion.');

for (const token of forbiddenSitemapTokens) {
  assert(!sitemapSource.includes(token), `src/app/sitemap.ts must not include geo noindex route token: ${token}`);
}

assert(!/from\s+['"]@\/config\/geo\/oman['"]/.test(sitemapSource), 'src/app/sitemap.ts must not import the Oman geo registry while geo routes are noindex.');
assert(!/from\s+['"]@\/config\/geo\/route-contract['"]/.test(sitemapSource), 'src/app/sitemap.ts must not import geo route contract while geo routes are noindex.');

console.log('Geo sitemap exclusion guardrail passed.');
console.log({
  sitemap: sitemapPath,
  contract: contractPath,
  blockedTokens: forbiddenSitemapTokens.length,
  noindexRequired: true,
  sitemapEnabled: false,
});
