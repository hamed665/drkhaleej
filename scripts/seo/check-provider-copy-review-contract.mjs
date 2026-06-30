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

const helperPath = 'src/lib/catalog/provider-description-review.ts';
const helper = readFile(helperPath);
for (const token of [
  'providerDescriptionReviewStatuses',
  "'draft'",
  "'pending_review'",
  "'approved'",
  "'rejected'",
  'ProviderDescriptionReviewRecord',
  'ProviderDescriptionPublicReadinessReason',
  'buildProviderDescriptionPublicReadiness',
  'getApprovedProviderDescriptionBody',
  'hasUnsafeProviderDescriptionClaim',
  "record.status !== 'approved'",
  "reasons.push('not_approved')",
  "reasons.push('empty_body')",
  "reasons.push('unsafe_claim')",
]) {
  assertIncludes(helper, token, helperPath);
}

const testPath = 'src/lib/catalog/provider-description-review.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('provider description review contract'",
  'allows approved clean provider copy to become public body text',
  'keeps draft and pending provider copy out of public rendering',
  'keeps rejected provider copy out of public rendering',
  'blocks empty approved copy instead of treating approval as enough',
  'blocks unsafe claim wording even if the status is approved',
  'not_approved',
  'empty_body',
  'unsafe_claim',
]) {
  assertIncludes(test, token, testPath);
}

const docPath = 'docs/seo/provider-description-review-contract.md';
const doc = readFile(docPath);
for (const token of [
  'Provider description review contract',
  '`draft`',
  '`pending_review`',
  '`approved`',
  '`rejected`',
  'Only `approved` copy can be considered for public rendering.',
  'does not add admin UI',
]) {
  assertIncludes(doc, token, docPath);
}

const completenessGuardPath = 'scripts/seo/check-public-profile-completeness-signals.mjs';
const completenessGuard = readFile(completenessGuardPath);
assertIncludes(completenessGuard, "import './check-provider-copy-review-contract.mjs';", completenessGuardPath);

console.log('Provider copy review contract guard passed.');
