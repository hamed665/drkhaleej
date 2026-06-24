import fs from 'node:fs';

const gatePath = 'src/lib/geo/oman-index-promotion-eligibility.ts';
const indexPromotionPolicyPath = 'src/config/geo/index-promotion-policy.ts';
const providerInventoryAccessorPath = 'src/lib/geo/oman-provider-inventory.ts';
const editorialContentAccessorPath = 'src/lib/geo/oman-editorial-content.ts';
const qaEvidenceAccessorPath = 'src/lib/geo/oman-qa-evidence.ts';

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
const qaEvidenceSource = readFile(qaEvidenceAccessorPath);

assert(policySource.includes("defaultStatus: 'blocked-until-content-ready'"), 'Index promotion policy must remain blocked by default.');
assert(policySource.includes('noindexRequiredByDefault: true'), 'Noindex must remain required by default.');
assert(policySource.includes('sitemapAllowedByDefault: false'), 'Sitemap promotion must remain blocked by default.');
assert(policySource.includes('jsonLdAllowedByDefault: false'), 'JSON-LD must remain blocked by default.');

assert(providerSource.includes('hasRuntimeEvidence: false'), 'Provider inventory runtime accessor must not claim runtime evidence yet.');
assert(providerSource.includes('providerQueryAllowed: false'), 'Provider inventory runtime accessor must keep provider query disabled.');
assert(providerSource.includes('databaseAccessAllowed: false'), 'Provider inventory runtime accessor must keep database access disabled.');
assert(editorialSource.includes('registryEnabled: false'), 'Editorial content runtime accessor must keep registry disabled.');
assert(qaEvidenceSource.includes('hasQaEvidence: OMAN_GEO_QA_EVIDENCE_CONTRACT.currentQaEvidenceAvailable'), 'QA evidence runtime accessor must derive QA evidence availability from the contract.');
assert(qaEvidenceSource.includes('noindexRemovalAllowed: false'), 'QA evidence runtime accessor must keep noindex removal blocked.');
assert(qaEvidenceSource.includes('sitemapPromotionAllowed: false'), 'QA evidence runtime accessor must keep sitemap promotion blocked.');
assert(qaEvidenceSource.includes('jsonLdAllowed: false'), 'QA evidence runtime accessor must keep JSON-LD blocked.');
assert(qaEvidenceSource.includes('indexPromotionAllowed: false'), 'QA evidence runtime accessor must keep index promotion blocked.');

assert(gateSource.includes('OMAN_GEO_INDEX_PROMOTION_POLICIES'), 'Eligibility gate must read index promotion policies.');
assert(gateSource.includes('getOmanGeoIndexPromotionPolicy'), 'Eligibility gate must expose policy lookup helper.');
assert(gateSource.includes('getOmanGeoIndexPromotionEligibility'), 'Eligibility gate must expose eligibility helper.');
assert(gateSource.includes('getOmanGeoProviderInventoryContract'), 'Eligibility gate must read provider inventory contract state.');
assert(gateSource.includes('getOmanGeoProviderInventoryRuntimeState'), 'Eligibility gate must read provider inventory runtime state.');
assert(gateSource.includes('getOmanGeoEditorialContent(input)'), 'Eligibility gate must read localized editorial content state.');
assert(gateSource.includes('getOmanGeoEditorialContentRuntimeState'), 'Eligibility gate must read editorial content runtime state.');
assert(gateSource.includes('getOmanGeoQaEvidenceContract'), 'Eligibility gate must read QA evidence contract state.');
assert(gateSource.includes('getOmanGeoQaEvidenceRuntimeState'), 'Eligibility gate must read QA evidence runtime state.');
assert(gateSource.includes("status: 'blocked-until-content-ready'"), 'Eligibility gate must keep status blocked in this phase.');
assert(gateSource.includes('eligibleForIndexPromotion: false'), 'Eligibility gate must not allow index promotion in this phase.');
assert(gateSource.includes('noindexRequired: true'), 'Eligibility gate must keep noindex required.');
assert(gateSource.includes('sitemapAllowed: false'), 'Eligibility gate must keep sitemap blocked.');
assert(gateSource.includes('jsonLdAllowed: false'), 'Eligibility gate must keep JSON-LD blocked.');
assert(gateSource.includes('providerInventoryMeetsThreshold'), 'Eligibility gate must expose provider inventory threshold result.');
assert(gateSource.includes('editorialContentExists'), 'Eligibility gate must expose editorial content result.');
assert(gateSource.includes('qaEvidenceComplete'), 'Eligibility gate must expose QA evidence completion result.');
assert(gateSource.includes('canonicalReviewComplete'), 'Eligibility gate must expose canonical review completion result.');
assert(gateSource.includes('hreflangReviewComplete'), 'Eligibility gate must expose hreflang review completion result.');
assert(gateSource.includes('thinPageReviewComplete'), 'Eligibility gate must expose thin-page review completion result.');
assert(gateSource.includes('sitemapPolicyReviewComplete'), 'Eligibility gate must expose sitemap policy review completion result.');
assert(gateSource.includes('promotionPrApproved'), 'Eligibility gate must expose promotion PR approval result.');
assert(gateSource.includes('provider-inventory-runtime-evidence-unavailable'), 'Eligibility gate must block on missing provider runtime evidence.');
assert(gateSource.includes('published-editorial-content-unavailable'), 'Eligibility gate must block on missing published editorial content.');
assert(gateSource.includes('localized-editorial-content-missing'), 'Eligibility gate must block on missing localized editorial content.');
assert(gateSource.includes('qa-evidence-runtime-unavailable'), 'Eligibility gate must block on missing QA runtime evidence.');
assert(gateSource.includes('canonical-review-incomplete'), 'Eligibility gate must block on incomplete canonical review.');
assert(gateSource.includes('hreflang-review-incomplete'), 'Eligibility gate must block on incomplete hreflang review.');
assert(gateSource.includes('thin-page-review-incomplete'), 'Eligibility gate must block on incomplete thin-page review.');
assert(gateSource.includes('sitemap-policy-review-incomplete'), 'Eligibility gate must block on incomplete sitemap policy review.');
assert(gateSource.includes('promotion-pr-approval-missing'), 'Eligibility gate must block on missing promotion PR approval.');

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
  qaEvidenceComplete: false,
});
