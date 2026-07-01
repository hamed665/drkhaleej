import './check-soft-launch-profile-seo-gate.mjs';
import './check-public-profile-metadata-index-gate.mjs';
import './check-public-profile-completeness-signals.mjs';
import './check-profile-graph-anchor-text.mjs';
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

const helperPath = 'src/lib/catalog/public-profile-index-eligibility.ts';
const helper = readFile(helperPath);
for (const token of [
  'PublicProfileIndexEligibilityReason',
  'PublicProfileIndexEligibilityResult',
  'PublicProfileIndexEligibilityContext',
  'isPublicProfileIndexEligible',
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'fromPublicEligibleQuery',
  'deletedOrInactive',
  'missing_profile',
  'missing_name',
  'missing_slug',
  'missing_country',
  'missing_entity_type',
  'missing_summary',
  'missing_relation_signal',
  'missing_safety_copy',
  'unsafe_claim',
  'deleted_or_inactive',
  'not_from_public_eligible_query',
  'centerHasRelationSignal',
  'doctorHasRelationSignal',
  'hasSafetyCopy',
  'containsUnsafeClaim',
  'confirmed directly with the provider',
]) {
  assertIncludes(helper, token, helperPath);
}
for (const forbiddenToken of [
  'return { eligible: true',
  'eligible: Boolean(',
]) {
  assertNotIncludes(helper, forbiddenToken, helperPath);
}

const testPath = 'src/lib/catalog/public-profile-index-eligibility.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('public profile index eligibility'",
  'marks a fact-complete center from the public eligible query chain as indexable',
  'marks a fact-complete doctor from the public eligible query chain as indexable',
  'explains why a thin center profile is not indexable',
  'requires public eligible query provenance before indexing',
  'flags unsafe public claim copy before indexing',
  'returns reasons for missing core facts instead of a silent boolean',
  'isPublicProfileIndexEligible',
  "fromPublicEligibleQuery: true",
  'missing_relation_signal',
  'not_from_public_eligible_query',
  'unsafe_claim',
  'missing_name',
  'missing_slug',
  'missing_country',
  'missing_entity_type',
]) {
  assertIncludes(test, token, testPath);
}

const docPath = 'docs/seo/public-profile-index-eligibility.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile index eligibility contract',
  'isPublicProfileIndexEligible(profile, context)',
  'PublicProfileIndexEligibilityResult',
  'PublicProfileIndexEligibilityReason',
  'fromPublicEligibleQuery: true',
  'not_from_public_eligible_query',
  'deleted_or_inactive',
  'missing_relation_signal',
  'missing_safety_copy',
  'unsafe_claim',
  'Profile metadata index gate',
  'Profile sitemap boundary guard',
  'Import profile eligibility gate',
]) {
  assertIncludes(doc, token, docPath);
}

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-public-profile-index-eligibility-contract.mjs';", listingSafetyPath);

console.log('Public profile index eligibility contract passed.');
