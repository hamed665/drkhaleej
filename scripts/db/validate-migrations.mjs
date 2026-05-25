#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';

const expected = [
  '0001_extensions.sql',
  '0002_enums.sql',
  '0003_profiles_auth.sql',
  '0004_geo.sql',
  '0005_taxonomy.sql',
  '0006_centers.sql',
  '0007_doctors.sql',
  '0008_doctor_practice_locations.sql',
  '0009_services_media.sql',
  '0010_claims_ownership.sql',
  '0011_plans_settings_flags.sql',
  '0012_legal_consent.sql',
  '0013_behavior_events.sql',
  '0014_sponsored_slots.sql',
  '0015_audit_admin_ops.sql',
  '0016_indexes_constraints.sql',
  '0017_rls.sql'
];

const dir = 'supabase/migrations';

try {
  if (!statSync(dir).isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();

if (files.length > 0) {
  console.error('ERROR: Phase 2.0 does not allow real SQL migrations yet.');
  console.error(`Found SQL files in ${dir}: ${files.join(', ')}`);
  console.error('Action: Remove SQL migration files; only protocol scaffolding is allowed in Phase 2.0.');
  process.exit(1);
}

console.log('Migration protocol validated.');
console.log(`Expected naming convention documented (not yet created): ${expected.length} files.`);
expected.forEach((name) => console.log(`- ${name}`));
console.log('No SQL migration files found, which is correct for Phase 2.0.');
