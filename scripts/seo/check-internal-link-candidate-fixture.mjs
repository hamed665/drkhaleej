import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const builderPath = resolve(projectRoot, 'src/lib/seo/internal-links/build-internal-link-candidates.ts');
const typesPath = resolve(projectRoot, 'src/lib/seo/internal-links/types.ts');
const budgetPath = resolve(projectRoot, 'src/lib/seo/internal-links/link-budget-policy.ts');
const inputPath = resolve(projectRoot, 'fixtures/seo/internal-link-candidates.input.json');
const expectedPath = resolve(projectRoot, 'fixtures/seo/internal-link-candidates.expected.json');

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
    console.error(`${label} is missing required fixture builder phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

const builderSource = readRequired(builderPath, 'internal link fixture builder');
const typesSource = readRequired(typesPath, 'internal link types');
const budgetSource = readRequired(budgetPath, 'internal link budget policy');
const input = JSON.parse(readRequired(inputPath, 'internal link input fixture'));
const expected = JSON.parse(readRequired(expectedPath, 'internal link expected fixture'));

requirePhrases('internal link fixture builder', builderSource, [
  'buildInternalLinkCandidatesFromFixture',
  'getPublicInternalLinkBudgetPolicy',
  'isProjectablePublicInternalLink',
  'candidateKey',
  'anchorKey',
  'isImportedHospitalHeldCandidate',
  "candidate.targetEntityType === 'hospital'",
  "candidate.reason.includes('imported_hospital_held')",
  'seenTargets',
  'seenAnchors',
  '.sort((a, b) => b.priority - a.priority)',
  '.slice(0, budget.maxTotal)',
]);

requirePhrases('internal link types', typesSource, [
  'PublicInternalLinkCandidate',
  'PublicInternalLinkProjection',
  'isProjectablePublicInternalLink',
]);

requirePhrases('internal link budget policy', budgetSource, [
  "pageType: 'doctor_profile'",
  'maxTotal: 18',
  'getPublicInternalLinkBudgetPolicy',
]);

assert(input.sourcePageType === 'doctor_profile', 'Input fixture must use doctor_profile as source page type.');
assert(input.sourceEntityId === 'doctor-1', 'Input fixture must use doctor-1 as source entity.');
assert(Array.isArray(input.candidates), 'Input fixture must include candidates array.');
assert(input.candidates.length >= 9, 'Input fixture must cover accepted and rejected candidates.');
assert(Array.isArray(expected), 'Expected fixture must be an array.');
assert(expected.length === 4, 'Expected fixture must keep exactly four projected candidates.');

const expectedIds = expected.map((candidate) => candidate.targetEntityId);
for (const id of ['clinic-1', 'pharmacy-1', 'lab-1', 'bausher']) {
  assert(expectedIds.includes(id), `Expected fixture must include ${id}.`);
}

for (const rejectedId of ['hospital-held-1', 'imaging-1', 'ecg', 'cardiology']) {
  assert(!expectedIds.includes(rejectedId), `Expected fixture must reject ${rejectedId}.`);
}

const priorities = expected.map((candidate) => candidate.priority);
const sorted = [...priorities].sort((a, b) => b - a);
assert(JSON.stringify(priorities) === JSON.stringify(sorted), 'Expected fixture must be sorted by descending priority.');

const uniqueTargets = new Set(expected.map((candidate) => `${candidate.targetPageType}:${candidate.targetEntityType}:${candidate.targetEntityId}`));
assert(uniqueTargets.size === expected.length, 'Expected fixture must not contain duplicate targets.');

const uniqueAnchors = new Set(expected.map((candidate) => `${candidate.anchorEn.toLowerCase()}|${candidate.anchorAr.toLowerCase()}`));
assert(uniqueAnchors.size === expected.length, 'Expected fixture must not contain duplicate anchors.');

for (const candidate of expected) {
  assert(candidate.canonicalPath !== null, 'Projected fixture candidates must have canonicalPath.');
  assert(candidate.publicSafe === true, 'Projected fixture candidates must be publicSafe.');
  assert(candidate.routeEnabled === true, 'Projected fixture candidates must have routeEnabled.');
  assert(candidate.reviewStatus === 'approved' || candidate.reviewStatus === 'deterministic_approved', 'Projected fixture candidates must be approved.');
}

console.log('Internal link candidate fixture validation passed.');
