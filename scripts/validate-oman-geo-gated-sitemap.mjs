import fs from 'node:fs';

const helperPath = 'src/lib/seo/oman-geo-gated-sitemap.ts';
const sitemapExclusionPath = 'scripts/seo/check-geo-sitemap-exclusion.mjs';
const packagePath = 'package.json';

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const helperSource = readFile(helperPath);
const sitemapExclusionSource = readFile(sitemapExclusionPath);
const packageSource = readFile(packagePath);

assert(helperSource.includes('listOmanGeoSitemapCandidates'), 'Missing sitemap candidate helper.');
assert(helperSource.includes('listOmanGeoGatedSitemapEntries'), 'Missing gated sitemap entry helper.');
assert(helperSource.includes('getOmanGeoGatedSitemapRuntimeState'), 'Missing gated sitemap runtime state helper.');
assert(helperSource.includes('OMAN_GOVERNORATES'), 'Gated sitemap must inspect governorate candidates.');
assert(helperSource.includes('OMAN_WILAYATS'), 'Gated sitemap must inspect wilayat candidates.');
assert(helperSource.includes('OMAN_AREAS'), 'Gated sitemap must inspect area candidates.');
assert(helperSource.includes('getOmanGeoPublicationGates'), 'Gated sitemap must read publication gates.');
assert(helperSource.includes('gates.sitemapPromotionAllowed && gates.indexPromotionAllowed && gates.noindexRemovalAllowed'), 'Sitemap entries must require sitemap, index and noindex-removal gates.');
assert(helperSource.includes('sitemapPromotionAllowed: false'), 'Gated sitemap runtime must keep sitemap promotion blocked.');
assert(helperSource.includes('noindexRemovalAllowed: false'), 'Gated sitemap runtime must keep noindex removal blocked.');
assert(helperSource.includes('jsonLdAllowed: false'), 'Gated sitemap runtime must keep JSON-LD blocked.');
assert(helperSource.includes('indexPromotionAllowed: false'), 'Gated sitemap runtime must keep index promotion blocked.');
assert(helperSource.includes("blockedReasons: entries.length === 0 ? ['publication-gates-blocked'] : []"), 'Gated sitemap runtime must explain blocked entries.');

assert(!helperSource.includes('sitemapPromotionAllowed: true'), 'Gated sitemap must not allow sitemap promotion.');
assert(!helperSource.includes('noindexRemovalAllowed: true'), 'Gated sitemap must not allow noindex removal.');
assert(!helperSource.includes('jsonLdAllowed: true'), 'Gated sitemap must not allow JSON-LD.');
assert(!helperSource.includes('indexPromotionAllowed: true'), 'Gated sitemap must not allow index promotion.');
assert(!helperSource.includes('export const OMAN_GEO_GATED_SITEMAP_ENTRIES = ['), 'Gated sitemap must not commit generated entries.');

assert(sitemapExclusionSource.includes('oman') || sitemapExclusionSource.includes('Oman'), 'Existing sitemap exclusion guardrail must still exist.');
assert(packageSource.includes('geo:gated-sitemap:validate'), 'package.json must include gated sitemap validation script.');
assert(packageSource.includes('pnpm geo:gated-sitemap:validate'), 'geo:check:oman must include gated sitemap validation.');

const forbiddenRuntimeSignals = [
  '@supabase/',
  'createClient',
  'from(',
  'select(',
  'fetch(',
  'axios',
  'prisma',
];

for (const signal of forbiddenRuntimeSignals) {
  assert(!helperSource.includes(signal), `Gated sitemap helper must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo gated sitemap validated.');
console.log({
  gatedSitemap: true,
  generatedEntriesCommitted: false,
  sitemapPromotionAllowed: false,
  noindexRemovalAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
});
