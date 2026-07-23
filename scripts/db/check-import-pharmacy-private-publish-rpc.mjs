#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve('supabase/migrations/0082_import_pharmacy_private_execution_audit.sql');
if (!existsSync(migrationPath)) throw new Error('0082 Pharmacy private execution migration is missing.');
const source = readFileSync(migrationPath, 'utf8');

const required = [
  /P05 PRIVATE-ADMIN-WIRING/i,
  /create\s+or\s+replace\s+function\s+public\.import_publish_pharmacy_private/i,
  /p_execution_started_audit_id\s+uuid/i,
  /legacy[\s\S]*parameter name[\s\S]*verified reservation audit id/i,
  /security\s+invoker/i,
  /set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i,
  /from\s+public\.import_publish_idempotency_records[\s\S]*for\s+update/i,
  /from\s+public\.import_publish_rollback_snapshots[\s\S]*for\s+update/i,
  /event_payload\s*->>\s*'phase'\s*=\s*'reservation'/i,
  /event_type\s*=\s*'reservation_created'/i,
  /insert\s+into\s+public\.import_publish_audit_events[\s\S]*'execution_started'/i,
  /'phase'\s*,\s*'mutation'/i,
  /drkhaleej\.import\.publishAudit\.v3/i,
  /from\s+public\.centers[\s\S]*for\s+update/i,
  /center_type\s*<>\s*'pharmacy'::public\.center_type/i,
  /updated_at::text\s*<>\s*p_expected_version/i,
  /p_patch\s*->\s*'metadata_patch'/i,
  /status\s*=\s*'draft'::public\.provider_status/i,
  /is_active\s*=\s*false/i,
  /is_featured\s*=\s*false/i,
  /public\.import_publish_persist_terminal_result\s*\(/i,
  /terminal_persistence_failed/i,
  /import_pharmacy_publish_references_reservation_unique/i,
  /revoke\s+all\s+on\s+function[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
];
for (const pattern of required) {
  if (!pattern.test(source)) throw new Error(`0082 missing required safety pattern: ${pattern}`);
}

const forbidden = [
  /security\s+definer/i,
  /\bcreate\s+policy\b/i,
  /\bdrop\s+function\b/i,
  /status\s*=\s*'active'/i,
  /is_active\s*=\s*true/i,
  /is_featured\s*=\s*true/i,
  /sitemapEligible['"]?\s*,?\s*true/i,
  /indexable['"]?\s*,?\s*true/i,
  /publicRouteEnabled['"]?\s*,?\s*true/i,
];
for (const pattern of forbidden) {
  if (pattern.test(source)) throw new Error(`0082 contains forbidden pattern: ${pattern}`);
}

if (source.indexOf("event_payload ->> 'phase' = 'reservation'") >= source.indexOf("'phase', 'mutation'")) {
  throw new Error('Reservation audit verification must precede mutation execution_started.');
}
if (source.indexOf("'phase', 'mutation'") >= source.indexOf('update public.centers')) {
  throw new Error('execution_started must precede the entity mutation.');
}
if (source.indexOf('update public.centers') >= source.indexOf('import_publish_persist_terminal_result')) {
  throw new Error('Terminal persistence must follow the entity mutation in the same RPC.');
}

console.log('Pharmacy private publish RPC validation passed.');
