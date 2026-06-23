import fs from 'node:fs';

const inventoryContractPath = 'src/config/geo/provider-inventory-contract.ts';
const accessorPath = 'src/lib/geo/oman-provider-inventory.ts';

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

const inventoryContractSource = readFile(inventoryContractPath);
const accessorSource = readFile(accessorPath);

assert(inventoryContractSource.includes('currentInventoryEvidenceAvailable: false'), 'Inventory evidence must remain unavailable in the contract.');
assert(inventoryContractSource.includes('providerQueryAllowed: false'), 'Provider queries must remain blocked in the contract.');
assert(inventoryContractSource.includes('databaseAccessAllowed: false'), 'Database access must remain blocked in the contract.');
assert(inventoryContractSource.includes('publishedProviderCount: 0'), 'Published provider count must remain zero in the contract phase.');

assert(accessorSource.includes('OMAN_GEO_PROVIDER_INVENTORY_CONTRACTS'), 'Accessor must read provider inventory contracts.');
assert(accessorSource.includes('listOmanGeoProviderInventoryContracts'), 'Accessor must expose a contract list helper.');
assert(accessorSource.includes('getOmanGeoProviderInventoryContract'), 'Accessor must expose a single-entity lookup helper.');
assert(accessorSource.includes('getOmanGeoProviderInventoryRuntimeState'), 'Accessor must expose runtime state helper.');
assert(accessorSource.includes('hasRuntimeEvidence: false'), 'Runtime state must not claim provider inventory evidence exists yet.');
assert(accessorSource.includes('providerQueryAllowed: false'), 'Runtime state must keep provider queries disabled.');
assert(accessorSource.includes('databaseAccessAllowed: false'), 'Runtime state must keep database access disabled.');
assert(accessorSource.includes('indexPromotionAllowed: false'), 'Runtime state must keep index promotion blocked.');
assert(accessorSource.includes('sitemapPromotionAllowed: false'), 'Runtime state must keep sitemap promotion blocked.');
assert(accessorSource.includes('?? null'), 'Provider inventory lookup must return null when the entity is absent.');
assert(accessorSource.includes('contract.publishedProviderCount'), 'Runtime state must derive published provider count from contract counts.');
assert(accessorSource.includes('contract.verifiedProviderCount'), 'Runtime state must derive verified provider count from contract counts.');
assert(accessorSource.includes('contract.acceptsAppointmentsCount'), 'Runtime state must derive appointment provider count from contract counts.');

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

console.log('Oman geo provider inventory runtime accessor validated.');
console.log({
  hasRuntimeEvidence: false,
  providerQueryAllowed: false,
  databaseAccessAllowed: false,
  indexPromotionAllowed: false,
  sitemapPromotionAllowed: false,
});
