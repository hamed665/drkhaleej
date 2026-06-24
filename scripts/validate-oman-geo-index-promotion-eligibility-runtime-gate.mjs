import fs from 'node:fs';

const gatePath = 'src/lib/geo/oman-index-promotion-eligibility.ts';
const indexPromotionPolicyPath = 'src/config/geo/index-promotion-policy.ts';
const providerInventoryAccessorPath = 'src/lib/geo/oman-provider-inventory.ts';
const editorialContentAccessorPath = 'src/lib/geo/oman-editorial-content.ts';

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

const gateSource = readFile(gatePath);
const policySource = readFile(indexPromotionPolicyPath);
const providerSource = readFile(providerInventoryAccessorPath);
const editorialSource = readFile(editorialContentAccessorPath);

assert(policySource.includes("defaultStatus: 'blocked-until-content-ready'"), 'Index promotion policy must remain blocked by default.');
assert(policySource.includes('noindexRequiredByDefault: true'), 'Noindex must remain required by default.');
assert(policySource.includes('sitemapAllowedByDefault: false'), 'Sitemap promotion must remain blocked by default.');
assert(policySource.includes('jsonLdAllowedByDefault: false'), 'JSON-LD must remain blocked by default.');

assert(providerSource.includes('hasRuntimeEvidence: false'), 'Provider inventory runtime accessor must not claim runtime evidence yet.');
assert(providerSource.includes('providerQueryAllowed: false'), 'Provider inventory runtime accessor must keep provider query disabled.');
assert(providerSource.includes('databaseAccessAllowed: false'), 'Provider inventory runtime accessor must keep database access disabled.');
assert(editorialSource.includes('registryEnabled: false'), 'Editorial content runtime accessor must keep registry disabled.');

assert(gateSource.includes('OMAN_GEO_INDEX_PROMOTION_POLICIES'), 'Eligibility gate must read index promotion policies.');
assert(gateSource.includes('getOmanGeoIndexPromotionPolicy'), 'Eligibility gate must expose policy lookup helper.');
assert(gateSource.includes('getOmanGeoIndexPromotionEligibility'), 'Eligibility gate must expose eligibility helper.');
assert(gateSource.includes('getOmanGeoProviderInventoryContract'), 'Eligibility gate must read provider inventory contract state.');
assert(gateSource.includes('getOmanGeoProviderInventoryRuntimeState'), 'Eligibility gate must read provider inventory runtime state.');
assert(gateSource.includes('getOmanGeoEditorialContent(input)'), 'Eligibility gate must read localized editorial content state.');
assert(gateSource.includes('getOmanGeoEditorialContentRuntimeState'), 'Eligibility gate must read editorial content runtime state.');
assert(gateSource.includes("status: 'blocked-until-content-ready'"), 'Eligibility gate must keep status blocked in this phase.');
assert(gateSource.includes('eligibleForIndexPromotion: false'), 'Eligibility gate must not allow index promotion in this phase.');
assert(gateSource.includes('noindexRequired: true'), 'Eligibility gate must keep noindex required.');
assert(gateSource.includes('sitemapAllowed: false'), 'Eligibility gate must keep sitemap blocked.');
assert(gateSource.includes('jsonLdAllowed: false'), 'Eligibility gate must keep JSON-LD blocked.');
assert(gateSource.includes('providerInventoryMeetsThreshold'), 'Eligibility gate must expose provider inventory threshold result.');
assert(gateSource.includes('editorialContentExists'), 'Eligibility gate must expose editorial content result.');
assert(gateSource.includes('provider-inventory-runtime-evidence-unavailable'), 'Eligibility gate must block on missing provider runtime evidence.');
assert(gateSource.includes('published-editorial-content-unavailable'), 'Eligibility gate must block on missing published editorial content.');
assert(gateSource.includes('localized-editorial-content-missing'), 'Eligibility gate must block on missing localized editorial content.');

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
  assert(!gateSource.includes(signal), `Eligibility gate must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo index promotion eligibility runtime gate validated.');
console.log({
  eligibleForIndexPromotion: false,
  noindexRequired: true,
  sitemapAllowed: false,
  jsonLdAllowed: false,
});
