#!/usr/bin/env node
import '../db/check-import-pharmacy-private-publish-rpc.mjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const writerPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-mutation-writer.ts');
if (!existsSync(writerPath)) throw new Error('Supabase pharmacy private mutation writer is missing.');
const source = readFileSync(writerPath, 'utf8');

const required = [
  /import\s+"server-only"/,
  /import_publish_pharmacy_private/,
  /p_idempotency_record_id/,
  /p_rollback_snapshot_id/,
  /p_execution_started_audit_id/,
  /p_expected_version/,
  /visibility:\s*"private"/,
  /publicRouteEnabled:\s*false/,
  /indexable:\s*false/,
  /sitemapEligible:\s*false/,
  /async\s+rollbackOne\(\)\s*\{[\s\S]*return\s+false/,
];
for (const pattern of required) {
  if (!pattern.test(source)) throw new Error(`pharmacy writer missing required safety pattern: ${pattern}`);
}

const forbidden = [
  /\.from\(['"]centers['"]\)/,
  /\.update\(/,
  /status:\s*['"]active['"]/,
  /is_active:\s*true/,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
];
for (const pattern of forbidden) {
  if (pattern.test(source)) throw new Error(`pharmacy writer contains forbidden pattern: ${pattern}`);
}

console.log('Supabase pharmacy private mutation writer validation passed.');
