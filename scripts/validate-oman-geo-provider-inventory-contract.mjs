import fs from 'node:fs';

const inventoryContractPath = 'src/config/geo/provider-inventory-contract.ts';
const readinessContractPath = 'src/config/geo/provider-readiness-contract.ts';
const indexPromotionPath = 'src/config/geo/index-promotion-policy.ts';

const expectedEntities = ['governorate', 'wilayat', 'area'];
const expectedMinimumPublishedProviders = {
  governorate: 12,
  wilayat: 6,
  area: 3,
};

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function sectionForEntity(source, entity) {
  const marker = `entity: '${entity}'`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';

  const start = source.lastIndexOf('{', markerIndex);
  const end = source.indexOf('\n  },', markerIndex);
  return source.slice(start, end === -1 ? source.length : end);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const inventorySource = readFile(inventoryContractPath);
const readinessSource = readFile(readinessContractPath);
const promotionSource = readFile(indexPromotionPath);

assert(inventorySource.includes('OMAN_GEO_PROVIDER_INVENTORY_CONTRACT'), 'Missing provider inventory contract export.');
assert(inventorySource.includes("status: 'contract-only'"), 'Provider inventory contract must remain contract-only.');
assert(inventorySource.includes('currentInventoryEvidenceAvailable: false'), 'Inventory evidence must remain unavailable.');
assert(!inventorySource.includes('currentInventoryEvidenceAvailable: true'), 'Provider inventory contract must not claim inventory evidence exists yet.');
assert(inventorySource.includes('providerQueryAllowed: false'), 'Provider query must remain blocked.');
assert(inventorySource.includes('databaseAccessAllowed: false'), 'Database access must remain blocked.');
assert(inventorySource.includes('promotionRequiresRuntimeEvidence: true'), 'Provider inventory promotion must require runtime evidence.');
assert(inventorySource.includes('promotionRequiresApprovedPr: true'), 'Provider inventory promotion must require an approved PR.');
assert(!inventorySource.includes('providerQueryAllowed: true'), 'Provider inventory contract must not enable provider queries.');
assert(!inventorySource.includes('databaseAccessAllowed: true'), 'Provider inventory contract must not enable database access.');
assert(!inventorySource.includes('indexPromotionAllowed: true'), 'Provider inventory contract must not allow index promotion.');
assert(!inventorySource.includes('sitemapPromotionAllowed: true'), 'Provider inventory contract must not allow sitemap promotion.');

for (const entity of expectedEntities) {
  const inventorySection = sectionForEntity(inventorySource, entity);
  const readinessSection = sectionForEntity(readinessSource, entity);
  const promotionSection = sectionForEntity(promotionSource, entity);

  assert(inventorySection, `Missing provider inventory contract for ${entity}.`);
  assert(readinessSection, `Missing provider readiness contract for ${entity}.`);
  assert(promotionSection, `Missing index promotion policy for ${entity}.`);

  assert(inventorySection.includes(`minimumPublishedProviders: ${expectedMinimumPublishedProviders[entity]}`), `Provider inventory threshold mismatch for ${entity}.`);
  assert(readinessSection.includes(`minimumPublishedProviders: ${expectedMinimumPublishedProviders[entity]}`), `Provider readiness threshold mismatch for ${entity}.`);
  assert(promotionSection.includes(`minimumPublishedProviders: ${expectedMinimumPublishedProviders[entity]}`), `Index promotion provider threshold mismatch for ${entity}.`);
  assert(inventorySection.includes("status: 'contract-only'"), `Provider inventory status must remain contract-only for ${entity}.`);
  assert(inventorySection.includes("source: 'future-provider-index'"), `Provider inventory source must remain future-provider-index for ${entity}.`);
  assert(inventorySection.includes('publishedProviderCount: 0'), `Published provider count must remain zero for ${entity}.`);
  assert(inventorySection.includes('verifiedProviderCount: 0'), `Verified provider count must remain zero for ${entity}.`);
  assert(inventorySection.includes('acceptsAppointmentsCount: 0'), `Appointment provider count must remain zero for ${entity}.`);
  assert(inventorySection.includes('requiresPublishedProviderProfiles: true'), `Published provider profiles must be required for ${entity}.`);
  assert(inventorySection.includes('requiresHumanReview: true'), `Human review must be required for ${entity}.`);
  assert(inventorySection.includes('providerQueryAllowed: false'), `Provider query must be blocked for ${entity}.`);
  assert(inventorySection.includes('databaseAccessAllowed: false'), `Database access must be blocked for ${entity}.`);
  assert(inventorySection.includes('indexPromotionAllowed: false'), `Index promotion must be blocked for ${entity}.`);
  assert(inventorySection.includes('sitemapPromotionAllowed: false'), `Sitemap promotion must be blocked for ${entity}.`);
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
  assert(!inventorySource.includes(signal), `Provider inventory contract must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo provider inventory contract validated.');
console.log({
  entities: expectedEntities.length,
  currentInventoryEvidenceAvailable: false,
  providerQueryAllowed: false,
  databaseAccessAllowed: false,
  indexPromotionAllowed: false,
  sitemapPromotionAllowed: false,
});
