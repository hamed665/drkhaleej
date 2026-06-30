import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

const summaryDocPath = 'docs/seo/public-profile-summary-contract.md';
const summaryDoc = readFile(summaryDocPath);
for (const token of [
  'Public profile summary contract',
  'Every indexable public doctor or center profile must use the shared summary helpers',
  'Every reviewed imported public profile must use the shared import summary helpers',
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'approved public directory facts',
  'reviewed import source signals',
  'reviewed import languages',
  'reviewed import departments',
  'Provider-written or editorial text may appear',
  'Reviewed import profiles include imported doctor, pharmacy, and hospital profiles',
  'Generated summaries must not include these claims',
  'Metadata must not fall back to a generic repeated sentence',
  'PublicCenterDetail',
  'PublicDoctorDetail',
  'GuardedImportProfilePage',
  'imported pharmacy profile pages',
  'imported hospital profile pages',
  'scripts/seo/check-public-profile-summary-contract.mjs',
]) {
  assertIncludes(summaryDoc, token, summaryDocPath);
}

const summaryHelperPath = 'src/lib/catalog/public-profile-summary.ts';
const summaryHelper = readFile(summaryHelperPath);
for (const token of [
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'formatPublicLocationGeoLine',
  'uniqueNonEmpty',
  'listPreview',
  'Connected public services include',
  'Related public doctor profiles include',
  'Connected practice locations include',
  'approved DrKhaleej directory data',
  'current details should be confirmed directly with the provider',
]) {
  assertIncludes(summaryHelper, token, summaryHelperPath);
}
for (const forbiddenToken of [
  'best',
  'top-rated',
  'guaranteed',
  'trusted by thousands',
  'insurance accepted',
  'MOH approved',
  '24/7',
]) {
  assertNotIncludes(summaryHelper, forbiddenToken, summaryHelperPath);
}

const importSummaryHelperPath = 'src/lib/catalog/public-import-profile-summary.ts';
const importSummaryHelper = readFile(importSummaryHelperPath);
for (const token of [
  'PublicImportProfileSummaryInput',
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'entityLabel',
  'locationLine',
  'uniqueNonEmpty',
  'listPreview',
  'Reviewed public directory signals include',
  'approved DrKhaleej import data',
  'reviewed public import data for discovery',
  'current details should be confirmed directly with the provider',
]) {
  assertIncludes(importSummaryHelper, token, importSummaryHelperPath);
}
for (const forbiddenToken of [
  'top-rated',
  'guaranteed',
  'trusted by thousands',
  'insurance accepted',
  'MOH approved',
  '24/7',
]) {
  assertNotIncludes(importSummaryHelper, forbiddenToken, importSummaryHelperPath);
}

const centerRoutePath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const centerRoute = readFile(centerRoutePath);
for (const token of [
  'buildPublicCenterProfileSummary',
  'buildPublicProfileMetaDescription',
  'const profileSummary = buildPublicCenterProfileSummary(locale, result.data)',
  'description: buildPublicProfileMetaDescription(profileSummary)',
  'heroDescription={description}',
  'profileSummary',
]) {
  assertIncludes(centerRoute, token, centerRoutePath);
}

const doctorRoutePath = 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx';
const doctorRoute = readFile(doctorRoutePath);
for (const token of [
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'const profileSummary = buildPublicDoctorProfileSummary(locale, result.data)',
  'description: buildPublicProfileMetaDescription(profileSummary)',
  'heroDescription={profileSummary}',
]) {
  assertIncludes(doctorRoute, token, doctorRoutePath);
}
for (const forbiddenToken of [
  'description: metadataDescription(locale, result.data',
  'const description = metadataDescription(locale, result.data',
]) {
  assertNotIncludes(doctorRoute, forbiddenToken, doctorRoutePath);
}

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  'buildPublicCenterProfileSummary',
  'const profileSummary = buildPublicCenterProfileSummary(locale, center)',
  '{profileSummary}',
  'description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{description}</p> : null',
]) {
  assertIncludes(centerDetail, token, centerDetailPath);
}

const doctorDetailPath = 'src/components/public/public-doctor-detail.tsx';
const doctorDetail = readFile(doctorDetailPath);
for (const token of [
  'buildPublicDoctorProfileSummary',
  'const profileSummary = buildPublicDoctorProfileSummary(locale, doctor)',
  '{profileSummary}',
  'bio ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{bio}</p> : null',
]) {
  assertIncludes(doctorDetail, token, doctorDetailPath);
}

const guardedImportProfilePath = 'src/components/public/import-profile/GuardedImportProfilePage.tsx';
const guardedImportProfile = readFile(guardedImportProfilePath);
for (const token of [
  'buildPublicImportProfileSummary',
  'PublicImportProfileSummaryInput',
  'const profileSummary = buildPublicImportProfileSummary(locale, profile satisfies PublicImportProfileSummaryInput)',
  '<p>{profileSummary}</p>',
  '<p className="mt-3 text-sm leading-6 text-slate-700">{profileSummary}</p>',
]) {
  assertIncludes(guardedImportProfile, token, guardedImportProfilePath);
}

const pharmacyImportProfilePath = 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx';
const pharmacyImportProfile = readFile(pharmacyImportProfilePath);
for (const token of [
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'PublicImportProfileSummaryInput',
  'const profileSummary = buildPublicImportProfileSummary(locale, result.profile satisfies PublicImportProfileSummaryInput)',
  'description: buildPublicImportProfileMetaDescription(profileSummary)',
  '<p>{profileSummary}</p>',
  '<p className="mt-3 text-sm leading-6 text-slate-700">{profileSummary}</p>',
]) {
  assertIncludes(pharmacyImportProfile, token, pharmacyImportProfilePath);
}
for (const forbiddenToken of [
  'description: profileDescription(name)',
  '<p>{profileDescription(title)}</p>',
]) {
  assertNotIncludes(pharmacyImportProfile, forbiddenToken, pharmacyImportProfilePath);
}

const hospitalImportProfilePath = 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx';
const hospitalImportProfile = readFile(hospitalImportProfilePath);
for (const token of [
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'PublicImportProfileSummaryInput',
  'const profileSummary = buildPublicImportProfileSummary(locale, profile satisfies PublicImportProfileSummaryInput)',
  'const description = buildPublicImportProfileMetaDescription(profileSummary)',
  '<p>{profileSummary}</p>',
  '<p className="mt-3 text-sm leading-6 text-slate-700">{profileSummary}</p>',
]) {
  assertIncludes(hospitalImportProfile, token, hospitalImportProfilePath);
}
for (const forbiddenToken of [
  'function profileDescription(name: string): string',
  'const description = profileDescription(title)',
]) {
  assertNotIncludes(hospitalImportProfile, forbiddenToken, hospitalImportProfilePath);
}

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-public-profile-summary-contract.mjs';", listingSafetyPath);

console.log('Public profile summary contract passed.');
