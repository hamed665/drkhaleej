import fs from 'node:fs';

const qaEvidenceContractPath = 'src/config/geo/qa-evidence-contract.ts';
const indexPromotionPolicyPath = 'src/config/geo/index-promotion-policy.ts';

const expectedEntities = ['governorate', 'wilayat', 'area'];
const expectedRequirementKeys = [
  'canonical-review',
  'hreflang-review',
  'thin-page-review',
  'sitemap-policy-review',
  'promotion-pr-approval',
];

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

const qaSource = readFile(qaEvidenceContractPath);
const promotionSource = readFile(indexPromotionPolicyPath);

assert(qaSource.includes('OMAN_GEO_QA_EVIDENCE_CONTRACT'), 'Missing QA evidence contract export.');
assert(qaSource.includes("status: 'contract-only'"), 'QA evidence contract must remain contract-only.');
assert(qaSource.includes('currentQaEvidenceAvailable: false'), 'QA evidence must remain unavailable.');
assert(qaSource.includes('promotionRequiresApprovedPr: true'), 'QA evidence contract must require approved promotion PR.');
assert(!qaSource.includes('currentQaEvidenceAvailable: true'), 'QA evidence contract must not claim QA evidence exists yet.');
assert(!qaSource.includes('noindexRemovalAllowed: true'), 'QA evidence contract must not allow noindex removal.');
assert(!qaSource.includes('sitemapPromotionAllowed: true'), 'QA evidence contract must not allow sitemap promotion.');
assert(!qaSource.includes('jsonLdAllowed: true'), 'QA evidence contract must not allow JSON-LD.');
assert(!qaSource.includes('indexPromotionAllowed: true'), 'QA evidence contract must not allow index promotion.');

for (const key of expectedRequirementKeys) {
  assert(qaSource.includes(`key: '${key}'`), `Missing QA evidence requirement: ${key}.`);
}

assert(promotionSource.includes('canonical-and-hreflang-qa'), 'Index promotion policy must still require canonical and hreflang QA.');
assert(promotionSource.includes('thin-page-review'), 'Index promotion policy must still require thin-page review.');
assert(promotionSource.includes('sitemap-policy-review'), 'Index promotion policy must still require sitemap policy review.');
assert(promotionSource.includes('promotionRequiresApprovedPr: true'), 'Index promotion policy must still require approved PR.');

for (const entity of expectedEntities) {
  const section = sectionForEntity(qaSource, entity);

  assert(section, `Missing QA evidence contract for ${entity}.`);
  assert(section.includes("status: 'contract-only'"), `QA evidence status must remain contract-only for ${entity}.`);
  assert(section.includes('requiresCanonicalReview: true'), `Canonical review must be required for ${entity}.`);
  assert(section.includes('requiresHreflangReview: true'), `Hreflang review must be required for ${entity}.`);
  assert(section.includes('requiresThinPageReview: true'), `Thin-page review must be required for ${entity}.`);
  assert(section.includes('requiresSitemapPolicyReview: true'), `Sitemap policy review must be required for ${entity}.`);
  assert(section.includes('requiresPromotionPrApproval: true'), `Promotion PR approval must be required for ${entity}.`);
  assert(section.includes('canonicalReviewComplete: false'), `Canonical review must remain incomplete for ${entity}.`);
  assert(section.includes('hreflangReviewComplete: false'), `Hreflang review must remain incomplete for ${entity}.`);
  assert(section.includes('thinPageReviewComplete: false'), `Thin-page review must remain incomplete for ${entity}.`);
  assert(section.includes('sitemapPolicyReviewComplete: false'), `Sitemap policy review must remain incomplete for ${entity}.`);
  assert(section.includes('promotionPrApproved: false'), `Promotion PR approval must remain false for ${entity}.`);
  assert(section.includes('noindexRemovalAllowed: false'), `Noindex removal must be blocked for ${entity}.`);
  assert(section.includes('sitemapPromotionAllowed: false'), `Sitemap promotion must be blocked for ${entity}.`);
  assert(section.includes('jsonLdAllowed: false'), `JSON-LD must be blocked for ${entity}.`);
  assert(section.includes('indexPromotionAllowed: false'), `Index promotion must be blocked for ${entity}.`);
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
  assert(!qaSource.includes(signal), `QA evidence contract must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo QA evidence contract validated.');
console.log({
  entities: expectedEntities.length,
  currentQaEvidenceAvailable: false,
  noindexRemovalAllowed: false,
  sitemapPromotionAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
});
