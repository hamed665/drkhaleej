#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationName = '0067_sensitive_helper_search_path_hardening.sql';
const migrationPath = path.join(repoRoot, 'supabase', 'migrations', migrationName);

const sensitiveHelpers = [
  'current_profile_id()',
  'is_platform_admin()',
  'is_provider_user()',
  'is_patient_user()',
  'is_active_center_member(uuid)',
  'can_manage_center(uuid)',
  'can_view_center_private_data(uuid)',
  'can_view_patient_contact(uuid)',
  'can_view_appointment(uuid)',
  'can_view_review_private(uuid)',
  'can_view_review_report(uuid)',
  'can_view_media_asset_private(uuid)',
  'can_view_entity_media_private(uuid)',
  'can_view_center_subscription(uuid)',
  'can_view_sponsored_campaign(uuid)',
  'can_view_sponsored_placement_private(uuid)',
  'can_view_consent_log(uuid)',
  'can_view_audit_log(uuid)',
];

function fail(message) {
  console.error(`ERROR: SEC-HELPER-SEARCH-PATH-A: ${message}`);
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function helperPattern(helperSignature) {
  const [name, args] = helperSignature.split('(');
  const normalizedArgs = args.replace(')', '').trim();
  const argsPattern = normalizedArgs.length === 0 ? '\\s*' : escapeRegExp(normalizedArgs).replace(/\\ /g, '\\s+');

  return new RegExp(
    `alter\\s+function\\s+public\\.${name}\\s*\\(\\s*${argsPattern}\\s*\\)\\s+set\\s+search_path\\s*=\\s*public\\s*,\\s*auth\\s*,\\s*pg_temp`,
    'i',
  );
}

requireCondition(existsSync(migrationPath), `${migrationName} is missing.`);
const migration = readFileSync(migrationPath, 'utf8');

requirePattern(
  migration,
  /SEC-HELPER-SEARCH-PATH-A: sensitive helper search_path hardening/i,
  '0067 must include the SEC-HELPER-SEARCH-PATH-A marker.',
);

for (const helper of sensitiveHelpers) {
  requirePattern(
    migration,
    helperPattern(helper),
    `0067 must set ${helper} search_path to public, auth, pg_temp.`,
  );
}

for (const [pattern, message] of [
  [/\bdrop\b/i, '0067 must not contain DROP statements.'],
  [/\bgrant\b/i, '0067 must not contain GRANT statements.'],
  [/\brevoke\b/i, '0067 must not contain REVOKE statements.'],
  [/\bcreate\s+policy\b/i, '0067 must not create policies.'],
  [/\balter\s+table\b/i, '0067 must not alter tables.'],
  [/\bcreate\s+or\s+replace\s+function\b/i, '0067 must not redefine functions.'],
  [/\bsecurity\s+definer\b/i, '0067 must not rewrite SECURITY DEFINER declarations.'],
  [/\bset\s+search_path\s*=\s*public\s*;?\s*$/i, '0067 must include auth and pg_temp in the search_path.'],
]) {
  forbidPattern(migration, pattern, message);
}

console.log('Sensitive helper search_path check passed.');
