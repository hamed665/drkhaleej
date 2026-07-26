#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
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
const hiddenMigrationPath = path.join(
  repoRoot,
  'supabase',
  'migrations',
  '.p09-expected-version-0085_import_pharmacy_expected_version_timestamp_equivalence.sql.hidden',
);
const currentValidator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations-current.mjs');
const p09Validator = path.join(
  repoRoot,
  'scripts',
  'db',
  'check-import-pharmacy-expected-version-timestamp-equivalence.mjs',
);

if (!existsSync(migrationPath)) {
  console.error('ERROR: P09-EXPECTED-VERSION-EQUIVALENCE: 0085 migration is missing.');
  process.exit(1);
}
if (existsSync(hiddenMigrationPath)) {
  console.error('ERROR: P09-EXPECTED-VERSION-EQUIVALENCE: stale hidden migration exists.');
  process.exit(1);
}

try {
  renameSync(migrationPath, hiddenMigrationPath);
  execFileSync(process.execPath, [currentValidator], { cwd: repoRoot, stdio: 'inherit' });
} finally {
  if (existsSync(hiddenMigrationPath)) renameSync(hiddenMigrationPath, migrationPath);
}

execFileSync(process.execPath, [p09Validator], { cwd: repoRoot, stdio: 'inherit' });
console.log('Current migration validation passed through 0085.');
