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

const helperPath = 'src/lib/catalog/provider-description-review.ts';
const helper = readFile(helperPath);
for (const token of [
  'providerDescriptionReviewStatuses',
  "'draft'",
  "'pending_review'",
  "'approved'",
  "'rejected'",
  'ProviderDescriptionReviewStatus',
  'ProviderDescriptionReviewRecord',
  'ProviderDescriptionPublicReadinessReason',
  'buildProviderDescriptionPublicReadiness',
  'getApprovedProviderDescriptionBody',
  'hasUnsafeProviderDescriptionClaim',
  "record.status !== 'approved'",
  "reasons.push('not_approved')",
  "reasons.push('empty_body')",
  "reasons.push('unsafe_claim')",
  'return record.body.trim()',
]) {
  assertIncludes(helper, token, helperPath);
}
for (const token of [
  'export function publishProviderDescription',
  'updatePublicProfileDescription',
  'revalidatePath',
]) {
  assertNotIncludes(helper, token, helperPath);
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
  'status is `approved`',
  'body is non-empty after trimming',
  'does not include unsafe claim wording',
  'does not add admin UI',
]) {
  assertIncludes(doc, token, docPath);
}

const evidenceGuardPath = 'scripts/seo/check-public-profile-evidence-copy-guard.mjs';
const evidenceGuard = readFile(evidenceGuardPath);
assertIncludes(evidenceGuard, "import './check-provider-description-review-contract.mjs';", evidenceGuardPath);

console.log('Provider description review contract guard passed.');
