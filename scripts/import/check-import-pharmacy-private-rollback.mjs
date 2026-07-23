#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const legacyMigrationPath = path.resolve('supabase/migrations/0071_import_pharmacy_private_rollback_rpc.sql');
const authorityMigrationPath = path.resolve('supabase/migrations/0083_import_pharmacy_atomic_rollback_authority.sql');
const digestMigrationPath = path.resolve('supabase/migrations/0084_import_pharmacy_rollback_digest_schema.sql');
const writerPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-rollback-writer.ts');

for (const file of [legacyMigrationPath, authorityMigrationPath, digestMigrationPath, writerPath]) {
  if (!existsSync(file)) throw new Error(`required rollback file missing: ${file}`);
}

const legacySql = readFileSync(legacyMigrationPath, 'utf8');
const authoritySql = readFileSync(authorityMigrationPath, 'utf8');
const digestSql = readFileSync(digestMigrationPath, 'utf8');
const writer = readFileSync(writerPath, 'utf8');

for (const pattern of [
  /IMPORT-PUBLISH-V: atomic pharmacy private rollback RPC/i,
  /create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private/i,
  /security\s+invoker/i,
  /snapshot_hash\s*<>\s*p_expected_snapshot_hash/i,
  /v_record\.status\s*<>\s*'succeeded'/i,
  /updated_at::text\s*<>\s*p_expected_current_version/i,
  /public\.import_publish_persist_terminal_result\([\s\S]*'rolled_back'/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
]) {
  if (!pattern.test(legacySql)) throw new Error(`0071 missing preserved rollback authority pattern: ${pattern}`);
}

for (const pattern of [
  /P06 ROLLBACK-AUTHORITY-HARDENING/i,
  /add\s+column\s+if\s+not\s+exists\s+consumed_by_profile_id\s+uuid/i,
  /add\s+column\s+if\s+not\s+exists\s+consumed_result\s+jsonb/i,
  /add\s+column\s+if\s+not\s+exists\s+consumed_result_hash\s+text/i,
  /create\s+unique\s+index\s+if\s+not\s+exists\s+import_pharmacy_publish_references_active_version_unique/i,
  /create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private_by_authority/i,
  /p_audit_schema_version\s+is\s+distinct\s+from\s+'drkhaleej\.import\.publishAudit\.v4'/i,
  /from\s+public\.centers[\s\S]*for\s+update/i,
  /consumed_result_hash\s*=\s*encode\(digest\(r\.consumed_result::text,\s*'sha256'\)/i,
  /i\.status\s*=\s*'succeeded'/i,
  /i\.terminal_result\s*->>\s*'kind'\s*=\s*'mutated'/i,
  /r\.expected_current_version\s*=\s*v_center\.updated_at::text/i,
  /s\.restored_at\s+is\s+null/i,
  /for\s+update\s+of\s+r\s*,\s*i\s*,\s*s/i,
  /public\.import_rollback_pharmacy_private\(/i,
  /set\s+consumed_at\s*=\s*clock_timestamp\(\)/i,
  /consumed_by_profile_id\s*=\s*p_actor_profile_id/i,
  /consumed_result\s*=\s*v_consumed_result/i,
  /get\s+diagnostics\s+v_updated\s*=\s*row_count/i,
  /rollback_authority_atomic_consume_failed/i,
  /'status',\s*'replayed'/i,
  /'rawReferenceExposed',\s*false/i,
  /security\s+invoker/i,
  /set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i,
  /revoke\s+all\s+on\s+function[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
]) {
  if (!pattern.test(authoritySql)) throw new Error(`0083 missing rollback authority pattern: ${pattern}`);
}

for (const pattern of [
  /Forward-only correction after isolated Preview proved pgcrypto is installed in the extensions schema/i,
  /create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private_by_authority/i,
  /extensions\.digest\(r\.consumed_result::text,\s*'sha256'\)/i,
  /extensions\.digest\(v_consumed_result::text,\s*'sha256'\)/i,
  /for\s+update\s+of\s+r\s*,\s*i\s*,\s*s/i,
  /public\.import_rollback_pharmacy_private\(/i,
  /rollback_authority_atomic_consume_failed/i,
  /'status',\s*'replayed'/i,
  /security\s+invoker/i,
  /set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i,
  /revoke\s+all\s+on\s+function[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
]) {
  if (!pattern.test(digestSql)) throw new Error(`0084 missing rollback digest correction pattern: ${pattern}`);
}

for (const [sql, label] of [[authoritySql, '0083'], [digestSql, '0084']]) {
  for (const pattern of [
    /security\s+definer/i,
    /status\s*=\s*'active'/i,
    /is_active\s*=\s*true/i,
    /sitemapEligible['"]?\s*,?\s*true/i,
    /indexable['"]?\s*,?\s*true/i,
    /grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i,
  ]) {
    if (pattern.test(sql)) throw new Error(`${label} contains forbidden rollback authority pattern: ${pattern}`);
  }
}

for (const pattern of [/\balter\s+table\b/i, /\bdrop\b/i, /\bcreate\s+policy\b/i]) {
  if (pattern.test(digestSql)) throw new Error(`0084 correction contains forbidden schema scope: ${pattern}`);
}

for (const pattern of [
  /import\s+"server-only"/,
  /import_rollback_pharmacy_private_by_authority/,
  /p_entity_id/,
  /p_actor_profile_id/,
  /drkhaleej\.import\.publishAudit\.v4/,
  /authorityConsumed:\s*true/,
  /rawReferenceExposed:\s*false/,
]) {
  if (!pattern.test(writer)) throw new Error(`rollback writer missing required P06 pattern: ${pattern}`);
}

for (const pattern of [
  /publishReference/,
  /rollbackSnapshotId/,
  /reservationId/,
  /\.from\(['"]centers['"]\)/,
  /\.update\(/,
  /status:\s*['"]active['"]/,
  /is_active:\s*true/,
]) {
  if (pattern.test(writer)) throw new Error(`rollback writer contains forbidden direct/raw-reference pattern: ${pattern}`);
}

console.log('pharmacy atomic rollback authority validation passed.');
