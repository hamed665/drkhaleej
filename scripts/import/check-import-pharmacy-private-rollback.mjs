#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve('supabase/migrations/0071_import_pharmacy_private_rollback_rpc.sql');
const writerPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-rollback-writer.ts');

for (const file of [migrationPath, writerPath]) {
  if (!existsSync(file)) throw new Error(`required rollback file missing: ${file}`);
}

const sql = readFileSync(migrationPath, 'utf8');
const writer = readFileSync(writerPath, 'utf8');

const requiredSql = [
  /IMPORT-PUBLISH-V: atomic pharmacy private rollback RPC/i,
  /create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private/i,
  /security\s+invoker/i,
  /set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i,
  /snapshot_hash\s*<>\s*p_expected_snapshot_hash/i,
  /restored_at\s+is\s+not\s+null/i,
  /v_record\.status\s*<>\s*'succeeded'/i,
  /terminal_result->>'actualVersion'/i,
  /center_type\s*<>\s*'pharmacy'::public\.center_type/i,
  /updated_at::text\s*<>\s*p_expected_current_version/i,
  /status\s*=\s*'draft'::public\.provider_status/i,
  /is_active\s*=\s*false/i,
  /is_featured\s*=\s*false/i,
  /status\s*=\s*'rolled_back'/i,
  /'rollback_succeeded'\s*,\s*'rolled_back'/i,
  /restored_by_profile_id\s*=\s*p_actor_profile_id/i,
  /revoke\s+all\s+on\s+function[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
];
for (const pattern of requiredSql) {
  if (!pattern.test(sql)) throw new Error(`0071 missing rollback safety pattern: ${pattern}`);
}

for (const pattern of [
  /security\s+definer/i,
  /status\s*=\s*'active'/i,
  /is_active\s*=\s*true/i,
  /sitemapEligible['"]?\s*,?\s*true/i,
  /indexable['"]?\s*,?\s*true/i,
]) {
  if (pattern.test(sql)) throw new Error(`0071 contains forbidden rollback pattern: ${pattern}`);
}

for (const pattern of [
  /import\s+"server-only"/,
  /import_rollback_pharmacy_private/,
  /p_expected_current_version/,
  /p_expected_snapshot_hash/,
  /\^\[a-f0-9\]\{64\}\$/,
]) {
  if (!pattern.test(writer)) throw new Error(`rollback writer missing required pattern: ${pattern}`);
}

for (const pattern of [/\.from\(['"]centers['"]\)/, /\.update\(/, /status:\s*['"]active['"]/, /is_active:\s*true/]) {
  if (pattern.test(writer)) throw new Error(`rollback writer contains forbidden direct-write pattern: ${pattern}`);
}

console.log('pharmacy private rollback validation passed.');
