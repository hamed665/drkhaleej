import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Missing required file: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) throw new Error(`${label} is missing required token: ${token}`);
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) throw new Error(`${label} contains forbidden token: ${token}`);
}

const helperPath = 'src/lib/catalog/public-profile-relation-limits.ts';
const helper = readFile(helperPath);
for (const token of [
  'PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6',
  'PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT = 8',
  'limitPublicProfileRelations',
  'hiddenPublicProfileRelationCount',
  'items.slice(0, Math.max(0, limit))',
]) {
  assertIncludes(helper, token, helperPath);
}
for (const token of ['Math.random', 'sort(() =>', 'randomUUID']) {
  assertNotIncludes(helper, token, helperPath);
}

const helperTestPath = 'src/lib/catalog/public-profile-relation-limits.test.ts';
const helperTest = readFile(helperTestPath);
for (const token of [
  "describe('public profile relation limits'",
  'caps relation arrays without random ordering',
  'documents explicit center and doctor profile caps',
]) {
  assertIncludes(helperTest, token, helperTestPath);
}

const centerShellPath = 'src/components/public/public-page-shell.tsx';
const centerShell = readFile(centerShellPath);
for (const token of [
  'heroActions?: ReactNode',
  'actions={heroActions}',
]) {
  assertIncludes(centerShell, token, centerShellPath);
}

const centerRoutePath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const centerRoute = readFile(centerRoutePath);
for (const token of [
  'PublicContactActions',
  'const heroActions = result.data.contactActions.length > 0',
  '<PublicContactActions actions={result.data.contactActions} locale={locale} />',
  'heroActions={heroActions}',
]) {
  assertIncludes(centerRoute, token, centerRoutePath);
}

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  'PUBLIC_CENTER_PROFILE_LOCATION_LIMIT',
  'PUBLIC_CENTER_PROFILE_SERVICE_LIMIT',
  'PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT',
  'visibleLocations',
  'visibleServices',
  'visibleDoctors',
  'hiddenLocationCount',
  'hiddenServiceCount',
  'hiddenDoctorCount',
  'MoreRelationsNotice',
  'locations={visibleLocations}',
  'visibleServices.length > 0 ?',
  'visibleServices.map',
  'visibleDoctors.length > 0 ?',
  'visibleDoctors.map',
  'showCallbackRequest',
  'showSafeContactFallback',
  'showVerification',
  'Public discovery only. Not medical advice',
]) {
  assertIncludes(centerDetail, token, centerDetailPath);
}
for (const token of [
  'center.services.map',
  'center.doctors.map',
  'locations={center.locations}',
  'renderLocationActions',
  'futureSlots',
  'futureTitle',
  'verificationPlaceholder',
  'noServices',
  'noDoctors',
  '<PublicContactActions actions={center.contactActions}',
  'Math.random',
  'sort(() =>',
]) {
  assertNotIncludes(centerDetail, token, centerDetailPath);
}

const doctorWrapperPath = 'src/components/public/public-doctor-detail-limited.tsx';
const doctorWrapper = readFile(doctorWrapperPath);
for (const token of [
  'PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT',
  'PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT',
  'services: limitPublicProfileRelations(doctor.services',
  'practiceLocations: limitPublicProfileRelations(',
  '<PublicDoctorDetail locale={locale} doctor={limitedDoctor} />',
]) {
  assertIncludes(doctorWrapper, token, doctorWrapperPath);
}

const doctorRoutePath = 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx';
const doctorRoute = readFile(doctorRoutePath);
for (const token of [
  'PublicDoctorDetailLimited',
  'content={<PublicDoctorDetailLimited locale={locale} doctor={result.data} />}',
]) {
  assertIncludes(doctorRoute, token, doctorRoutePath);
}
assertNotIncludes(doctorRoute, 'PublicDoctorDetail } from', doctorRoutePath);

const docPath = 'docs/seo/profile-relation-limit-guard.md';
const doc = readFile(docPath);
for (const token of [
  'Profile relation limit guard',
  'center locations: 6',
  'center services: 12',
  'center doctors: 12',
  'doctor services: 12',
  'doctor practice locations: 8',
  'No random ordering is allowed.',
]) {
  assertIncludes(doc, token, docPath);
}

const anchorGuardPath = 'scripts/seo/check-profile-graph-anchor-text.mjs';
const anchorGuard = readFile(anchorGuardPath);
assertIncludes(anchorGuard, "import './check-profile-relation-limit-guard.mjs';", anchorGuardPath);

console.log('Profile relation limit guard passed.');
