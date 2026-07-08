import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const projectionPath = resolve(projectRoot, 'src/lib/seo/internal-links/project-public-internal-links.ts');
const fixtureBuilderPath = resolve(projectRoot, 'src/lib/seo/internal-links/build-internal-link-candidates.ts');
const typesPath = resolve(projectRoot, 'src/lib/seo/internal-links/types.ts');
const budgetPath = resolve(projectRoot, 'src/lib/seo/internal-links/link-budget-policy.ts');
const contractPath = resolve(projectRoot, 'docs/seo/internal-link-engine-contract.md');

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
    console.error(`${label} is missing required internal link projection phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const projectionSource = readRequired(projectionPath, 'internal link projection gate');
const fixtureBuilderSource = readRequired(fixtureBuilderPath, 'internal link fixture builder');
const typesSource = readRequired(typesPath, 'internal link types');
const budgetSource = readRequired(budgetPath, 'internal link budget policy');
const contractSource = readRequired(contractPath, 'internal link engine contract');

requirePhrases('internal link projection gate', projectionSource, [
  'projectPublicInternalLinks',
  'hasMinimumPublicInternalLinkCoverage',
  'getPublicInternalLinkBudgetPolicy',
  'isProjectablePublicInternalLink',
  'type PublicInternalLinkProjection',
  'projectionTargetKey',
  'projectionAnchorKey',
  'violatesImportedHospitalHold',
  "candidate.targetEntityType === 'hospital'",
  "candidate.reason.includes('imported_hospital_held')",
  '.sort((a, b) => b.priority - a.priority)',
  'seenTargets',
  'seenAnchors',
  'projected.length >= budget.maxTotal',
  'return projectPublicInternalLinks(input).length >= minimumCount',
]);

requirePhrases('internal link fixture builder', fixtureBuilderSource, [
  'buildInternalLinkCandidatesFromFixture',
  'isImportedHospitalHeldCandidate',
  'seenTargets',
  'seenAnchors',
]);

requirePhrases('internal link types', typesSource, [
  'PublicInternalLinkCandidate',
  'PublicInternalLinkProjection',
  'isProjectablePublicInternalLink',
  'candidate.canonicalPath',
  'candidate.publicSafe === true',
  'candidate.routeEnabled === true',
]);

requirePhrases('internal link budget policy', budgetSource, [
  'getPublicInternalLinkBudgetPolicy',
  "pageType: 'doctor_profile'",
  'maxTotal: 18',
]);

requirePhrases('internal link engine contract', contractSource, [
  'target canonical exists',
  'target publicRouteEnabled = true',
  'link budget is not exceeded',
  'Imported hospitals must not be public internal link targets',
  'Sitemap eligibility must eventually require minimum internal link coverage.',
]);

console.log('Internal link projection contract validation passed.');
