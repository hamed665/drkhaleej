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

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

const helperPath = 'src/lib/catalog/public-profile-completeness.ts';
const helper = readFile(helperPath);
for (const token of [
  'PublicProfileCompletenessSignals',
  'PublicProfileCompletenessMissingSignal',
  'buildPublicProfileCompletenessSignals',
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
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
  'maxScore',
  'percentage',
  'missing',
  'unsafeClaimPhrases',
  'scoreSignals',
  'missingSignals',
]) {
  assertIncludes(helper, token, helperPath);
}
for (const forbiddenToken of [
  'export const publicProfileCompletenessBadge',
  'rankingScore',
  'publicBadge',
]) {
  assertNotIncludes(helper, forbiddenToken, helperPath);
}

const testPath = 'src/lib/catalog/public-profile-completeness.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('public profile completeness signals'",
  'scores a center with core facts, a location signal, safety copy, and clean copy',
  'scores a doctor with specialty, practice relation, and location signals',
  'reports missing relation signal for a thin center without useful links',
  'reports missing core facts instead of hiding the thin profile behind one score',
  'flags blocked claim wording as an internal signal only',
  'buildPublicProfileCompletenessSignals',
  'unsafe_claim_free',
  'relation_signal',
]) {
  assertIncludes(test, token, testPath);
}

const docPath = 'docs/seo/public-profile-completeness-signals.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile completeness signals',
  'internal quality model',
  'not a public badge',
  'buildPublicProfileCompletenessSignals(profile, context)',
  'PublicProfileCompletenessSignals',
  'hasPracticeRelations',
  'hasApprovedDescription',
  'hasUnsafeClaimFree',
  'missing',
  'Internal-only rule',
  'must not be displayed as a public quality badge',
]) {
  assertIncludes(doc, token, docPath);
}

const eligibilityGuardPath = 'scripts/seo/check-public-profile-index-eligibility-contract.mjs';
const eligibilityGuard = readFile(eligibilityGuardPath);
assertIncludes(eligibilityGuard, "import './check-public-profile-completeness-signals.mjs';", eligibilityGuardPath);

console.log('Public profile completeness signals guard passed.');
