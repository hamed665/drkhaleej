import './check-public-profile-evidence-copy-guard.mjs';
import './check-provider-copy-review-contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

const helperPath = 'src/lib/catalog/public-profile-completeness.ts';
const helper = readFile(helperPath);
for (const token of [
  'PublicProfileCompletenessSignals',
  'PublicProfileCompletenessMissingSignal',
  'buildPublicProfileCompletenessSignals',
  'hasName',
  'hasSlug',
  'hasCountry',
  'hasEntityType',
  'hasSummary',
  'hasLocationSignal',
  'hasServiceSignal',
  'hasPracticeRelations',
  'hasSpecialtySignal',
  'hasApprovedDescription',
  'hasRelationSignal',
  'hasSafetyCopy',
  'hasUnsafeClaimFree',
  'score',
  'percentage',
  'missing',
]) {
  assertIncludes(helper, token, helperPath);
}

const testPath = 'src/lib/catalog/public-profile-completeness.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('public profile completeness signals'",
  'buildPublicProfileCompletenessSignals',
  'relation_signal',
  'unsafe_claim_free',
]) {
  assertIncludes(test, token, testPath);
}

const docPath = 'docs/seo/public-profile-completeness-signals.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile completeness signals',
  'internal quality model',
  'not a public badge',
  'Internal-only rule',
]) {
  assertIncludes(doc, token, docPath);
}

const eligibilityGuardPath = 'scripts/seo/check-public-profile-index-eligibility-contract.mjs';
const eligibilityGuard = readFile(eligibilityGuardPath);
assertIncludes(eligibilityGuard, "import './check-public-profile-completeness-signals.mjs';", eligibilityGuardPath);

console.log('Public profile completeness signals guard passed.');
