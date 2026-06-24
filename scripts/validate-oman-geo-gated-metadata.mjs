import fs from 'node:fs';

const helperPath = 'src/lib/seo/oman-geo-gated-metadata.ts';
const noindexHelperPath = 'src/lib/seo/geo-route-metadata.ts';
const packagePath = 'package.json';
const routeFiles = [
  {
    path: 'src/app/[locale]/[country]/oman/governorates/[governorateSlug]/page.tsx',
    entity: 'governorate',
  },
  {
    path: 'src/app/[locale]/[country]/oman/wilayats/[wilayatSlug]/page.tsx',
    entity: 'wilayat',
  },
  {
    path: 'src/app/[locale]/[country]/oman/areas/[areaSlug]/page.tsx',
    entity: 'area',
  },
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

const helperSource = readFile(helperPath);
const noindexHelperSource = readFile(noindexHelperPath);
const packageSource = readFile(packagePath);

assert(helperSource.includes('buildOmanGeoGatedMetadata'), 'Missing gated metadata helper.');
assert(helperSource.includes('getOmanGeoReadiness'), 'Gated metadata helper must read readiness.');
assert(helperSource.includes('getOmanGeoPublicationGates'), 'Gated metadata helper must read publication gates.');
assert(helperSource.includes('buildOmanGeoNoindexMetadata(input)'), 'Gated metadata helper must fall back to noindex metadata.');
assert(helperSource.includes('publicationGates.noindexRemovalAllowed'), 'Gated metadata helper must inspect noindex gate.');
assert(helperSource.includes('publicationGates.sitemapPromotionAllowed'), 'Gated metadata helper must inspect sitemap gate.');
assert(helperSource.includes('publicationGates.jsonLdAllowed'), 'Gated metadata helper must inspect JSON-LD gate.');
assert(helperSource.includes('publicationGates.indexPromotionAllowed'), 'Gated metadata helper must inspect index gate.');
assert(!helperSource.includes('robots: { index: true'), 'Gated metadata helper must not create indexable robots metadata.');
assert(!helperSource.includes('alternates:'), 'Gated metadata helper must not add new alternates behavior.');
assert(!helperSource.includes('application/ld+json'), 'Gated metadata helper must not generate JSON-LD payloads.');
assert(!helperSource.includes('schema.org'), 'Gated metadata helper must not generate schema payloads.');
assert(noindexHelperSource.includes('index: false'), 'Base geo metadata helper must keep noindex robots.');

for (const route of routeFiles) {
  const source = readFile(route.path);

  assert(source.includes('buildOmanGeoGatedMetadata'), `Route must import gated metadata helper: ${route.path}`);
  assert(source.includes('return buildOmanGeoGatedMetadata({'), `Route must call gated metadata helper: ${route.path}`);
  assert(source.includes(`entity: '${route.entity}'`), `Route must pass correct entity to gated metadata helper: ${route.path}`);
  assert(!source.includes('buildOmanGeoNoindexMetadata'), `Route must not call noindex helper directly: ${route.path}`);
  assert(!source.includes('sitemap'), `Route metadata integration must not add sitemap behavior: ${route.path}`);
  assert(!source.includes('jsonLd'), `Route metadata integration must not add JSON-LD behavior: ${route.path}`);
}

assert(packageSource.includes('geo:gated-metadata:validate'), 'package.json must include gated metadata validation script.');
assert(packageSource.includes('pnpm geo:gated-metadata:validate'), 'geo:check:oman must include gated metadata validation.');

const forbiddenRuntimeSignals = [
  '@supabase/',
  'createClient',
  'from(',
  'select(',
  'fetch(',
  'axios',
  'prisma',
];

for (const signal of forbiddenRuntimeSignals) {
  assert(!helperSource.includes(signal), `Gated metadata helper must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo gated metadata validated.');
console.log({
  routeFiles: routeFiles.length,
  gatedMetadata: true,
  noindexPreserved: true,
  sitemapAdded: false,
  jsonLdAdded: false,
  indexPromotionAdded: false,
});
