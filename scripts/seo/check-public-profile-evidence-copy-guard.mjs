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

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  'PublicLicenseInfoCard',
  'center.licenseInfo ? (',
  'variant="center"',
  'This public profile is marked as verified in DrKhaleej records.',
  'This is not a license or MOH approval claim.',
  'هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
  'center.contactActions.length > 0',
  'showSafeContactFallback',
  'Contact details should be confirmed with the provider.',
  'PublicContactActions actions={center.contactActions}',
  'PublicContactActions actions={location.contactActions}',
  'not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability',
]) {
  assertIncludes(centerDetail, token, centerDetailPath);
}

const doctorDetailPath = 'src/components/public/public-doctor-detail.tsx';
const doctorDetail = readFile(doctorDetailPath);
for (const token of [
  'PublicLicenseInfoCard',
  'doctor.licenseInfo ? (',
  'variant="doctor"',
  'This public profile is marked as verified in DrKhaleej records.',
  'This is not a license or MOH approval claim.',
  'هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
  'PublicContactActions actions={practiceLocation.contactActions}',
  'PublicDoctorPracticeCallback',
  'Confirm clinical details directly with the provider before making care decisions.',
  'not active yet',
]) {
  assertIncludes(doctorDetail, token, doctorDetailPath);
}

const licenseCardPath = 'src/components/public/public-license-info-card.tsx';
const licenseCard = readFile(licenseCardPath);
for (const token of [
  'PublicLicenseInfo | null',
  'if (licenseInfo === null) return null',
  'licenseInfo.licenseNumber',
  'licenseInfo.licenseAuthority',
  'Displayed for transparency.',
  'does not replace professional medical advice',
]) {
  assertIncludes(licenseCard, token, licenseCardPath);
}

const forbiddenClaimTokens = [
  ['MOH ', 'approved'].join(''),
  ['verified ', 'by MOH'].join(''),
  ['insurance ', 'accepted'].join(''),
  ['Book ', 'now'].join(''),
  ['Open ', 'now'].join(''),
  ['available ', 'now'].join(''),
  ['guaranteed ', 'treatment'].join(''),
  ['emergency ', 'availability'].join(''),
];
for (const token of forbiddenClaimTokens) {
  assertNotIncludes(centerDetail, token, centerDetailPath);
  assertNotIncludes(doctorDetail, token, doctorDetailPath);
}

const docPath = 'docs/seo/public-profile-evidence-copy-guard.md';
const doc = readFile(docPath);
for (const token of [
  'Public profile evidence copy guard',
  'License information can render only through `PublicLicenseInfoCard`',
  'only when `licenseInfo` exists',
  "`verificationStatus === 'verified'` means a DrKhaleej internal profile state",
  'not official regulator approval',
  'Contact actions must come from approved public contact action arrays',
  'Provider-written descriptions still need their own draft',
]) {
  assertIncludes(doc, token, docPath);
}

const completenessGuardPath = 'scripts/seo/check-public-profile-completeness-signals.mjs';
const completenessGuard = readFile(completenessGuardPath);
assertIncludes(completenessGuard, "import './check-public-profile-evidence-copy-guard.mjs';", completenessGuardPath);

console.log('Public profile evidence copy guard passed.');
