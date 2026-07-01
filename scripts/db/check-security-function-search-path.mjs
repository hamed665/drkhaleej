#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationName = '0066_function_search_path_hardening.sql';
const migrationPath = path.join(repoRoot, 'supabase', 'migrations', migrationName);
const sourceMigrationPath = path.join(repoRoot, 'supabase', 'migrations', '0003_profiles_auth.sql');

function fail(message) {
  console.error(`ERROR: SEC-FUNCTION-SEARCH-PATH-A: ${message}`);
  process.exit(1);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

function requirePattern(content, pattern, message) {
  requireCondition(pattern.test(content), message);
}

function forbidPattern(content, pattern, message) {
  requireCondition(!pattern.test(content), message);
}

requireCondition(existsSync(sourceMigrationPath), '0003_profiles_auth.sql is missing.');
const sourceMigration = readFileSync(sourceMigrationPath, 'utf8');
requirePattern(
  sourceMigration,
  /create\s+or\s+replace\s+function\s+public\.set_updated_at\s*\(\s*\)/i,
  'Source migration must define public.set_updated_at() with no arguments.',
);
requirePattern(
  sourceMigration,
  /execute\s+function\s+public\.set_updated_at\s*\(\s*\)/i,
  'Source migration must use public.set_updated_at() as the trigger helper.',
);

requireCondition(existsSync(migrationPath), `${migrationName} is missing.`);
const migration = readFileSync(migrationPath, 'utf8');

for (const [pattern, message] of [
  [/SEC-FUNCTION-SEARCH-PATH-A: function search_path hardening/i, '0066 must include the SEC-FUNCTION-SEARCH-PATH-A marker.'],
  [/alter\s+function\s+public\.set_updated_at\s*\(\s*\)\s+set\s+search_path\s*=\s*public\s*,\s*pg_temp/i, '0066 must set public.set_updated_at() search_path to public, pg_temp.'],
  [/pg_get_function_identity_arguments\s*\(\s*p\.oid\s*\)\s*=\s*''/i, '0066 must confirm the zero-argument function signature before alteration.'],
  [/p\.proname\s*=\s*'set_updated_at'/i, '0066 must target the set_updated_at function name.'],
  [/n\.nspname\s*=\s*'public'/i, '0066 must target the public schema.'],
]) {
  requirePattern(migration, pattern, message);
}

for (const [pattern, message] of [
  [/\bdrop\b/i, '0066 must not contain DROP statements.'],
  [/\bgrant\b/i, '0066 must not contain GRANT statements.'],
  [/\brevoke\b/i, '0066 must not contain REVOKE statements.'],
  [/\bcreate\s+policy\b/i, '0066 must not create policies.'],
  [/\balter\s+table\b/i, '0066 must not alter tables.'],
  [/\bsecurity\s+definer\b/i, '0066 must not redefine SECURITY DEFINER behavior.'],
  [/\bset\s+search_path\s*=\s*public\s*;?\s*$/i, '0066 must include pg_temp in the search_path.'],
]) {
  forbidPattern(migration, pattern, message);
}

console.log('Function search_path security check passed.');
