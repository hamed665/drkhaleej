import fs from 'node:fs';

const accessorPath = 'src/lib/geo/oman-provider-inventory.ts';
const readinessAccessorPath = 'src/lib/geo/oman-readiness.ts';
const scaffoldPath = 'src/components/geo/oman-geo-runtime-scaffold.tsx';
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

const accessorSource = readFile(accessorPath);
const readinessAccessorSource = readFile(readinessAccessorPath);
const scaffoldSource = readFile(scaffoldPath);

assert(accessorSource.includes('getOmanGeoProviderInventoryContract'), 'Missing provider inventory lookup helper.');
assert(accessorSource.includes('getOmanGeoProviderInventoryRuntimeState'), 'Missing provider inventory runtime state helper.');
assert(accessorSource.includes('hasRuntimeEvidence: false'), 'Provider inventory runtime state must not claim runtime evidence yet.');
assert(accessorSource.includes('providerQueryAllowed: false'), 'Provider inventory runtime state must keep provider query disabled.');
assert(accessorSource.includes('databaseAccessAllowed: false'), 'Provider inventory runtime state must keep database access disabled.');

assert(readinessAccessorSource.includes('getOmanGeoProviderInventoryContract'), 'Readiness accessor must read provider inventory state.');
assert(readinessAccessorSource.includes('providerInventoryReady'), 'Readiness accessor must expose provider inventory readiness.');
assert(readinessAccessorSource.includes('provider-inventory-not-ready'), 'Readiness accessor must block on missing provider inventory readiness.');

assert(scaffoldSource.includes('OmanGeoProviderInventoryEntityContract'), 'Runtime scaffold must accept typed provider inventory.');
assert(scaffoldSource.includes('providerInventory?: OmanGeoProviderInventoryEntityContract | null'), 'Runtime scaffold must accept nullable provider inventory.');
assert(scaffoldSource.includes('providerInventory = null'), 'Runtime scaffold must default provider inventory to null.');
assert(scaffoldSource.includes('data-provider-inventory-status'), 'Runtime scaffold must expose provider inventory status for QA.');
assert(scaffoldSource.includes('providerInventory.minimumPublishedProviders'), 'Runtime scaffold must expose minimum published provider threshold.');
assert(scaffoldSource.includes('providerInventory.publishedProviderCount'), 'Runtime scaffold must expose published provider count.');
assert(scaffoldSource.includes('providerInventory.status'), 'Runtime scaffold must expose provider inventory status.');
assert(scaffoldSource.includes('providerEmpty'), 'Runtime scaffold must render safe provider inventory empty state when absent.');

for (const route of routeFiles) {
  const source = readFile(route.path);
  const usesDirectProviderInventory =
    source.includes('getOmanGeoProviderInventoryContract') &&
    source.includes('const providerInventory = getOmanGeoProviderInventoryContract({') &&
    source.includes('providerInventory={providerInventory}');
  const usesUnifiedReadiness =
    source.includes('getOmanGeoReadiness') &&
    source.includes('const readiness = getOmanGeoReadiness') &&
    source.includes('providerInventory={readiness.providerInventory}') &&
    source.includes('readiness={readiness}');

  assert(
    usesDirectProviderInventory || usesUnifiedReadiness,
    `Route must wire provider inventory directly or through unified readiness: ${route.path}`,
  );
  assert(source.includes(`entity: '${route.entity}'`), `Route must use correct provider inventory entity: ${route.path}`);
  assert(!source.includes('sitemap'), `Route integration must not add sitemap behavior: ${route.path}`);
  assert(!source.includes('jsonLd'), `Route integration must not add JSON-LD behavior: ${route.path}`);
}

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
  assert(!accessorSource.includes(signal), `Provider inventory accessor must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo provider inventory route integration validated.');
console.log({
  routeFiles: routeFiles.length,
  providerInventoryRouteIntegration: true,
  supportsUnifiedReadiness: true,
  providerQueryAllowed: false,
  databaseAccessAllowed: false,
});
