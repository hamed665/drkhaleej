import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing file: ${relativePath}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const profileContracts = [
  {
    entity: 'doctor',
    guardPath: 'src/server/public/import-doctor-profile.ts',
    routePath: 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
    routeTokens: ['getPublicImportDoctorProfile', 'GuardedImportProfilePage'],
  },
  {
    entity: 'pharmacy',
    guardPath: 'src/server/public/import-pharmacy-profile.ts',
    routePath: 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
    routeTokens: ['getPublicImportPharmacyProfile', 'GuardedImportProfilePage'],
  },
  {
    entity: 'hospital',
    guardPath: 'src/server/public/import-hospital-profile.ts',
    routePath: 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
    apiRoutePath: 'src/app/api/_drk/hospital-profile/[locale]/[country]/[hospitalSlug]/route.ts',
    routeTokens: ['getServerSideProps', 'PublicImportedHospitalProfilePage', 'notFound: true'],
    apiRouteTokens: ['getPublicImportHospitalProfile', 'status: 404', 'no-store, private'],
  },
];

async function assertGuard(contract) {
  await assertFile(contract.guardPath);
  const source = await readText(contract.guardPath);
  for (const token of ['sourceEvidence', 'canonicalPath', 'robotsPolicy']) {
    assertIncludes(source, token, `${contract.guardPath} must include ${token}`);
  }
}

async function assertRoute(contract) {
  await assertFile(contract.routePath);
  const source = await readText(contract.routePath);

  for (const token of contract.routeTokens) {
    assertIncludes(source, token, `${contract.routePath} must include ${token}`);
  }

  assertNotIncludes(source, 'listPublicImportSitemapEntries', `${contract.routePath} must not call sitemap listing from a profile page.`);

  if (contract.entity === 'hospital') {
    for (const token of ['profile.canonicalPath', 'profile.qualityScore', 'Quality score']) {
      assertNotIncludes(source, token, `${contract.routePath} must not expose public QA field token: ${token}`);
    }
  }

  if (contract.apiRoutePath) {
    await assertFile(contract.apiRoutePath);
    const apiSource = await readText(contract.apiRoutePath);
    for (const token of contract.apiRouteTokens) {
      assertIncludes(apiSource, token, `${contract.apiRoutePath} must include ${token}`);
    }
  }
}

async function assertSitemapContract() {
  const source = await readText('src/server/public/import-sitemap.ts');

  for (const token of [
    'type SupportedImportSitemapEntityType = "doctor" | "pharmacy";',
    'const publicImportSitemapFamilyCaps = {',
    'doctor: 3000,',
    'pharmacy: 1500,',
    '^\\/(en|ar)\\/om\\/doctor\\/',
    '^\\/(en|ar)\\/om\\/pharmacies\\/',
    'hasReviewedImportEvidence',
    'decidePublicSitemapEligibility',
    'minimumInternalLinksPassed',
    'hreflangReady',
    'blockedByImportedHospitalRelease',
    'applyFamilyCaps(entries)',
    'dedupePublicEntries',
  ]) {
    assertIncludes(source, token, `src/server/public/import-sitemap.ts must include ${token}`);
  }

  for (const forbiddenToken of [
    '| "hospital"',
    'value === "hospital"',
    'case "hospital":',
    'hospital: 500,',
    '^\\/(en|ar)\\/om\\/hospitals\\/',
    '/hospitals/',
  ]) {
    assertNotIncludes(source, forbiddenToken, `src/server/public/import-sitemap.ts must not include ${forbiddenToken}`);
  }
}

async function assertPackageContract() {
  const source = await readText('package.json');
  for (const token of [
    'import:profile-smoke:validate',
    'scripts/import/check-public-import-profile-smoke.mjs',
    'pnpm import:profile-smoke:validate',
  ]) {
    assertIncludes(source, token, `package.json must include ${token}`);
  }
}

for (const contract of profileContracts) {
  await assertGuard(contract);
  await assertRoute(contract);
}

await assertSitemapContract();
await assertPackageContract();

console.log('public import profile smoke check passed.');
