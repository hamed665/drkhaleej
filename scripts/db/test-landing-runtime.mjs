import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '../..');

const approvedScriptCommand = 'node scripts/db/test-landing-runtime.mjs';
const landingMigrationFile = 'supabase/migrations/0051_landing_page_contents.sql';
const migrationsDir = path.join(repoRoot, 'supabase/migrations');
const testsDir = path.join(repoRoot, 'supabase/tests');
const seedDir = path.join(repoRoot, 'supabase/seed');
const approvedLocalHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const hardBlockedHostTokens = ['supabase.co', 'pooler.supabase.com'];
const productionHostTokens = [
  ...hardBlockedHostTokens,
  'aws',
  'amazonaws',
  'neon.tech',
  'render.com',
  'railway.app',
  'fly.dev',
  'digitalocean',
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function skip(message) {
  console.log(`SKIP: ${message}`);
  process.exit(0);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readRelative(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function listFilesRecursive(relativeDir, predicate = () => true) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!existsSync(absoluteDir)) return [];
  const results = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(repoRoot, absolutePath).split(path.sep).join('/');
        if (predicate(relativePath)) results.push(relativePath);
      }
    }
  };
  visit(absoluteDir);
  return results.sort();
}

function runPreflight() {
  console.log('Preflight: verifying repo-local deny-by-default guardrails before any database connection.');

  const packageJson = JSON.parse(readRelative('package.json'));
  const scripts = packageJson.scripts ?? {};
  assert(existsSync(path.join(repoRoot, 'scripts/db/test-landing-runtime-scaffold.mjs')), 'Missing current scaffold script.');
  assert(
    scripts['test:landing:runtime:scaffold'] === 'node scripts/db/test-landing-runtime-scaffold.mjs',
    'package.json must keep test:landing:runtime:scaffold.',
  );
  assert(
    scripts['test:landing:public-gate'] === 'node scripts/db/test-landing-public-gate-static.mjs',
    'package.json must keep test:landing:public-gate.',
  );
  assert(
    scripts['db:validate:migrations'] === 'node scripts/db/validate-migrations.mjs',
    'package.json must keep db:validate:migrations.',
  );
  assert(
    scripts['test:db:rls'] === 'pnpm db:validate:migrations && node scripts/db/test-rls-static.mjs',
    'package.json must keep test:db:rls.',
  );
  assert(
    scripts['test:landing:runtime'] === approvedScriptCommand,
    `package.json must expose test:landing:runtime as "${approvedScriptCommand}".`,
  );

  assert(existsSync(path.join(repoRoot, landingMigrationFile)), 'Missing supabase/migrations/0051_landing_page_contents.sql.');
  const landingMigration = readRelative(landingMigrationFile);
  assert(
    /create\s+table\s+if\s+not\s+exists\s+public\.landing_page_contents\b/i.test(landingMigration),
    '0051 must create public.landing_page_contents.',
  );
  assert(
    /alter\s+table\s+public\.landing_page_contents\s+enable\s+row\s+level\s+security/i.test(landingMigration),
    '0051 must enable RLS on public.landing_page_contents.',
  );

  const migrationSqlFiles = listFilesRecursive('supabase/migrations', (file) => file.endsWith('.sql'));
  for (const file of migrationSqlFiles) {
    const source = readRelative(file);
    assert(
      !/create\s+policy[\s\S]*?on\s+public\.landing_page_contents\b/i.test(source),
      `Landing table policy must not exist in source migration: ${file}`,
    );
    assert(
      !/grant\s+[\s\S]*?on\s+(?:table\s+)?public\.landing_page_contents\b[\s\S]*?to\s+(?:anon|authenticated)\b/i.test(source)
        && !/grant\s+[\s\S]*?to\s+(?:anon|authenticated)\b[\s\S]*?on\s+(?:table\s+)?public\.landing_page_contents\b/i.test(source),
      `Landing table anon/authenticated grant must not exist in source migration: ${file}`,
    );
  }

  const testSqlFiles = listFilesRecursive('supabase/tests', (file) => file.endsWith('.sql'));
  assert(testSqlFiles.length === 0, `No supabase/tests SQL files are approved for this runtime runner; found: ${testSqlFiles.join(', ')}`);

  const seedSqlFiles = listFilesRecursive('supabase/seed', (file) => file.endsWith('.sql'));
  assert(seedSqlFiles.length === 0, `No supabase/seed SQL files are approved; found: ${seedSqlFiles.join(', ')}`);

  assert(existsSync(testsDir), 'Missing supabase/tests directory.');
  assert(existsSync(seedDir), 'Missing supabase/seed directory.');
  console.log('Preflight passed: source guardrails still deny raw landing table exposure.');
}

