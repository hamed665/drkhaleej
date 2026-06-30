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

const helperPath = 'src/lib/seo/profile-metadata-index-gate.ts';
const helper = readFile(helperPath);
for (const token of [
  'PublicProfileIndexEligibilityResult',
  'buildProfileNoindexMetadata',
  'applyProfileMetadataIndexGate',
  'robots: { index: false, follow: true }',
  'if (eligibility.eligible) return metadata',
]) {
  assertIncludes(helper, token, helperPath);
}

const testPath = 'src/lib/seo/profile-metadata-index-gate.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('profile metadata index gate'",
  'keeps metadata indexable when the profile is eligible',
  'adds noindex/follow robots metadata when the profile is not eligible',
  'builds noindex metadata without dropping existing title and description',
  'missing_relation_signal',
  'robots: { index: false, follow: true }',
]) {
  assertIncludes(test, token, testPath);
}

const centerRoutePath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const centerRoute = readFile(centerRoutePath);
for (const token of [
  'isPublicProfileIndexEligible',
  'applyProfileMetadataIndexGate',
  'const metadata = buildLocalizedMetadata({',
  'const indexEligibility = isPublicProfileIndexEligible(result.data, {',
  "kind: 'center'",
  'locale,',
  'fromPublicEligibleQuery: true',
  'return applyProfileMetadataIndexGate(metadata, indexEligibility)',
  'buildNoindexFallbackMetadata',
  'robots: { index: false, follow: true }',
]) {
  assertIncludes(centerRoute, token, centerRoutePath);
}
for (const forbiddenToken of [
  'return buildLocalizedMetadata({\n    locale,\n    country,\n    pathname: `/center/${centerSlug}`',
]) {
  assertNotIncludes(centerRoute, forbiddenToken, centerRoutePath);
}

const doctorRoutePath = 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx';
const doctorRoute = readFile(doctorRoutePath);
for (const token of [
  'isPublicProfileIndexEligible',
  'applyProfileMetadataIndexGate',
  'const metadata = buildLocalizedMetadata({',
  'const indexEligibility = isPublicProfileIndexEligible(result.data, {',
  "kind: 'doctor'",
  'locale,',
  'fromPublicEligibleQuery: true',
  'return applyProfileMetadataIndexGate(metadata, indexEligibility)',
  'buildNoindexFallbackMetadata',
  'robots: { index: false, follow: true }',
]) {
  assertIncludes(doctorRoute, token, doctorRoutePath);
}

const docPath = 'docs/seo/public-profile-metadata-index-gate.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile metadata index gate',
  'isPublicProfileIndexEligible',
  'applyProfileMetadataIndexGate',
  'robots: { index: false, follow: true }',
  'public eligible query chain',
  'Imported doctor, pharmacy, and hospital profiles still need their separate import eligibility gate',
]) {
  assertIncludes(doc, token, docPath);
}

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-public-profile-metadata-index-gate.mjs';", listingSafetyPath);

console.log('Public profile metadata index gate passed.');
