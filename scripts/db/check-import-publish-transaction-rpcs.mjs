#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationName = '0069_import_publish_transaction_rpcs.sql';
const migrationPath = path.join(repoRoot, 'supabase', 'migrations', migrationName);

function fail(message) {
  console.error(`ERROR: IMPORT-PUBLISH-H RPC security: ${message}`);
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

requireCondition(existsSync(migrationPath), `${migrationName} is missing.`);
const content = readFileSync(migrationPath, 'utf8');

for (const [pattern, message] of [
  [/\bsecurity\s+definer\b/i, 'RPCs must not use SECURITY DEFINER.'],
  [/\bgrant\s+execute[\s\S]*\bto\s+(public|anon|authenticated)\b/i, 'RPC execution must not be granted to public, anon, or authenticated roles.'],
  [/\bcreate\s+policy\b/i, 'RPC migration must not create RLS policies.'],
  [/\bdisable\s+row\s+level\s+security\b/i, 'RPC migration must not disable RLS.'],
  [/\btruncate\b/i, 'RPC migration must not truncate data.'],
  [/\bdrop\s+(table|function|schema)\b/i, 'RPC migration must not drop tables, functions, or schemas.'],
  [/\bdelete\s+from\b/i, 'RPC migration must not delete persisted audit-chain rows.'],
  [/\bupdate\s+public\.(doctors|hospitals|pharmacies|clinics|centers|profiles)\b/i, 'RPC migration must not mutate public entity tables.'],
]) forbidPattern(content, pattern, message);

for (const [pattern, message] of [
  [/IMPORT-PUBLISH-H: controlled publish persistence transaction RPCs/i, 'Migration marker is missing.'],
  [/create\s+or\s+replace\s+function\s+public\.import_publish_reserve_snapshot_audit/i, 'Reservation/snapshot/audit RPC is missing.'],
  [/create\s+or\s+replace\s+function\s+public\.import_publish_persist_terminal_result/i, 'Terminal-result RPC is missing.'],
  [/language\s+plpgsql[\s\S]*security\s+invoker[\s\S]*set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, 'RPCs must be PL/pgSQL SECURITY INVOKER with pinned search_path.'],
  [/insert\s+into\s+public\.import_publish_idempotency_records/i, 'Reservation RPC must write the idempotency record.'],
  [/insert\s+into\s+public\.import_publish_rollback_snapshots/i, 'Reservation RPC must write the rollback snapshot.'],
  [/insert\s+into\s+public\.import_publish_audit_events/i, 'RPC migration must append audit events.'],
  [/select[\s\S]*from\s+public\.import_publish_idempotency_records[\s\S]*for\s+update/i, 'RPCs must lock idempotency records for conflict-safe execution.'],
  [/request_hash[\s\S]*\^\[a-f0-9\]\{64\}\$/i, 'Request hash validation is missing.'],
  [/snapshot_hash[\s\S]*\^\[a-f0-9\]\{64\}\$/i, 'Snapshot hash validation is missing.'],
  [/return\s+jsonb_build_object\([\s\S]*'status'\s*,\s*'replayed'/i, 'Replay result handling is missing.'],
  [/return\s+jsonb_build_object\([\s\S]*'status'\s*,\s*'conflict'/i, 'Conflict result handling is missing.'],
  [/revoke\s+all\s+on\s+function\s+public\.import_publish_reserve_snapshot_audit[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i, 'Reservation RPC execution must be revoked from public roles.'],
  [/grant\s+execute\s+on\s+function\s+public\.import_publish_reserve_snapshot_audit[\s\S]*to\s+service_role/i, 'Reservation RPC must be service-role-only.'],
  [/revoke\s+all\s+on\s+function\s+public\.import_publish_persist_terminal_result[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i, 'Terminal RPC execution must be revoked from public roles.'],
  [/grant\s+execute\s+on\s+function\s+public\.import_publish_persist_terminal_result[\s\S]*to\s+service_role/i, 'Terminal RPC must be service-role-only.'],
  [/status\s+in\s*\('reserved','in_progress','succeeded','failed','rolled_back'\)/i, 'Idempotency status constraint must include rolled_back.'],
]) requirePattern(content, pattern, message);

const securityInvokerCount = (content.match(/\bsecurity\s+invoker\b/gi) ?? []).length;
const pinnedSearchPathCount = (content.match(/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/gi) ?? []).length;
requireCondition(securityInvokerCount === 2, 'Exactly two SECURITY INVOKER RPCs are required.');
requireCondition(pinnedSearchPathCount === 2, 'Both RPCs must pin pg_catalog, public search_path.');

console.log('IMPORT-PUBLISH-H transaction RPC security validation passed.');
