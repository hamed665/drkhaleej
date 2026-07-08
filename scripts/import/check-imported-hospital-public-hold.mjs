import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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

function assertPathMissing(relativePath, label) {
  if (existsSync(path.join(root, relativePath))) throw new Error(`${label} must not exist: ${relativePath}`);
}

assertPathMissing('src/app/[locale]/[country]/hospitals/[slug]/page.tsx', 'imported hospital detail hold route');

const hospitalDirectorySource = await readText('src/app/[locale]/[country]/hospitals/page.tsx');
const importSitemapSource = await readText('src/server/public/import-sitemap.ts');
const holdDocSource = await readText('docs/import/public-hospital-hold-contract.md');
const routeRemovalDocSource = await readText('docs/import/imported-hospital-route-hold-removal.md');
const legacyHospitalDiscoverySource = await readOptionalText('src/lib/catalog/public-import-discovery.ts');

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
assertIncludes(importSitemapSource, 'decidePublicSitemapEligibility', 'import sitemap eligibility gate');
assertIncludes(importSitemapSource, 'minimumInternalLinksPassed', 'import sitemap eligibility gate');
assertIncludes(importSitemapSource, 'hreflangReady', 'import sitemap eligibility gate');
assertIncludes(importSitemapSource, 'blockedByImportedHospitalRelease', 'import sitemap eligibility gate');
assertNotIncludes(importSitemapSource, 'hospital: 500', 'import sitemap family gate');
assertNotIncludes(importSitemapSource, 'value === "hospital"', 'import sitemap family gate');
assertNotIncludes(importSitemapSource, '/hospitals/', 'import sitemap family gate');

if (legacyHospitalDiscoverySource !== null) {
  throw new Error('src/lib/catalog/public-import-discovery.ts must not exist while imported hospitals are on public hold.');
}

for (const token of [
  '# Imported Hospital Public Hold Contract',
  'detail page returning `200`',
  'fail-closed detail route scaffold',
  'public hospital directory listing',
  'public sitemap entry',
  'first-batch dry-run fixture passes',
  'public sitemap eligibility is downstream of public discovery eligibility, canonical resolution, hreflang readiness, minimum internal-link coverage, and content score',
]) {
  assertIncludes(holdDocSource, token, 'imported hospital public hold docs');
}

for (const token of [
  '# Imported Hospital Route Hold Removal',
  'The safest current posture is no public hospital detail route',
  'src/app/[locale]/[country]/hospitals/[slug]/page.tsx',
  'canonical resolver enabled',
  'internal link coverage exists',
  'hreflang projection ready',
  'sitemap eligibility gate passes',
]) {
  assertIncludes(routeRemovalDocSource, token, 'imported hospital route hold removal docs');
}

console.log('imported hospital public hold check passed.');
