import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertMissing(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    return;
  }
  throw new Error(`${relativePath} must not exist while imported hospital detail pages are on public hold.`);
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

for (const blockedHospitalRoutePath of [
  'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
  'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[slug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[slug]/layout.tsx',
]) {
  await assertMissing(blockedHospitalRoutePath);
}

const hospitalGuardPath = 'src/server/public/import-hospital-profile-guard.ts';
const hospitalGuard = await readText(hospitalGuardPath);
for (const token of [
  'getPublicImportHospitalProfile',
  'isPublicImportProfileIndexEligible',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(profile)',
  'if (!importIndexEligibility.eligible) return null',
  'isRecord(row.metadata)',
  'row.publish_status !== "index_eligible"',
  'row.index_policy !== "index"',
  'row.sitemap_policy !== "included"',
  'hasLocalGeo(geo)',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
]) {
  assertIncludes(hospitalGuard, token, `${hospitalGuardPath} must preserve hospital eligibility boundary token ${token}`);
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
