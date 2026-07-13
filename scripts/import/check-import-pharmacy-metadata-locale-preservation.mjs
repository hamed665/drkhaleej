#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve('supabase/migrations/0075_import_pharmacy_metadata_locale_preservation.sql');
const canonicalPath = path.resolve('src/server/admin/import-pharmacy-canonical-mutation-patch.ts');

for (const requiredPath of [migrationPath, canonicalPath]) {
  if (!existsSync(requiredPath)) throw new Error(`required Pharmacy preservation file is missing: ${requiredPath}`);
}

const migration = readFileSync(migrationPath, 'utf8');
const canonical = readFileSync(canonicalPath, 'utf8');

const requiredMigrationPatterns = [
  /IMPORT-PUBLISH-AA: preserve protected Pharmacy metadata and locale/i,
  /'metadata_patch'/,
  /v_allowed_metadata_keys\s+constant\s+text\[\]/i,
  /pharmacy_metadata_patch_key_forbidden/i,
  /coalesce\(metadata,\s*'\{\}'::jsonb\)\s*\|\|\s*\(p_patch->'metadata_patch'\)/i,
  /status\s*=\s*'draft'::public\.provider_status/i,
  /is_active\s*=\s*false/i,
  /is_featured\s*=\s*false/i,
  /revoke\s+all\s+on\s+function[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i,
  /grant\s+execute\s+on\s+function[\s\S]*to\s+service_role/i,
];
for (const pattern of requiredMigrationPatterns) {
  if (!pattern.test(migration)) throw new Error(`0075 missing required preservation pattern: ${pattern}`);
}

const forbiddenMigrationPatterns = [
  /default_locale\s*=/i,
  /default_country\s*=/i,
  /metadata\s*=\s*p_patch->'metadata'/i,
  /'canonicalGeo'\s*,/i,
  /'projectionVersion'\s*,/i,
  /security\s+definer/i,
  /status\s*=\s*'active'/i,
  /is_active\s*=\s*true/i,
];
for (const pattern of forbiddenMigrationPatterns) {
  if (pattern.test(migration)) throw new Error(`0075 contains forbidden preservation pattern: ${pattern}`);
}

for (const token of ['metadata_patch', 'sourceEvidence', 'rawPayloadHash']) {
  if (!canonical.includes(token)) throw new Error(`canonical Pharmacy patch must include ${token}`);
}
for (const forbidden of ['default_locale:', 'default_country:', 'canonicalGeo:', 'projectionVersion:']) {
  if (canonical.includes(forbidden)) throw new Error(`canonical Pharmacy mutation must not include protected field ${forbidden}`);
}

console.log('Pharmacy metadata and locale preservation validation passed.');
