import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const rehearsalPath = 'docs/import/DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const rehearsalSource = await readText(rehearsalPath);
const packageSource = await readText('package.json');
const snapshotSource = await readText('docs/seo/DRKHALEEJ_ROUTE_INDEXABILITY_SNAPSHOT_V1.md');
const auditSource = await readText('src/server/admin/import-publish-readiness-audit.ts');
const sitemapSource = await readText('src/server/public/import-sitemap.ts');
const smokeSource = await readText('scripts/import/check-public-import-profile-smoke.mjs');

for (const token of [
  '# DrKhaleej Import Batch Rehearsal V1',
  '`IMPORT-BATCH-REHEARSAL-A`',
  '## Scope',
  '## Required gates before selecting rows',
  '## Row eligibility contract',
  '## Rehearsal steps',
  '## Stop conditions',
  '## Go decision',
  '| Family | Canonical pattern | Current public status | Sitemap cap | First rehearsal cap |',
  '| doctor | `/en/om/doctor/{slug}`, `/ar/om/doctor/{slug}` | guarded index path | 3000 | 50 |',
  '| pharmacy | `/en/om/pharmacies/{slug}`, `/ar/om/pharmacies/{slug}` | guarded index path | 1500 | 25 |',
  '| hospital | `/en/om/hospitals/{slug}`, `/ar/om/hospitals/{slug}` | guarded index path | 500 | 10 |',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must include ${token}`);
}

for (const token of [
  'pnpm import:templates:validate',
  'pnpm import:alias-coverage:validate',
  'pnpm import:publish-readiness-audit:validate',
  'pnpm import:sitemap-family-caps:validate',
  'pnpm import:profile-smoke:validate',
  'pnpm seo:route-snapshot:validate',
  'pnpm seo:check',
  'getImportPublishReadinessAudit()',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must include required gate ${token}`);
}

for (const token of [
  '`target_entity_type` is exactly `doctor`, `pharmacy`, or `hospital`.',
  '`publish_status` is exactly `index_eligible`.',
  '`index_policy` is exactly `index`.',
  '`sitemap_policy` is exactly `included`.',
  '`metadata.sitemap_included` is `true`.',
  '`metadata.robots_policy` is exactly `index`.',
  '`metadata.canonical_path` matches the safe canonical pattern for the family.',
  '`metadata.import_entity_candidate_id` is present.',
  'The candidate has `candidate_status` equal to `approved`.',
  'Source evidence exists: `sourceName` or `sourceUrl`, plus `lastCheckedAt`.',
  'Contact or map evidence exists: phone, WhatsApp, email, website, Google Maps, or directions URL.',
  'Oman geo evidence exists: area, wilayat, governorate, latitude, or longitude.',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must include row eligibility token ${token}`);
}

for (const token of [
  'Maximum: 50 doctors, 25 pharmacies, 10 hospitals.',
  'The audit must show zero blockers for the selected rows.',
  'Public sitemap diff matches only the frozen batch.',
  'Representative page smoke checks pass.',
  'The public sitemap crosses the rehearsal cap.',
  'decision is `NO-GO`.',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must include rehearsal decision token ${token}`);
}

for (const token of [
  'public comments',
  'public ratings',
  'appointment workflows',
  'payments',
  'provider dashboard',
  'lab',
  'center',
  'dental',
  'beauty',
  'offer',
  'search result',
  'area',
  'service',
  'specialty',
  'article',
  'pet',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must explicitly keep ${token} outside the rehearsal.`);
}

const forbiddenPhrases = [
  ['GO', ' without ', 'CI'],
  ['manual ', 'override ', 'allowed'],
  ['skip ', 'evidence'],
  ['bypass ', 'audit'],
].map((parts) => parts.join(''));

for (const forbiddenToken of forbiddenPhrases) {
  assertNotIncludes(rehearsalSource, forbiddenToken, `${rehearsalPath} must not include unsafe permission: ${forbiddenToken}`);
}

for (const token of [
  'getImportPublishReadinessAudit',
  'source_missing',
  'contact_or_map_missing',
  'geo_missing',
  'candidate_not_approved',
  'canonical_unsafe',
]) {
  assertIncludes(auditSource, token, `import publish readiness audit must preserve ${token}.`);
}

for (const token of [
  'doctor: 3000,',
  'pharmacy: 1500,',
  'hospital: 500,',
  'applyFamilyCaps(entries)',
  'hasReviewedImportEvidence',
]) {
  assertIncludes(sitemapSource, token, `import sitemap must preserve ${token}.`);
}

for (const token of [
  'profileContracts',
  'doctor',
  'pharmacy',
  'hospital',
  'hasLocalGeo(geo)',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
]) {
  assertIncludes(smokeSource, token, `public import profile smoke check must preserve ${token}.`);
}

for (const token of [
  'doctor cap: 3000',
  'pharmacy cap: 1500',
  'hospital cap: 500',
  'PROFILE-SMOKE-A public-import-profile-smoke-v1',
]) {
  assertIncludes(snapshotSource, token, `route indexability snapshot must preserve ${token}.`);
}

for (const packageToken of [
  'import:batch-rehearsal:validate',
  'scripts/import/check-import-batch-rehearsal.mjs',
  'pnpm import:batch-rehearsal:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import batch rehearsal check passed.');