function getDatabaseUrl() {
  if (process.env.LANDING_RUNTIME_DATABASE_URL) {
    return { name: 'LANDING_RUNTIME_DATABASE_URL', value: process.env.LANDING_RUNTIME_DATABASE_URL };
  }
  if (process.env.DATABASE_URL) {
    return { name: 'DATABASE_URL', value: process.env.DATABASE_URL };
  }
  if (process.env.POSTGRES_URL) {
    return { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL };
  }
  return null;
}

function assertSafeDatabaseUrl(databaseUrlSource) {
  let parsed;
  try {
    parsed = new URL(databaseUrlSource.value);
  } catch {
    fail(`${databaseUrlSource.name} is not a valid PostgreSQL connection URL.`);
  }

  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), `${databaseUrlSource.name} must use postgres:// or postgresql://.`);

  const hostname = parsed.hostname.toLowerCase();
  const displayHost = hostname || '(empty host)';
  for (const token of hardBlockedHostTokens) {
    assert(!hostname.includes(token), `${databaseUrlSource.name} host is forbidden for this local/advisory test: ${token}.`);
  }

  const allowNonLocal = process.env.LANDING_RUNTIME_ALLOW_NONLOCAL === '1';
  for (const token of productionHostTokens) {
    assert(!hostname.includes(token), `${databaseUrlSource.name} host appears production-like and is refused: ${token}.`);
  }

  assert(
    approvedLocalHosts.has(hostname) || allowNonLocal,
    `${databaseUrlSource.name} host must be localhost/127.0.0.1/::1 unless LANDING_RUNTIME_ALLOW_NONLOCAL=1 is set; received host ${displayHost}.`,
  );

  if (allowNonLocal && !approvedLocalHosts.has(hostname)) {
    console.log(`Safety notice: LANDING_RUNTIME_ALLOW_NONLOCAL=1 permits non-local host ${displayHost}; Supabase pooler/project hosts remain hard-blocked.`);
  }
}

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
    ...options,
  });
}

function assertPsqlAvailable(databaseUrlSource) {
  const check = runCommand('psql', ['--version']);
  if (check.error?.code === 'ENOENT') {
    fail(`psql is required when ${databaseUrlSource.name} is provided, but psql is not available on PATH.`);
  }
  if (check.status !== 0) {
    fail(`Unable to execute psql --version. ${check.stderr || check.stdout || ''}`.trim());
  }
  console.log(check.stdout.trim());
}

function psql(databaseUrl, args, options = {}) {
  const result = runCommand('psql', ['--no-psqlrc', '--set', 'ON_ERROR_STOP=1', '--dbname', databaseUrl, ...args], options);
  if (result.error) {
    fail(`psql execution failed: ${result.error.message}`);
  }
  return result;
}

function psqlRequired(databaseUrl, args, label) {
  const result = psql(databaseUrl, args);
  if (result.status !== 0) {
    fail(`${label} failed.\n${result.stderr || result.stdout}`.trim());
  }
  return result;
}

