import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/hreflang-projection-contract.md');
const projectionPath = resolve(projectRoot, 'src/lib/seo/hreflang/public-hreflang-projection.ts');
const roadmapPath = resolve(projectRoot, 'docs/seo/DRKHALEEJ_SEO_GEO_ROADMAP_2026_V1.md');
const blockerPath = resolve(projectRoot, 'docs/import/imported-hospital-release-blockers.md');

function readRequired(filePath, label) {
  if (!existsSync(filePath)) {
    console.error(`Missing ${label}: ${filePath}`);
    process.exit(1);
  }
  return readFileSync(filePath, 'utf8');
}

function requirePhrases(label, source, phrases) {
  const missing = phrases.filter((phrase) => !source.includes(phrase));
  if (missing.length > 0) {
    console.error(`${label} is missing required hreflang projection phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'hreflang projection contract');
const projectionSource = readRequired(projectionPath, 'hreflang projection helper');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap');
const blockerSource = readRequired(blockerPath, 'imported hospital release blockers');

requirePhrases('hreflang projection contract', contractSource, [
  'Status: canonical hreflang projection contract.',
  'canonical-first, locale-pair-safe, noindex-suppressed',
  'en-OM',
  'ar-OM',
  'x-default',
  'canonical is null',
  'publicRouteEnabled is false',
  'publicSafe is false',
  'page is noindex',
  'paired locale is missing',
  'paired locale is not public-safe',
  'paired locale route is disabled',
  'country is not om',
  'locale is unsupported',
  'Sitemap hreflang must be suppressed',
  'page is blocked by imported hospital release blockers',
  'self alternate',
  'paired locale alternate',
  'x-default alternate',
  'Imported hospital hreflang remains blocked',
]);

requirePhrases('hreflang projection helper', projectionSource, [
  "export type PublicHreflangLocale = 'en-OM' | 'ar-OM' | 'x-default'",
  'export type PublicHreflangProjectionInput',
  'export type PublicHreflangAlternate',
  'export type PublicHreflangProjection',
  'projectPublicHreflang',
  'canonicalPath: string | null',
  'publicRouteEnabled: boolean',
  'publicSafe: boolean',
  'indexable: boolean',
  'pairedLocaleCanonicalPath: string | null',
  'pairedLocalePublicSafe: boolean',
  'pairedLocaleRouteEnabled: boolean',
  'pairedLocaleIndexable: boolean',
  'blockedByImportedHospitalRelease: boolean',
  "if (input.country !== 'om') return null",
  'if (!isValidCanonicalPath(input.canonicalPath)) return null',
  'if (!input.publicRouteEnabled) return null',
  'if (!input.publicSafe) return null',
  'if (!input.indexable) return null',
  'if (!isValidCanonicalPath(input.pairedLocaleCanonicalPath)) return null',
  'if (!input.pairedLocalePublicSafe) return null',
  'if (!input.pairedLocaleRouteEnabled) return null',
  'if (!input.pairedLocaleIndexable) return null',
  'if (input.blockedByImportedHospitalRelease) return null',
  "hreflang: 'x-default'",
  'sitemapAlternates: alternates',
]);

requirePhrases('SEO/Geo roadmap', roadmapSource, [
  'Hreflang Projection',
  'if canonical is null, hreflang is null',
  'if page is noindex, do not emit sitemap hreflang',
]);

requirePhrases('imported hospital release blockers', blockerSource, [
  'hreflang projection is ready',
  'Imported hospital controlled release must remain after the first indexable batch, not before it.',
]);

console.log('Public hreflang projection contract validation passed.');
