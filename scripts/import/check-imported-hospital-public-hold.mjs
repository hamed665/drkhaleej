import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function readOptionalText(relativePath) {
  try {
    return await readText(relativePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function assertIncludes(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

function assertNotIncludes(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include ${token}`);
}

const hospitalRouteSource = await readText('src/app/[locale]/[country]/hospitals/[slug]/page.tsx');
const hospitalDirectorySource = await readText('src/app/[locale]/[country]/hospitals/page.tsx');
const importSitemapSource = await readText('src/server/public/import-sitemap.ts');
const holdDocSource = await readText('docs/import/public-hospital-hold-contract.md');
const legacyHospitalDiscoverySource = await readOptionalText('src/lib/catalog/public-import-discovery.ts');

for (const token of [
  'ImportedHospitalDetailPublicHoldPage',
  'export const dynamic = "force-dynamic";',
  'export const revalidate = 0;',
  'PUBLIC_HOSPITAL_HOLD_REASON',
  'buildProfileNoindexMetadata',
  'Hospital profile unavailable | DrKhaleej',
  'notFound();',
]) {
  assertIncludes(hospitalRouteSource, token, 'imported hospital hold route');
}

for (const token of [
  'getImportedHospitalProfile(',
  'createSupabaseServerClient',
  'Reviewed public hospital profile',
  'profile.summaryEn',
  'sourceUrl',
]) {
  assertNotIncludes(hospitalRouteSource, token, 'imported hospital hold route');
}

for (const token of [
  'listImportedPublicHospitalSummaries',
  'searchImportedPublicHospitalSummaries',
  'public-import-discovery',
  'mergeHospitalResults',
]) {
  assertNotIncludes(hospitalDirectorySource, token, 'public hospitals directory');
}

assertIncludes(importSitemapSource, 'type SupportedImportSitemapEntityType = "doctor" | "pharmacy";', 'import sitemap family gate');
assertIncludes(importSitemapSource, 'doctor: 3000', 'import sitemap family gate');
assertIncludes(importSitemapSource, 'pharmacy: 1500', 'import sitemap family gate');
assertNotIncludes(importSitemapSource, 'hospital: 500', 'import sitemap family gate');
assertNotIncludes(importSitemapSource, 'value === "hospital"', 'import sitemap family gate');
assertNotIncludes(importSitemapSource, '/hospitals/', 'import sitemap family gate');

if (legacyHospitalDiscoverySource !== null) {
  throw new Error('src/lib/catalog/public-import-discovery.ts must not exist while imported hospitals are on public hold.');
}

for (const token of [
  '# Imported Hospital Public Hold Contract',
  'detail page returning `200`',
  'public hospital directory listing',
  'public sitemap entry',
  'first-batch dry-run fixture passes',
  'public sitemap eligibility is downstream of public discovery eligibility',
]) {
  assertIncludes(holdDocSource, token, 'imported hospital public hold docs');
}

console.log('imported hospital public hold check passed.');