function ensureRuntimeRoles(databaseUrl) {
  console.log('Runtime setup: ensuring local NOLOGIN anon/authenticated roles exist for DB-level role simulation.');
  const sql = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
    RAISE NOTICE 'Created local advisory NOLOGIN role: anon';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
    RAISE NOTICE 'Created local advisory NOLOGIN role: authenticated';
  END IF;
END
$$;
`;
  psqlRequired(databaseUrl, ['--command', sql], 'Ensuring anon/authenticated runtime roles');
}

function applyMigrations(databaseUrl) {
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  assert(migrationFiles.includes('0051_landing_page_contents.sql'), 'Migration list must include 0051_landing_page_contents.sql.');

  console.log(`Runtime setup: applying ${migrationFiles.length} migrations to the provided local/advisory database.`);
  console.log('Runtime setup: no database reset is performed by this runner.');
  for (const file of migrationFiles) {
    const relativePath = `supabase/migrations/${file}`;
    const absolutePath = path.join(repoRoot, relativePath);
    const result = psql(databaseUrl, ['--file', absolutePath]);
    if (result.status !== 0) {
      fail(`Applying migration ${relativePath} failed. The provided local/advisory database may not be fresh or compatible.\n${result.stderr || result.stdout}`.trim());
    }
  }
}

function sqlScalar(databaseUrl, sql, label) {
  const result = psqlRequired(databaseUrl, ['--tuples-only', '--no-align', '--command', sql], label);
  return result.stdout.trim();
}

function assertRuntimeCatalog(databaseUrl) {
  console.log('Runtime assertions: checking table existence, RLS, policies, and grants.');
  assert(
    sqlScalar(databaseUrl, "SELECT to_regclass('public.landing_page_contents') IS NOT NULL;", 'Table existence assertion') === 't',
    'public.landing_page_contents must exist at runtime.',
  );
  assert(
    sqlScalar(
      databaseUrl,
      "SELECT relrowsecurity FROM pg_class WHERE oid = 'public.landing_page_contents'::regclass;",
      'RLS enabled assertion',
    ) === 't',
    'RLS must be enabled on public.landing_page_contents at runtime.',
  );
  assert(
    sqlScalar(
      databaseUrl,
      "SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'landing_page_contents';",
      'Policy absence assertion',
    ) === '0',
    'No policies may exist on public.landing_page_contents at runtime.',
  );
  assert(
    sqlScalar(
      databaseUrl,
      "SELECT count(*) FROM information_schema.table_privileges WHERE table_schema = 'public' AND table_name = 'landing_page_contents' AND grantee IN ('anon', 'authenticated');",
      'Grant absence assertion',
    ) === '0',
    'No anon/authenticated grants may exist on public.landing_page_contents at runtime.',
  );
}

function expectDenied(databaseUrl, roleName, statement, label) {
  const sql = `BEGIN; SET LOCAL ROLE ${roleName}; ${statement}; ROLLBACK;`;
  const result = psql(databaseUrl, ['--command', sql]);
  if (result.status === 0) {
    fail(`${label} unexpectedly succeeded for role ${roleName}.`);
  }
  const output = `${result.stderr}\n${result.stdout}`.toLowerCase();
  assert(
    output.includes('permission denied') || output.includes('violates row-level security policy'),
    `${label} for role ${roleName} failed for an unexpected reason.\n${result.stderr || result.stdout}`.trim(),
  );
  console.log(`Denied as expected: ${roleName} ${label}.`);
}

function assertRoleDenials(databaseUrl) {
  console.log('Runtime assertions: checking anon/authenticated raw table SELECT and mutation denial.');
  for (const roleName of ['anon', 'authenticated']) {
    expectDenied(databaseUrl, roleName, 'SELECT 1 FROM public.landing_page_contents LIMIT 1', 'SELECT raw landing_page_contents');
    expectDenied(
      databaseUrl,
      roleName,
      "INSERT INTO public.landing_page_contents(locale, country_code, family, canonical_landing_key, title, intro, sections, faq) VALUES ('en', 'om', 'service', 'runtime-deny-test', 'Runtime deny test', 'Runtime deny test intro.', '{}'::jsonb, '[]'::jsonb)",
      'INSERT raw landing_page_contents',
    );
    expectDenied(databaseUrl, roleName, 'UPDATE public.landing_page_contents SET title = title', 'UPDATE raw landing_page_contents');
    expectDenied(databaseUrl, roleName, 'DELETE FROM public.landing_page_contents WHERE false', 'DELETE raw landing_page_contents');
  }
}

runPreflight();

const databaseUrlSource = getDatabaseUrl();
if (!databaseUrlSource) {
  skip('No LANDING_RUNTIME_DATABASE_URL, DATABASE_URL, or POSTGRES_URL is present in process.env; advisory runtime DB proof not executed.');
}

console.log(`Runtime: using ${databaseUrlSource.name}; connection URL and credentials are intentionally not logged.`);
assertSafeDatabaseUrl(databaseUrlSource);
assertPsqlAvailable(databaseUrlSource);
ensureRuntimeRoles(databaseUrlSource.value);
applyMigrations(databaseUrlSource.value);
assertRuntimeCatalog(databaseUrlSource.value);
assertRoleDenials(databaseUrlSource.value);
console.log('✅ Landing raw table runtime checks passed: local/advisory DB denies anon/authenticated raw access with no policies or grants.');
console.log('Note: this is DB-level psql proof only; it is not a Supabase/PostgREST/JWT full-stack proof and is not CI-required.');
