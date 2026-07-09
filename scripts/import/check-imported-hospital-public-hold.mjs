import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function pathExists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

function assertIncludes(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

function assertNotIncludes(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include ${token}`);
}

const hospitalDetailRoutePath = 'src/app/[locale]/[country]/hospitals/[slug]/page.tsx';
const hospitalDetailLayoutPath = 'src/app/[locale]/[country]/hospitals/[slug]/layout.tsx';
const hospitalDirectorySource = await readText('src/app/[locale]/[country]/hospitals/page.tsx');
const importSitemapSource = await readText('src/server/public/import-sitemap.ts');
const holdDocSource = await readText('docs/import/public-hospital-hold-contract.md');
const legacyHospitalDiscoveryExists = await pathExists('src/lib/catalog/public-import-discovery.ts');

if (await pathExists(hospitalDetailRoutePath)) {
  throw new Error(`${hospitalDetailRoutePath} must not exist while imported hospital detail pages are blocked.`);
}

if (await pathExists(hospitalDetailLayoutPath)) {
  throw new Error(`${hospitalDetailLayoutPath} must not exist while imported hospital detail pages are blocked.`);
}

for (const token of [
  'listImportedPublicHospitalSummaries',
  'searchImportedPublicHospitalSummaries',
  'public-import-discovery',
  'mergeHospitalResults',
]) {
  assertNotIncludes(hospitalDirectorySource, token, 'public hospitals directory');
}

for (const token of [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital"',
  'hospital: 500',
  'doctor: 3000',
  'pharmacy: 1500',
  '^\\/(en|ar)\\/om\\/hospitals\\/',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
  'hasReviewedImportEvidence',
  'readString(metadata, "canonical_path") === null',
  'readString(metadata, "import_entity_candidate_id") !== null',
]) {
  assertIncludes(importSitemapSource, token, 'import sitemap family gate');
}

for (const token of [
  'rating',
  'booking',
  'insurance',
  'provider-dashboard',
  'admin',
  'preview',
]) {
  assertNotIncludes(importSitemapSource, token, 'import sitemap family gate');
}

if (legacyHospitalDiscoveryExists) {
  throw new Error('src/lib/catalog/public-import-discovery.ts must not exist while imported hospitals are excluded from public discovery results.');
}

for (const token of [
  '# Imported Hospital Public Hold Contract',
  'detail page returning `200`',
  'public hospital directory listing',
  'public search result',
  'public sitemap entry is allowed only after import sitemap eligibility passes',
  'first-batch dry-run fixture passes',
  'public sitemap eligibility is downstream of public discovery eligibility',
]) {
  assertIncludes(holdDocSource, token, 'imported hospital public hold docs');
}

console.log('imported hospital public hold check passed.');
