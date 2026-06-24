import fs from 'node:fs';

const contractPath = 'src/config/geo/readiness-contract.ts';
const accessorPath = 'src/lib/geo/oman-readiness.ts';
const scaffoldPath = 'src/components/geo/oman-geo-runtime-scaffold.tsx';
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

const contractSource = readFile(contractPath);
const accessorSource = readFile(accessorPath);
const scaffoldSource = readFile(scaffoldPath);
const packageSource = readFile(packagePath);

assert(contractSource.includes('OMAN_GEO_READINESS_CONTRACT'), 'Missing unified readiness contract export.');
assert(contractSource.includes('OMAN_GEO_READINESS_ENTITY_CONTRACTS'), 'Missing entity readiness contracts.');
assert(contractSource.includes("status: 'blocked-evidence-missing'"), 'Readiness status must remain blocked.');
assert(contractSource.includes('readyForPromotionReview: false'), 'Readiness contract must not allow promotion review yet.');
assert(contractSource.includes('noindexRemovalAllowed: false'), 'Readiness contract must not allow noindex removal.');
assert(contractSource.includes('sitemapPromotionAllowed: false'), 'Readiness contract must not allow sitemap promotion.');
assert(contractSource.includes('jsonLdAllowed: false'), 'Readiness contract must not allow JSON-LD.');
assert(contractSource.includes('indexPromotionAllowed: false'), 'Readiness contract must not allow index promotion.');

for (const signal of ['provider-inventory', 'editorial-content', 'qa-evidence', 'index-promotion-eligibility']) {
  assert(contractSource.includes(`key: '${signal}'`), `Readiness contract must include signal: ${signal}.`);
}

assert(accessorSource.includes('getOmanGeoReadiness'), 'Missing unified readiness accessor.');
assert(accessorSource.includes('getOmanGeoReadinessContract'), 'Missing readiness contract lookup helper.');
assert(accessorSource.includes('getOmanGeoProviderInventoryContract'), 'Readiness accessor must read provider inventory state.');
assert(accessorSource.includes('getOmanGeoEditorialContent(input)'), 'Readiness accessor must read localized editorial content state.');
assert(accessorSource.includes('getOmanGeoQaEvidenceContract'), 'Readiness accessor must read QA evidence state.');
assert(accessorSource.includes('getOmanGeoIndexPromotionEligibility(input)'), 'Readiness accessor must read index eligibility state.');
assert(accessorSource.includes('providerInventoryReady'), 'Readiness accessor must expose provider readiness.');
assert(accessorSource.includes('editorialContentReady'), 'Readiness accessor must expose editorial readiness.');
assert(accessorSource.includes('qaEvidenceReady'), 'Readiness accessor must expose QA readiness.');
assert(accessorSource.includes('indexPromotionEligibilityReady'), 'Readiness accessor must expose index eligibility readiness.');
assert(accessorSource.includes('readyForPromotionReview = false'), 'Readiness accessor must keep promotion review blocked.');
assert(accessorSource.includes('noindexRemovalAllowed: false'), 'Readiness accessor must keep noindex removal blocked.');
assert(accessorSource.includes('sitemapPromotionAllowed: false'), 'Readiness accessor must keep sitemap promotion blocked.');
assert(accessorSource.includes('jsonLdAllowed: false'), 'Readiness accessor must keep JSON-LD blocked.');
assert(accessorSource.includes('indexPromotionAllowed: false'), 'Readiness accessor must keep index promotion blocked.');
assert(accessorSource.includes('provider-inventory-not-ready'), 'Readiness accessor must block on provider readiness.');
assert(accessorSource.includes('editorial-content-not-ready'), 'Readiness accessor must block on editorial readiness.');
assert(accessorSource.includes('qa-evidence-not-ready'), 'Readiness accessor must block on QA readiness.');
assert(accessorSource.includes('index-promotion-eligibility-not-ready'), 'Readiness accessor must block on index eligibility readiness.');

assert(scaffoldSource.includes('OmanGeoReadinessRuntimeState'), 'Runtime scaffold must accept typed readiness state.');
assert(scaffoldSource.includes('readiness?: OmanGeoReadinessRuntimeState | null'), 'Runtime scaffold must accept nullable readiness.');
assert(scaffoldSource.includes('readiness = null'), 'Runtime scaffold must default readiness to null.');
assert(scaffoldSource.includes('data-readiness-status'), 'Runtime scaffold must expose readiness status for QA.');
assert(scaffoldSource.includes('data-ready-for-promotion-review'), 'Runtime scaffold must expose promotion review readiness for QA.');
assert(scaffoldSource.includes('readiness.providerInventoryReady'), 'Runtime scaffold must render provider readiness.');
assert(scaffoldSource.includes('readiness.editorialContentReady'), 'Runtime scaffold must render editorial readiness.');
assert(scaffoldSource.includes('readiness.qaEvidenceReady'), 'Runtime scaffold must render QA readiness.');
assert(scaffoldSource.includes('readiness.indexPromotionEligibilityReady'), 'Runtime scaffold must render index eligibility readiness.');
assert(scaffoldSource.includes('readiness.blockedReasons'), 'Runtime scaffold must render readiness blockers.');

for (const route of routeFiles) {
  const source = readFile(route.path);

  assert(source.includes('getOmanGeoReadiness'), `Route must import unified readiness accessor: ${route.path}`);
  assert(source.includes(`entity: '${route.entity}'`), `Route must request readiness for ${route.entity}: ${route.path}`);
  assert(source.includes('const readiness = getOmanGeoReadiness'), `Route must call unified readiness accessor: ${route.path}`);
  assert(source.includes('editorialContent={readiness.editorialContent}'), `Route must pass readiness editorial content: ${route.path}`);
  assert(source.includes('providerInventory={readiness.providerInventory}'), `Route must pass readiness provider inventory: ${route.path}`);
  assert(source.includes('indexPromotionEligibility={readiness.indexPromotionEligibility}'), `Route must pass readiness index eligibility: ${route.path}`);
  assert(source.includes('readiness={readiness}'), `Route must pass unified readiness to scaffold: ${route.path}`);
}

assert(packageSource.includes('geo:readiness-runtime:validate'), 'package.json must include readiness runtime validation script.');
assert(packageSource.includes('pnpm geo:readiness-runtime:validate'), 'geo:check:oman must include readiness runtime validation.');

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
  assert(!accessorSource.includes(signal), `Readiness accessor must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo unified readiness runtime validated.');
console.log({
  routes: routeFiles.length,
  readyForPromotionReview: false,
  noindexRemovalAllowed: false,
  sitemapPromotionAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
});
