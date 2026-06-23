import fs from 'node:fs';

const promotionPolicyPath = 'src/config/geo/index-promotion-policy.ts';
const providerReadinessPath = 'src/config/geo/provider-readiness-contract.ts';

const expectedEntities = ['governorate', 'wilayat', 'area'];
const expectedMinimumPublishedProviders = {
  governorate: 12,
  wilayat: 6,
  area: 3,
};
const expectedMinimumEditorialWords = {
  governorate: 120,
  wilayat: 90,
  area: 70,
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

const promotionPolicySource = readFile(promotionPolicyPath);
const providerReadinessSource = readFile(providerReadinessPath);

assert(providerReadinessSource.includes('OMAN_GEO_PROVIDER_READINESS_CONTRACT'), 'Missing provider readiness contract export.');
assert(providerReadinessSource.includes('promotionRequiresRuntimeEvidence: true'), 'Provider readiness must require runtime evidence.');
assert(providerReadinessSource.includes('promotionRequiresApprovedPr: true'), 'Provider readiness must require an approved PR.');
assert(providerReadinessSource.includes('currentRuntimeEvidenceAvailable: false'), 'Runtime evidence must remain unavailable in this contract-only phase.');
assert(!providerReadinessSource.includes('currentRuntimeEvidenceAvailable: true'), 'Provider readiness contract must not claim runtime evidence exists yet.');
assert(!providerReadinessSource.includes('indexPromotionAllowed: true'), 'Provider readiness contract must not allow index promotion yet.');
assert(!providerReadinessSource.includes('sitemapPromotionAllowed: true'), 'Provider readiness contract must not allow sitemap promotion yet.');

for (const entity of expectedEntities) {
  const readinessSection = sectionForEntity(providerReadinessSource, entity);
  const promotionSection = sectionForEntity(promotionPolicySource, entity);

  assert(readinessSection, `Missing provider readiness contract for ${entity}.`);
  assert(promotionSection, `Missing index promotion policy for ${entity}.`);
  assert(readinessSection.includes(`minimumPublishedProviders: ${expectedMinimumPublishedProviders[entity]}`), `Provider readiness minimum provider threshold mismatch for ${entity}.`);
  assert(readinessSection.includes(`minimumEditorialWords: ${expectedMinimumEditorialWords[entity]}`), `Provider readiness editorial threshold mismatch for ${entity}.`);
  assert(promotionSection.includes(`minimumPublishedProviders: ${expectedMinimumPublishedProviders[entity]}`), `Index promotion minimum provider threshold mismatch for ${entity}.`);
  assert(promotionSection.includes(`minimumEditorialWords: ${expectedMinimumEditorialWords[entity]}`), `Index promotion editorial threshold mismatch for ${entity}.`);
  assert(readinessSection.includes('requiresArabicCopy: true'), `Arabic copy must be required for ${entity}.`);
  assert(readinessSection.includes('requiresEnglishCopy: true'), `English copy must be required for ${entity}.`);
  assert(readinessSection.includes('requiresCanonicalReview: true'), `Canonical review must be required for ${entity}.`);
  assert(readinessSection.includes('requiresHreflangReview: true'), `Hreflang review must be required for ${entity}.`);
  assert(readinessSection.includes('requiresThinPageReview: true'), `Thin-page review must be required for ${entity}.`);
  assert(readinessSection.includes('indexPromotionAllowed: false'), `Index promotion must remain blocked for ${entity}.`);
  assert(readinessSection.includes('sitemapPromotionAllowed: false'), `Sitemap promotion must remain blocked for ${entity}.`);
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
  assert(!providerReadinessSource.includes(signal), `Provider readiness contract must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo provider readiness contract validated.');
console.log({
  entities: expectedEntities.length,
  promotionRequiresRuntimeEvidence: true,
  promotionRequiresApprovedPr: true,
  currentRuntimeEvidenceAvailable: false,
  indexPromotionAllowed: false,
  sitemapPromotionAllowed: false,
});
