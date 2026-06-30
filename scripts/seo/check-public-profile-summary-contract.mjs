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

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-public-profile-summary-contract.mjs';", listingSafetyPath);

console.log('Public profile summary contract passed.');
