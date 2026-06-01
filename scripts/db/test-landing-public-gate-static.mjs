#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const seedDir = path.join(repoRoot, 'supabase', 'seed');

const landingRoutes = [
  'src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx',
  'src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx',
  'src/app/[locale]/[country]/areas/[areaSlug]/page.tsx',
  'src/app/[locale]/[country]/services/[serviceSlug]/page.tsx',
  'src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx',
];

const crawlerFiles = [
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'public/llms.txt',
];

const landingTable = 'landing_page_contents';
const landingProjectionTokens = [
  'landing_public_gate',
  'public_landing_gate',
  'landing_page_public',
  'public_landing_page',
  'landing_page_projection',
  'landing_public_projection',
];

const publicLandingHelperNames = [
  'getSpecialtyLandingGateData',
  'getSpecialtyAreaLandingGateData',
  'getAreaLandingGateData',
  'getServiceLandingGateData',
  'getServiceAreaLandingGateData',
];

const failClosedHelperTokens = [
  'ok: false',
  'entityExists: false',
  'providerCount: 0',
  'centerCount: 0',
  'exactCombinationCount: 0',
  'hasUniqueVisibleIntro: false',
  'hasLocalRelevance: false',
  "medicalReviewStatus: 'missing'",
  'canonicalIsUnique: false',
  'privateDataExcluded: true',
  'helperAvailable: false',
  'sourceTables: []',
];

const forbiddenHelperTokens = [
  'Supabase',
  'supabase',
  '@supabase',
  'service-role',
  'serviceRole',
  'createSupabaseServerClient',
  'createSupabaseServiceRoleClient',
  landingTable,
  ...landingProjectionTokens,
  'data/seo',
  'drmuscat-keyword-seed.json',
  'from(',
  '.from(',
  'select(',
  '.select(',
  'insert(',
  '.insert(',
  'update(',
  '.update(',
  'delete(',
  '.delete(',
  'upsert(',
  '.upsert(',
  'rpc(',
  '.rpc(',
  'DB error',
  'database error',
  'PostgrestError',
];

const forbiddenCrawlerOrRouteTokens = [
  landingTable,
  ...landingProjectionTokens,
  'generateMetadata',
  'generateStaticParams',
  'schema.org',
  'application/ld+json',
  'jsonLd',
  'structuredData',
  'StructuredData',
  'openGraph',
  'canonicalUrl',
  'hreflang',
  'alternates',
  'title:',
  'intro:',
  'sections:',
  'faq:',
  'created_by_profile_id',
  'updated_by_profile_id',
  'reviewed_by_profile_id',
  'medical_reviewer_profile_id',
  'published_by_profile_id',
  'reviewed_at',
  'medical_reviewed_at',
  'published_at',
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readRelative(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert(existsSync(absolutePath), `Missing required file: ${relativePath}`);
  return readFileSync(absolutePath, 'utf8');
}

function readSqlFiles(directory) {
  assert(statSync(directory).isDirectory(), `Missing SQL directory: ${directory}`);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => ({ file, source: readFileSync(path.join(directory, file), 'utf8') }));
}

function walkFiles(directory, predicate) {
  if (!existsSync(directory)) return [];

  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(absolutePath, predicate));
      continue;
    }
    if (entry.isFile() && predicate(absolutePath)) results.push(absolutePath);
  }
  return results;
}

