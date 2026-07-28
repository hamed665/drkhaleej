#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationPath = path.join(
  repoRoot,
  'supabase',
  'migrations',
  '0085_import_pharmacy_expected_version_timestamp_equivalence.sql',
);

function fail(message) {
  console.error(`ERROR: P09-EXPECTED-VERSION-EQUIVALENCE: ${message}`);
  process.exit(1);
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) fail(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) fail(message);
}

if (!existsSync(migrationPath)) fail('0085 migration is missing.');
const content = readFileSync(migrationPath, 'utf8');

for (const [pattern, message] of [
  [/P09 REAL-ADMIN-CANARY: accept equivalent timestamptz wire formats/i, 'phase marker is missing.'],
  [/create\s+or\s+replace\s+function\s+public\.import_publish_pharmacy_private/i, 'canonical private publish RPC is not replaced.'],
  [/v_expected_version\s+timestamptz/i, 'parsed timestamptz authority is missing.'],
  [/v_expected_version\s*:=\s*p_expected_version::timestamptz/i, 'expected version is not parsed as timestamptz.'],
  [/v_center\.updated_at\s+is\s+distinct\s+from\s+v_expected_version/i, 'center version is not compared temporally.'],
  [/security\s+invoker/i, 'RPC must remain security invoker.'],
  [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, 'RPC must keep a pinned search_path.'],
  [/revoke\s+all[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i, 'public roles must remain revoked.'],
  [/grant\s+execute[\s\S]*to\s+service_role/i, 'only service_role may execute the RPC.'],
  [/'visibility'\s*<>\s*'private'/i, 'private visibility boundary is missing.'],
  [/'publicRouteEnabled'/i, 'public route boundary is missing.'],
  [/'indexable'/i, 'index boundary is missing.'],
  [/'sitemapEligible'/i, 'sitemap boundary is missing.'],
]) requirePattern(content, pattern, message);

for (const [pattern, message] of [
  [/v_center\.updated_at::text\s*<>\s*p_expected_version/i, 'presentation-string timestamp comparison must not return.'],
  [/\bcreate\s+policy\b/i, '0085 must not create RLS policies.'],
  [/\b(drop\s+table|drop\s+column|truncate\s+table)\b/i, '0085 must not contain destructive table changes.'],
  [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0085 must not grant public execution.'],
]) forbidPattern(content, pattern, message);

console.log('P09 Pharmacy expected-version timestamp equivalence validation passed.');
