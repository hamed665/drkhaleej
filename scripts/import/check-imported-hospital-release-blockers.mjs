import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const blockerPath = resolve(projectRoot, 'docs/import/imported-hospital-release-blockers.md');
const roadmapPath = resolve(projectRoot, 'docs/seo/DRKHALEEJ_SEO_GEO_ROADMAP_2026_V1.md');
const packagePath = resolve(projectRoot, 'package.json');

const requiredBlockerPhrases = [
  'Status: canonical blocker contract for imported hospital public release.',
  'fail-closed, projection-first, route-last',
  'imported hospital detail',
  'imported hospital discovery',
  'imported hospital sitemap',
  'imported hospital index promotion',
  'dry-run report is go',
  'source evidence is reviewed',
  'unified provider projection is used',
  'canonical route resolver is used',
  'publicRouteEnabled is true',
  'internal link coverage exists',
  'minimumInternalLinks passed',
  'hreflang projection is ready',
  'sitemap eligibility gate passes',
  'page payload projection is used',
  'shared provider card view model is used',
  'performance/client boundary guard passes',
  'no raw import payload reaches public UI',
  'The old condition `publicDiscoveryEligible && publicSitemapEligible` is not enough',
  'manual duplicate precedence is preserved',
  'target publicRouteEnabled = true',
  'review_status is approved or deterministic_approved',
  "'use client' on public layout",
  "'use client' on public profile",
  "'use client' on provider card grid",
  'opening a route first',
  'expanding sitemap first',
  'patching cards directly',
  'hardcoding provider URLs',
  'Current status: blocked.',
  'Next implementation step: canonical resolver.',
  'Imported hospital controlled release must remain after the first indexable batch, not before it.',
];

const requiredRoadmapPhrases = [
  'Current next action: start at PR 830.',
  '858+ imported hospital controlled release',
  'Imported Hospital Controlled Release',
  'Do not publish all imported providers at once.',
];

const requiredPackagePhrases = [
  'import:hospital-profile-guard:validate',
  'import:hospital-profile-route:validate',
  'import:hospital-sitemap:validate',
  'seo:seo-geo-roadmap-2026:validate',
];

const forbiddenBlockerPhrases = [
  'public-route-first',
  'cards before payload',
  'hospital release before internal links',
  'sitemap first for imported hospitals',
];

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
    console.error(`${label} is missing required imported hospital release blocker phrases:`);
    for (const phrase of missing) {
      console.error(`- ${phrase}`);
    }
    process.exit(1);
  }
}

function forbidPhrases(label, source, phrases) {
  const found = phrases.filter((phrase) => source.includes(phrase));
  if (found.length > 0) {
    console.error(`${label} contains forbidden imported hospital release blocker phrases:`);
    for (const phrase of found) {
      console.error(`- ${phrase}`);
    }
    process.exit(1);
  }
}

const blockerSource = readRequired(blockerPath, 'imported hospital release blocker document');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap document');
const packageSource = readRequired(packagePath, 'package.json');

requirePhrases('Imported hospital release blocker document', blockerSource, requiredBlockerPhrases);
requirePhrases('SEO/Geo roadmap document', roadmapSource, requiredRoadmapPhrases);
requirePhrases('package.json', packageSource, requiredPackagePhrases);
forbidPhrases('Imported hospital release blocker document', blockerSource, forbiddenBlockerPhrases);

console.log('Imported hospital release blockers validation passed.');