function sourceContainsImport(source) {
  return /^\s*import\s/m.test(source) || /import\s*\(/.test(source);
}

function assertNoSqlStatement(sqlFiles, regex, message) {
  for (const { file, source } of sqlFiles) {
    assert(!regex.test(source), `${message} (${file})`);
  }
}

const migrations = readSqlFiles(migrationsDir);
const combinedMigrations = migrations.map(({ source }) => source).join('\n\n');
const landingMigration = migrations.find(({ file }) => file === '0051_landing_page_contents.sql');
assert(landingMigration, 'Missing 0051_landing_page_contents.sql migration');

assert(
  /create\s+table\s+if\s+not\s+exists\s+public\.landing_page_contents\b/i.test(landingMigration.source),
  '0051 must create public.landing_page_contents',
);
assert(
  /alter\s+table\s+public\.landing_page_contents\s+enable\s+row\s+level\s+security/i.test(landingMigration.source),
  '0051 must enable RLS on public.landing_page_contents',
);
assert(
  !/create\s+policy[^;]*on\s+public\.landing_page_contents\b/i.test(combinedMigrations),
  'No migration may create a policy on public.landing_page_contents in this fail-closed posture',
);
assert(
  !/on\s+public\.landing_page_contents[^;]*for\s+(select|insert|update|delete)\b/i.test(combinedMigrations) &&
    !/for\s+(select|insert|update|delete)\b[^;]*on\s+public\.landing_page_contents\b/i.test(combinedMigrations),
  'No migration may define SELECT or mutation policies on public.landing_page_contents',
);
assert(
  !/grant\s+[^;]*\bon\s+(?:table\s+)?public\.landing_page_contents\b[^;]*\bto\s+(?:anon|authenticated)\b/i.test(combinedMigrations),
  'No migration may grant anon/authenticated access on public.landing_page_contents',
);
assert(
  !/grant\s+[^;]*\bto\s+(?:anon|authenticated)\b[^;]*\bon\s+(?:table\s+)?public\.landing_page_contents\b/i.test(combinedMigrations),
  'No migration may grant anon/authenticated access on public.landing_page_contents',
);
assert(
  !/insert\s+into\s+public\.landing_page_contents\b/i.test(combinedMigrations),
  'No migration may insert seed rows into public.landing_page_contents',
);

assertNoSqlStatement(
  migrations,
  /create\s+(?:or\s+replace\s+)?view\s+[^;]*(?:landing_page_contents|landing_public|public_landing|landing_page_public)/i,
  'No SQL-level landing public gate view/projection may exist',
);
assertNoSqlStatement(
  migrations,
  /create\s+materialized\s+view\s+[^;]*(?:landing_page_contents|landing_public|public_landing|landing_page_public)/i,
  'No SQL-level landing public gate materialized view/projection may exist',
);
assertNoSqlStatement(
  migrations,
  /create\s+(?:or\s+replace\s+)?function\s+[^;]*(?:landing_page_contents|landing_public|public_landing|landing_page_public)/i,
  'No SQL-level landing public gate RPC/function may exist',
);
assertNoSqlStatement(
  migrations,
  /security\s+definer[^;]*(?:landing_page_contents|landing_public|public_landing|landing_page_public)|(?:landing_page_contents|landing_public|public_landing|landing_page_public)[^;]*security\s+definer/i,
  'No SECURITY DEFINER landing gate object may exist',
);
assertNoSqlStatement(
  migrations,
  /security\s+invoker[^;]*(?:landing_page_contents|landing_public|public_landing|landing_page_public)|(?:landing_page_contents|landing_public|public_landing|landing_page_public)[^;]*security\s+invoker/i,
  'No SECURITY INVOKER landing gate object may exist',
);

const seedSqlFiles = walkFiles(seedDir, (absolutePath) => absolutePath.toLowerCase().endsWith('.sql'));
for (const seedFile of seedSqlFiles) {
  const source = readFileSync(seedFile, 'utf8');
  assert(
    !/insert\s+into\s+public\.landing_page_contents\b/i.test(source),
    `No seed SQL may insert landing_page_contents rows: ${path.relative(repoRoot, seedFile)}`,
  );
}

const databaseTypesSource = readRelative('supabase/types/database.types.ts');
assert(
  /public:\s*\{[\s\S]*?Views:\s*\{\s*\[_\s+in\s+never\]:\s+never\s*\}/m.test(databaseTypesSource),
  'Generated public.Views must remain empty',
);
for (const projectionToken of landingProjectionTokens) {
  assert(
    !databaseTypesSource.includes(projectionToken),
    `Generated database types must not include landing projection/view token: ${projectionToken}`,
  );
}

const helperSource = readRelative('src/lib/catalog/public-landing-page-queries.ts');
assert(!sourceContainsImport(helperSource), 'Public landing helper must have zero import statements');
for (const helperName of publicLandingHelperNames) {
  assert(
    new RegExp(`export\\s+function\\s+${helperName}\\s*\\(`).test(helperSource),
    `Public landing helper must keep fail-closed export: ${helperName}`,
  );
}
for (const requiredToken of failClosedHelperTokens) {
  assert(helperSource.includes(requiredToken), `Public landing helper must retain fail-closed token: ${requiredToken}`);
}
for (const forbiddenToken of forbiddenHelperTokens) {
  assert(!helperSource.includes(forbiddenToken), `Public landing helper must not include forbidden token: ${forbiddenToken}`);
}

for (const route of landingRoutes) {
  const routeSource = readRelative(route);
  assert(/notFound\s*\(\s*\)/.test(routeSource), `${route} must remain notFound()/fail-closed`);
  assert(
    !/return\s+(?!makeFailClosedResult\b|notFound\s*\()/i.test(routeSource),
    `${route} must not add public rendering return paths`,
  );
  for (const forbiddenToken of forbiddenCrawlerOrRouteTokens) {
    assert(!routeSource.includes(forbiddenToken), `${route} must not expose forbidden landing token: ${forbiddenToken}`);
  }
}

for (const crawlerFile of crawlerFiles) {
  const crawlerSource = readRelative(crawlerFile);
  for (const helperName of publicLandingHelperNames) {
    assert(!crawlerSource.includes(helperName), `${crawlerFile} must not reference ${helperName}`);
  }
  for (const forbiddenToken of forbiddenCrawlerOrRouteTokens) {
    assert(!crawlerSource.includes(forbiddenToken), `${crawlerFile} must not expose forbidden landing token: ${forbiddenToken}`);
  }
}

const routesCheckSource = readRelative('scripts/routes-check.mjs');
for (const routesCheckToken of [
  'public-landing-page-queries',
  'has zero import statements',
  'forbidden skeleton token is absent',
  'notFound',
  'sitemap does not import or reference the landing page gate helper',
  'robots does not import or reference the landing page gate helper',
  'llms.txt does not mention the landing page gate helper',
]) {
  assert(routesCheckSource.includes(routesCheckToken), `routes-check must keep fail-closed guardrail token: ${routesCheckToken}`);
}

const packageJsonSource = readRelative('package.json');
assert(
  /"routes:check"\s*:\s*"node scripts\/routes-check\.mjs"/.test(packageJsonSource),
  'package.json must not relax routes:check',
);

console.log('✅ Landing public gate static checks passed: fail-closed table, projection, helper, route, crawler, seed, and generated type guardrails hold.');
