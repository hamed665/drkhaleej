#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, renameSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const legacyRlsStaticTest = path.join(repoRoot, 'scripts', 'db', 'test-rls-static.mjs');
const currentMigrationValidator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations-current.mjs');
const expectedVersionValidator = path.join(
  repoRoot,
  'scripts',
  'db',
  'check-import-pharmacy-expected-version-timestamp-equivalence.mjs',
);

function fail(message) {
  console.error(`❌ CURRENT static RLS test: ${message}`);
  process.exit(1);
}
function assert(condition, message) {
  if (!condition) fail(message);
}
function run(file) {
  assert(existsSync(file), `Missing validator: ${path.relative(repoRoot, file)}`);
  execFileSync(process.execPath, [file], { cwd: repoRoot, stdio: 'inherit' });
}

assert(statSync(migrationsDir).isDirectory(), `Missing migrations directory: ${migrationsDir}`);

// The legacy RLS test is intentionally frozen at the original 0001-0053 boundary.
// Every later migration is validated by the current migration gate, then hidden only
// while the legacy scanner runs so legitimate server-only RPC bodies are not mistaken
// for seed writes or public RLS policy changes.
run(currentMigrationValidator);

const laterMigrations = readdirSync(migrationsDir)
  .filter((name) => /^\d{4}_.+\.sql$/.test(name) && Number(name.slice(0, 4)) > 53)
  .sort()
  .map((name) => ({
    name,
    source: path.join(migrationsDir, name),
    hidden: path.join(migrationsDir, `.rls-static-current-${name}.hidden`),
  }));

assert(laterMigrations.length > 0, 'No post-0053 migrations were found.');
for (const item of laterMigrations) {
  assert(existsSync(item.source), `${item.name} is missing before legacy RLS validation.`);
  assert(!existsSync(item.hidden), `Stale hidden migration exists for ${item.name}.`);
}

const renamed = [];
try {
  for (const item of laterMigrations) {
    renameSync(item.source, item.hidden);
    renamed.push(item);
  }
  run(legacyRlsStaticTest);
} finally {
  for (const item of renamed.reverse()) {
    if (existsSync(item.hidden)) renameSync(item.hidden, item.source);
  }
}

// Reassert the P09 migration's closed service-role-only boundary after restoration.
run(expectedVersionValidator);

console.log('Current static RLS validation passed through 0087.');
