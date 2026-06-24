import fs from 'node:fs';

const geoPath = 'src/config/geo/oman.ts';
const contractPath = 'src/config/geo/route-contract.ts';
const metadataHelperPath = 'src/lib/seo/geo-route-metadata.ts';
const gatedMetadataHelperPath = 'src/lib/seo/oman-geo-gated-metadata.ts';
const indexPromotionPolicyPath = 'src/config/geo/index-promotion-policy.ts';

const expectedRouteNames = [
  'oman-governorate',
  'oman-wilayat',
  'oman-area',
];

const expectedRouteFiles = [
  'src/app/[locale]/[country]/oman/governorates/[governorateSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/wilayats/[wilayatSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/areas/[areaSlug]/page.tsx',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function section(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) return '';

  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

function countRegistryItems(source, exportName) {
  return section(source, exportName)
    .split('\n')
    .filter((line) => line.includes("slug: '")).length;
}

function collectProp(source, prop) {
  return [...source.matchAll(new RegExp(`${prop}: '([^']+)'`, 'g'))].map((match) => match[1]);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const geoSource = readFile(geoPath);
const contractSource = readFile(contractPath);
const metadataHelperSource = readFile(metadataHelperPath);
const gatedMetadataHelperSource = readFile(gatedMetadataHelperPath);
const indexPromotionPolicySource = readFile(indexPromotionPolicyPath);

assert(contractSource.includes("status: 'metadata-noindex'"), 'Route contract must be metadata-noindex.');
assert(contractSource.includes('runtimeRoutesEnabled: true'), 'Runtime routes must stay enabled.');
assert(contractSource.includes('metadataEnabled: true'), 'Metadata must be enabled for this scaffold.');
assert(contractSource.includes('noindexEnabled: true'), 'Noindex guardrail must be enabled.');
assert(contractSource.includes('sitemapEnabled: false'), 'Sitemap must remain disabled.');
assert(contractSource.includes('jsonLdEnabled: false'), 'JSON-LD must remain disabled.');

assert(metadataHelperSource.includes('buildOmanGeoNoindexMetadata'), 'Missing noindex metadata helper.');
assert(metadataHelperSource.includes('index: false'), 'Metadata helper must set index false.');
assert(metadataHelperSource.includes('follow: true'), 'Metadata helper must keep follow true.');
assert(gatedMetadataHelperSource.includes('buildOmanGeoGatedMetadata'), 'Missing gated metadata helper.');
assert(gatedMetadataHelperSource.includes('getOmanGeoPublicationGates'), 'Gated metadata helper must read publication gates.');
assert(gatedMetadataHelperSource.includes('buildOmanGeoNoindexMetadata(input)'), 'Gated metadata helper must preserve noindex output.');

assert(indexPromotionPolicySource.includes('OMAN_GEO_INDEX_PROMOTION_POLICY'), 'Missing Oman geo index promotion policy export.');
assert(indexPromotionPolicySource.includes("defaultStatus: 'blocked-until-content-ready'"), 'Geo index promotion must stay blocked by default.');
assert(indexPromotionPolicySource.includes('noindexRequiredByDefault: true'), 'Geo index promotion policy must require noindex by default.');
assert(indexPromotionPolicySource.includes('sitemapAllowedByDefault: false'), 'Geo index promotion policy must block sitemap by default.');
assert(indexPromotionPolicySource.includes('jsonLdAllowedByDefault: false'), 'Geo index promotion policy must block JSON-LD by default.');
assert(indexPromotionPolicySource.includes('promotionRequiresApprovedPr: true'), 'Geo index promotion must require an approved PR.');

for (const entity of ['governorate', 'wilayat', 'area']) {
  assert(indexPromotionPolicySource.includes(`entity: '${entity}'`), `Missing index promotion policy for ${entity}.`);
}

const routeNames = collectProp(contractSource, 'routeName');
const duplicateRouteNames = routeNames.filter((routeName, index) => routeNames.indexOf(routeName) !== index);

assert(duplicateRouteNames.length === 0, `Duplicate route names: ${duplicateRouteNames.join(', ')}`);

for (const routeName of expectedRouteNames) {
  assert(routeNames.includes(routeName), `Missing route template: ${routeName}`);
}

for (const routeFile of expectedRouteFiles) {
  assert(contractSource.includes(`routeFile: '${routeFile}'`), `Missing route file in contract: ${routeFile}`);

  const routeSource = readFile(routeFile);
  const usesNoindexMetadata = routeSource.includes('buildOmanGeoNoindexMetadata');
  const usesGatedMetadata = routeSource.includes('buildOmanGeoGatedMetadata');

  assert(routeSource.includes('notFound'), `Route file must guard invalid params: ${routeFile}`);
  assert(routeSource.includes('generateMetadata'), `Route file must generate noindex metadata: ${routeFile}`);
  assert(usesNoindexMetadata || usesGatedMetadata, `Route file must use noindex or gated metadata helper: ${routeFile}`);
  assert(!routeSource.includes('sitemap'), `Route scaffold must not generate sitemap behavior yet: ${routeFile}`);
  assert(!routeSource.includes('jsonLd'), `Route scaffold must not generate JSON-LD yet: ${routeFile}`);
}

assert(contractSource.includes('/[locale]/[country]/oman/governorates/[governorateSlug]'), 'Missing governorate path template.');
assert(contractSource.includes('/[locale]/[country]/oman/wilayats/[wilayatSlug]'), 'Missing wilayat path template.');
assert(contractSource.includes('/[locale]/[country]/oman/areas/[areaSlug]'), 'Missing area path template.');

const summary = {
  governorates: countRegistryItems(geoSource, 'OMAN_GOVERNORATES'),
  wilayats: countRegistryItems(geoSource, 'OMAN_WILAYATS'),
  areas: countRegistryItems(geoSource, 'OMAN_AREAS'),
  routeTemplates: routeNames.length,
  routeFiles: expectedRouteFiles.length,
  runtimeRoutesEnabled: true,
  metadataEnabled: true,
  noindexEnabled: true,
  gatedMetadataSupported: true,
  sitemapEnabled: false,
  jsonLdEnabled: false,
  indexPromotionDefault: 'blocked-until-content-ready',
};

console.log('Oman geo noindex metadata and index promotion guardrails validated.');
console.log(summary);
