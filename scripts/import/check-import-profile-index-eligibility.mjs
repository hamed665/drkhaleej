import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

const helperPath = 'src/lib/catalog/public-import-profile-index-eligibility.ts';
const helper = await readText(helperPath);
for (const token of [
  'PublicImportProfileIndexEligibilityReason',
  'PublicImportProfileIndexEligibilityResult',
  'PublicImportProfileIndexEligibilityInput',
  'isPublicImportProfileIndexEligible',
  'missing_name',
  'missing_canonical_path',
  'missing_location',
  'missing_source',
  'missing_last_checked',
  'missing_language',
  'missing_taxonomy_signal',
  'missing_contact_or_map',
]) {
  assertIncludes(helper, token, `${helperPath} must include ${token}`);
}

const testPath = 'src/lib/catalog/public-import-profile-index-eligibility.test.ts';
const test = await readText(testPath);
for (const token of [
  "describe('public import profile index eligibility'",
  'blocks name-only imported profiles from index eligibility',
  'requires a language signal before imported metadata stays indexable',
  'accepts department or service taxonomy signals for imported hospitals and pharmacies',
]) {
  assertIncludes(test, token, `${testPath} must include ${token}`);
}

const doctorRoutePath = 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx';
const doctorRoute = await readText(doctorRoutePath);
for (const token of [
  'isPublicImportProfileIndexEligible',
  'buildProfileNoindexMetadata',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(importResult.profile)',
  'return importIndexEligibility.eligible ? metadata : buildProfileNoindexMetadata(metadata)',
]) {
  assertIncludes(doctorRoute, token, `${doctorRoutePath} must include ${token}`);
}

const pharmacyRoutePath = 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx';
const pharmacyRoute = await readText(pharmacyRoutePath);
for (const token of [
  'isPublicImportProfileIndexEligible',
  'buildProfileNoindexMetadata',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(result.profile)',
  'return importIndexEligibility.eligible ? metadata : buildProfileNoindexMetadata(metadata)',
]) {
  assertIncludes(pharmacyRoute, token, `${pharmacyRoutePath} must include ${token}`);
}

const hospitalRoutePath = 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx';
const hospitalRoute = await readText(hospitalRoutePath);
for (const token of [
  'isPublicImportProfileIndexEligible',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(profile)',
  'name="robots"',
  'importIndexEligibility.eligible ? "index,follow" : "noindex,follow"',
]) {
  assertIncludes(hospitalRoute, token, `${hospitalRoutePath} must include ${token}`);
}

const docPath = 'docs/seo/public-import-profile-index-eligibility.md';
const doc = await readText(docPath);
for (const token of [
  'Public import profile index eligibility',
  'isPublicImportProfileIndexEligible(profile)',
  'listed language',
  'taxonomy signal',
  'noindex,follow',
]) {
  assertIncludes(doc, token, `${docPath} must include ${token}`);
}

const smokePath = 'scripts/import/check-public-import-profile-smoke.mjs';
const smoke = await readText(smokePath);
assertIncludes(smoke, "import './check-import-profile-index-eligibility.mjs';", `${smokePath} must chain import profile index eligibility.`);

console.log('import profile index eligibility check passed.');
