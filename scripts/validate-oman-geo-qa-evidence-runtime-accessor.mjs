import fs from 'node:fs';

const contractPath = 'src/config/geo/qa-evidence-contract.ts';
const accessorPath = 'src/lib/geo/oman-qa-evidence.ts';

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

assert(contractSource.includes('currentQaEvidenceAvailable: false'), 'QA evidence contract must remain unavailable.');
assert(contractSource.includes('noindexRemovalAllowed: false'), 'QA evidence contract must keep noindex removal blocked.');
assert(contractSource.includes('sitemapPromotionAllowed: false'), 'QA evidence contract must keep sitemap promotion blocked.');
assert(contractSource.includes('jsonLdAllowed: false'), 'QA evidence contract must keep JSON-LD blocked.');
assert(contractSource.includes('indexPromotionAllowed: false'), 'QA evidence contract must keep index promotion blocked.');

assert(accessorSource.includes('OMAN_GEO_QA_EVIDENCE_CONTRACT'), 'QA evidence accessor must read the root contract.');
assert(accessorSource.includes('OMAN_GEO_QA_EVIDENCE_CONTRACTS'), 'QA evidence accessor must read entity contracts.');
assert(accessorSource.includes('listOmanGeoQaEvidenceContracts'), 'QA evidence accessor must expose a contract list helper.');
assert(accessorSource.includes('getOmanGeoQaEvidenceContract'), 'QA evidence accessor must expose a single-entity lookup helper.');
assert(accessorSource.includes('getOmanGeoQaEvidenceRuntimeState'), 'QA evidence accessor must expose runtime state helper.');
assert(accessorSource.includes('?? null'), 'QA evidence lookup must return null when the entity is absent.');
assert(accessorSource.includes('hasQaEvidence: OMAN_GEO_QA_EVIDENCE_CONTRACT.currentQaEvidenceAvailable'), 'Runtime state must derive QA evidence availability from the contract.');
assert(accessorSource.includes('noindexRemovalAllowed: false'), 'Runtime state must keep noindex removal blocked.');
assert(accessorSource.includes('sitemapPromotionAllowed: false'), 'Runtime state must keep sitemap promotion blocked.');
assert(accessorSource.includes('jsonLdAllowed: false'), 'Runtime state must keep JSON-LD blocked.');
assert(accessorSource.includes('indexPromotionAllowed: false'), 'Runtime state must keep index promotion blocked.');
assert(accessorSource.includes('canonicalReviewCompleteCount'), 'Runtime state must expose canonical review completion count.');
assert(accessorSource.includes('hreflangReviewCompleteCount'), 'Runtime state must expose hreflang review completion count.');
assert(accessorSource.includes('thinPageReviewCompleteCount'), 'Runtime state must expose thin-page review completion count.');
assert(accessorSource.includes('sitemapPolicyReviewCompleteCount'), 'Runtime state must expose sitemap policy review completion count.');
assert(accessorSource.includes('promotionPrApprovedCount'), 'Runtime state must expose promotion PR approval count.');

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
  assert(!accessorSource.includes(signal), `QA evidence accessor must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo QA evidence runtime accessor validated.');
console.log({
  hasQaEvidence: false,
  noindexRemovalAllowed: false,
  sitemapPromotionAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
});
