import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const profileContracts = [
  {
    entity: 'doctor',
    family: 'doctors',
    guardPath: 'src/server/public/import-doctor-profile-guard.ts',
    routePath: 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
    slugParam: 'doctorSlug',
    canonicalReturn: 'return `/${locale}/${country}/doctor/${slug}`;',
    guardExport: 'getPublicImportDoctorProfile',
    routeTokens: [
      'generateMetadata',
      'getPublicImportDoctorProfile',
      'GuardedImportProfilePage',
      'pathname: `/doctor/${doctorSlug}`',
      'notFound()',
      'buildNoindexFallbackMetadata',
      'robots: { index: false, follow: true }',
      "fallbackTitle: 'Doctor Profile | DrKhaleej'",
    ],
  },
  {
    entity: 'pharmacy',
    family: 'pharmacies',
    guardPath: 'src/server/public/import-pharmacy-profile-guard.ts',
    routePath: 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
    slugParam: 'pharmacySlug',
    canonicalReturn: 'return `/${locale}/${country}/pharmacies/${slug}`;',
    guardExport: 'getPublicImportPharmacyProfile',
    routeTokens: [
      'generateMetadata',
      'getPublicImportPharmacyProfile',
      'pathname: `/pharmacies/${pharmacySlug}`',
      'notFound()',
      'robots: { index: false, follow: true }',
    ],
  },
  {
    entity: 'hospital',
    family: 'hospitals',
    guardPath: 'src/server/public/import-hospital-profile-guard.ts',
    routePath: 'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
    apiRoutePath: 'src/app/api/_drk/hospital-profile/[locale]/[country]/[hospitalSlug]/route.ts',
    slugParam: 'hospitalSlug',
    canonicalReturn: 'return `/${locale}/${country}/hospitals/${slug}`;',
    guardExport: 'getPublicImportHospitalProfile',
    routeTokens: [
      'getServerSideProps',
      'loadHospitalProfile',
      'hospitalProfileEndpointUrl',
      '/api/_drk/hospital-profile/${locale}/${country}/${hospitalSlug}',
      'notFound: true',
      'profile.canonicalPath',
      'hrefLang="en-OM"',
      'hrefLang="ar-OM"',
    ],
    apiRouteTokens: [
      'export async function GET',
      'getPublicImportHospitalProfile',
      'NextResponse.json',
      'status: 404',
      'no-store, private',
    ],
  },
];

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

async function assertGuard(contract) {
  await assertFile(contract.guardPath);
  const source = await readText(contract.guardPath);

  for (const token of [
    'import "server-only";',
    'createSupabaseServiceRoleClient',
    contract.guardExport,
    `family: "${contract.family}"`,
    `entityType: "${contract.entity}"`,
    `${contract.slugParam}: string`,
    'function safeSlug(value: string): string | null',
    '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    'if (locale !== "en" && locale !== "ar") return null;',
    'if (country !== "om") return null;',
    contract.canonicalReturn,
    `row.target_entity_type !== "${contract.entity}"`,
    'row.publish_status !== "index_eligible"',
    'row.index_policy !== "index"',
    'row.sitemap_policy !== "included"',
    'row.metadata.sitemap_included !== true',
    'stringValue(row.metadata, "robots_policy") !== "index"',
    'return stringValue(row.metadata, "canonical_path") === path;',
    'import_entity_candidate_id',
    `candidate.entity_type !== "${contract.entity}"`,
    'candidate.candidate_status !== "approved"',
    'hasLocalGeo(geo)',
    'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
    'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
    '.from<QueueRow>("import_publish_queue")',
    '.select("target_entity_type, publish_status, index_policy, sitemap_policy, quality_score, metadata")',
    `.eq("target_entity_type", "${contract.entity}")`,
    '.eq("sitemap_policy", "included")',
    '.eq("index_policy", "index")',
    '.eq("publish_status", "index_eligible")',
    '.from<CandidateRow>("import_entity_candidates")',
    '.select("entity_type, candidate_status, candidate_payload")',
    '.eq("candidate_status", "approved")',
    '.maybeSingle()',
    'qualityScore: Math.max(0, Math.min(100',
  ]) {
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
    'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital";',
    'const publicImportSitemapFamilyCaps = {',
    'doctor: 3000,',
    'pharmacy: 1500,',
    'hospital: 500,',
    '^\\/(en|ar)\\/om\\/doctor\\/',
    '^\\/(en|ar)\\/om\\/pharmacies\\/',
    '^\\/(en|ar)\\/om\\/hospitals\\/',
    'hasReviewedImportEvidence',
    'applyFamilyCaps(entries)',
    'dedupePublicEntries',
  ]) {
    assertIncludes(source, token, `src/server/public/import-sitemap.ts must include ${token}`);
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
