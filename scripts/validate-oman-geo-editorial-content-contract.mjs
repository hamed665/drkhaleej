import fs from 'node:fs';

const contentContractPath = 'src/config/geo/editorial-content-contract.ts';
const readinessContractPath = 'src/config/geo/editorial-readiness-contract.ts';

const requiredBlocks = [
  'hero-summary',
  'local-context',
  'care-access',
  'nearby-areas',
  'editorial-disclaimer',
];
const requiredLocales = ['en', 'ar'];

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

const contentSource = readFile(contentContractPath);
const readinessSource = readFile(readinessContractPath);

assert(contentSource.includes('OMAN_GEO_EDITORIAL_CONTENT_CONTRACT'), 'Missing editorial content contract export.');
assert(contentSource.includes("status: 'contract-only'"), 'Editorial content contract must remain contract-only.');
assert(contentSource.includes('registryEnabled: false'), 'Editorial content registry must remain disabled in this phase.');
assert(contentSource.includes('currentPublishedContentCount: 0'), 'Published editorial content count must remain zero.');
assert(contentSource.includes('currentDraftContentCount: 0'), 'Draft editorial content count must remain zero.');
assert(contentSource.includes('currentReadyForReviewContentCount: 0'), 'Ready-for-review editorial content count must remain zero.');
assert(contentSource.includes('currentContentEvidenceAvailable: false'), 'Editorial content evidence must remain unavailable.');
assert(!contentSource.includes('currentContentEvidenceAvailable: true'), 'Editorial content contract must not claim content evidence exists yet.');
assert(contentSource.includes('promotionRequiresHumanReview: true'), 'Editorial content promotion must require human review.');
assert(contentSource.includes('promotionRequiresDistinctLocaleCopy: true'), 'Editorial content promotion must require distinct locale copy.');
assert(contentSource.includes('placeholderCopyAllowed: false'), 'Placeholder copy must be blocked.');
assert(contentSource.includes('aiMedicalAdviceAllowed: false'), 'AI medical advice must be blocked.');
assert(contentSource.includes('mohVerificationClaimsAllowed: false'), 'MOH verification claims must be blocked.');
assert(contentSource.includes('providerRankingClaimsAllowed: false'), 'Provider ranking claims must be blocked.');
assert(contentSource.includes('OMAN_GEO_EDITORIAL_CONTENT_REGISTRY: readonly OmanGeoEditorialContentEntry[] = []'), 'Editorial content registry must remain empty in this phase.');

for (const block of requiredBlocks) {
  assert(contentSource.includes(`'${block}'`), `Missing required content block: ${block}`);
  assert(readinessSource.includes(`'${block}'`), `Readiness contract missing required block: ${block}`);
}

for (const locale of requiredLocales) {
  assert(contentSource.includes(`'${locale}'`), `Missing editorial content locale: ${locale}`);
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
  assert(!contentSource.includes(signal), `Editorial content contract must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo editorial content contract validated.');
console.log({
  requiredBlocks: requiredBlocks.length,
  locales: requiredLocales.length,
  registryEnabled: false,
  currentPublishedContentCount: 0,
  currentContentEvidenceAvailable: false,
});
