#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const packageJsonPath = path.join(repoRoot, 'package.json');
const supabaseDir = path.join(repoRoot, 'supabase');
const migrationsDir = path.join(supabaseDir, 'migrations');
const testsDir = path.join(supabaseDir, 'tests');
const rlsTestsDir = path.join(testsDir, 'rls');
const seedTestsDir = path.join(testsDir, 'seed');
const seedDir = path.join(supabaseDir, 'seed');
const landingMigrationPath = path.join(migrationsDir, '0051_landing_page_contents.sql');

const requiredStaticScripts = [
  'db:validate:migrations',
  'test:db:rls',
  'test:landing:public-gate',
  'routes:check',
];

function relativePath(absolutePath) {
  return path.relative(repoRoot, absolutePath) || '.';
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(absolutePath) {
  assert(existsSync(absolutePath), `Missing required file: ${relativePath(absolutePath)}`);
  return JSON.parse(readFileSync(absolutePath, 'utf8'));
}

function assertDirectory(absolutePath) {
  assert(existsSync(absolutePath), `Missing required directory: ${relativePath(absolutePath)}`);
  assert(statSync(absolutePath).isDirectory(), `Expected directory: ${relativePath(absolutePath)}`);
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];

  const entries = readdirSync(directory, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(absolutePath));
    } else if (entry.isFile()) {
      results.push(absolutePath);
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function readSqlFiles(directory) {
  assertDirectory(directory);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => ({
      file,
      source: readFileSync(path.join(directory, file), 'utf8'),
    }));
}

const packageJson = readJson(packageJsonPath);
const scripts = packageJson.scripts ?? {};

assert(
  scripts['test:landing:runtime:scaffold'] === 'node scripts/db/test-landing-runtime-scaffold.mjs',
  'package.json must expose the advisory test:landing:runtime:scaffold script.',
);

for (const scriptName of requiredStaticScripts) {
  assert(scripts[scriptName], `Missing required static guardrail package script: ${scriptName}`);
}

assertDirectory(rlsTestsDir);
assertDirectory(seedTestsDir);
assertDirectory(seedDir);

const sqlTestFiles = walkFiles(testsDir).filter((file) => file.endsWith('.sql'));
assert(
  sqlTestFiles.length === 0,
  `Runtime SQL tests are not approved in this scaffold phase. Found: ${sqlTestFiles.map(relativePath).join(', ')}`,
);

const seedSqlFiles = walkFiles(seedDir).filter((file) => file.endsWith('.sql'));
assert(
  seedSqlFiles.length === 0,
  `Production seed SQL is not approved for this harness phase. Found: ${seedSqlFiles.map(relativePath).join(', ')}`,
);

assert(existsSync(landingMigrationPath), 'Missing supabase/migrations/0051_landing_page_contents.sql');

const landingMigration = readFileSync(landingMigrationPath, 'utf8');
assert(
  /create\s+table\s+if\s+not\s+exists\s+public\.landing_page_contents\b/i.test(landingMigration),
  '0051 must create public.landing_page_contents.',
);
assert(
  /alter\s+table\s+public\.landing_page_contents\s+enable\s+row\s+level\s+security/i.test(landingMigration),
  '0051 must enable RLS on public.landing_page_contents.',
);

const combinedMigrations = readSqlFiles(migrationsDir).map(({ source }) => source).join('\n\n');
assert(
  !/create\s+policy[^;]*on\s+public\.landing_page_contents\b/i.test(combinedMigrations),
  'No landing_page_contents RLS policies may exist in this fail-closed scaffold phase.',
);
assert(
  !/on\s+public\.landing_page_contents[^;]*for\s+(select|insert|update|delete)\b/i.test(combinedMigrations) &&
    !/for\s+(select|insert|update|delete)\b[^;]*on\s+public\.landing_page_contents\b/i.test(combinedMigrations),
  'No SELECT or mutation policy may target public.landing_page_contents in this scaffold phase.',
);

const hasSupabaseConfig = existsSync(path.join(supabaseDir, 'config.toml'));
const hasDockerCompose = existsSync(path.join(repoRoot, 'docker-compose.yml'));
const hasDockerfile = existsSync(path.join(repoRoot, 'Dockerfile'));
const hasDbServiceScaffold = hasDockerCompose || hasDockerfile;

console.log('SEO-D3H4-J-D landing SQL runtime harness scaffold status:');
console.log('PASS: scaffold present and package script registered.');
console.log('PASS: required static guardrail scripts remain registered.');
console.log('PASS: supabase/tests/rls and supabase/tests/seed scaffold directories exist.');
console.log('PASS: no SQL runtime test files exist under supabase/tests.');
console.log('PASS: no production seed SQL files exist under supabase/seed.');
console.log('PASS: 0051 landing migration exists and keeps public.landing_page_contents RLS-enabled.');
console.log('PASS: no public.landing_page_contents RLS policies are present.');
console.log(`INFO: supabase/config.toml present: ${hasSupabaseConfig ? 'yes' : 'no'}.`);
console.log(`INFO: docker-compose.yml present: ${hasDockerCompose ? 'yes' : 'no'}.`);
console.log(`INFO: Dockerfile present: ${hasDockerfile ? 'yes' : 'no'}.`);

if (!hasSupabaseConfig || !hasDbServiceScaffold) {
  console.log('SKIP: runtime DB unavailable/blocked for this scaffold phase because local Supabase config and/or DB service scaffolding is absent.');
} else {
  console.log('SKIP: local DB scaffolding is present, but runtime SQL execution is not active until a separately approved phase adds tests and runner behavior.');
}

console.log('SKIP: no runtime SQL tests executed.');
console.log('SKIP: no migrations run and no database connection attempted.');
console.log('NEXT: actual SQL runtime tests require explicit human approval in a future phase.');
