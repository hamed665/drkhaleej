#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  renameSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const legacyRlsStaticTest = path.join(repoRoot, 'scripts', 'db', 'test-rls-static.mjs');

const migrations = {
  taxRls: '0055_taxonomy_public_rls.sql',
  specialty: '0057_specialty_taxonomy_hierarchy.sql',
  adminAudit: '0058_admin_audit_events.sql',
  adminMedia: '0059_admin_media_library_foundation.sql',
  adminCms: '0060_admin_cms_core_revision_foundation.sql',
  importStaging: '0061_import_staging_foundation.sql',
  doctorPracticeHardening: '0062_doctor_multi_practice_relation_hardening.sql',
};

const migrationPaths = Object.fromEntries(
  Object.entries(migrations).map(([key, fileName]) => [
    key,
    path.join(migrationsDir, fileName),
  ]),
);

const hiddenMigrationPaths = Object.fromEntries(
  Object.entries(migrations).map(([key, fileName]) => [
    key,
    path.join(migrationsDir, `.rls-static-${key}-${fileName}.hidden`),
  ]),
);

function fail(message) {
  console.error(`❌ ADM-IMPORT-A static RLS test: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function requirePattern(content, pattern, message) {
  assert(pattern.test(content), message);
}

function forbidPattern(content, pattern, message) {
  assert(!pattern.test(content), message);
}

function readMigration(key) {
  assert(statSync(migrationsDir).isDirectory(), `Missing migrations directory: ${migrationsDir}`);
  const migrationPath = migrationPaths[key];
  const migrationName = migrations[key];
  assert(typeof migrationPath === 'string' && existsSync(migrationPath), `${migrationName} is missing.`);
  return readFileSync(migrationPath, 'utf8');
}

function validateNoAdminPolicies(content, label) {
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, `${label} must not create RLS policies.`],
    [/\bfor\s+select\b/i, `${label} must not add SELECT policies.`],
    [/\bfor\s+insert\b/i, `${label} must not add INSERT policies.`],
    [/\bfor\s+update\b/i, `${label} must not add UPDATE policies.`],
    [/\bfor\s+delete\b/i, `${label} must not add DELETE policies.`],
    [/\bto\s+anon\b/i, `${label} must not expose anon access.`],
    [/\bto\s+authenticated\b/i, `${label} must not expose authenticated access.`],
  ]) {
    forbidPattern(content, pattern, message);
  }
}

function validateTaxonomyRlsMigration() {
  const content = readMigration('taxRls');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0055 must not contain INSERT INTO.'],
    [/\bdrop\b/i, '0055 must not contain DROP.'],
    [/\bfor\s+insert\b/i, '0055 must not contain INSERT policies.'],
    [/\bfor\s+update\b/i, '0055 must not contain UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0055 must not contain DELETE policies.'],
    [/\bto\s+service_role\b/i, '0055 must not grant to service_role.'],
    [/\busing\s*\(\s*true\s*\)/i, '0055 must not use broad TRUE policy predicates.'],
  ]) forbidPattern(content, pattern, message);

  for (const [pattern, message] of [
    [/alter\s+table\s+public\.healthcare_verticals\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on healthcare_verticals.'],
    [/alter\s+table\s+public\.center_categories\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_categories.'],
    [/alter\s+table\s+public\.center_category_assignments\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_category_assignments.'],
    [/create\s+policy\s+healthcare_verticals_select_public_active[\s\S]*on\s+public\.healthcare_verticals[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_active\s*=\s*true/i, 'healthcare_verticals policy must be public active SELECT only.'],
    [/create\s+policy\s+center_categories_select_public_active[\s\S]*on\s+public\.center_categories[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_active\s*=\s*true/i, 'center_categories policy must be public active SELECT only.'],
    [/create\s+policy\s+center_category_assignments_select_public_approved[\s\S]*on\s+public\.center_category_assignments[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_public\s*=\s*true[\s\S]*review_status\s*=\s*'approved'/i, 'center_category_assignments policy must be approved public SELECT only.'],
  ]) requirePattern(content, pattern, message);
}

function validateSpecialtyAliasRlsMigration() {
  const content = readMigration('specialty');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0057 must not contain INSERT INTO.'],
    [/\bdrop\s+table\b/i, '0057 must not drop tables.'],
    [/\bfor\s+insert\b/i, '0057 must not add INSERT policies.'],
    [/\bfor\s+update\b/i, '0057 must not add UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0057 must not add DELETE policies.'],
    [/\bto\s+service_role\b/i, '0057 must not grant to service_role.'],
    [/\busing\s*\(\s*true\s*\)/i, '0057 must not use broad TRUE policy predicates.'],
  ]) forbidPattern(content, pattern, message);

  for (const [pattern, message] of [
    [/create\s+table\s+if\s+not\s+exists\s+public\.specialty_aliases/i, '0057 must create specialty_aliases.'],
    [/alter\s+table\s+public\.specialty_aliases\s+enable\s+row\s+level\s+security/i, '0057 must enable RLS on specialty_aliases.'],
    [/create\s+policy\s+specialty_aliases_select_public_active[\s\S]*on\s+public\.specialty_aliases[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated/i, 'specialty_aliases policy must be public SELECT only.'],
    [/from\s+public\.specialties\s+specialty/i, 'specialty_aliases policy must check parent specialties.'],
  ]) requirePattern(content, pattern, message);
}

function validateAdminAuditEventsRlsMigration() {
  const content = readMigration('adminAudit');
  validateNoAdminPolicies(content, '0058');
  requirePattern(content, /alter\s+table\s+public\.admin_audit_events\s+enable\s+row\s+level\s+security/i, '0058 must enable RLS on admin_audit_events.');
}

function validateAdminMediaLibraryRlsMigration() {
  const content = readMigration('adminMedia');
  validateNoAdminPolicies(content, '0059');
}

function validateAdminCmsRlsMigration() {
  const content = readMigration('adminCms');
  validateNoAdminPolicies(content, '0060');
  requirePattern(content, /alter\s+table\s+public\.cms_content_entries\s+enable\s+row\s+level\s+security/i, '0060 must enable RLS on cms_content_entries.');
  requirePattern(content, /alter\s+table\s+public\.cms_content_revisions\s+enable\s+row\s+level\s+security/i, '0060 must enable RLS on cms_content_revisions.');
}

function validateImportStagingRlsMigration() {
  const content = readMigration('importStaging');
  validateNoAdminPolicies(content, '0061');
  for (const tableName of [
    'import_batches',
    'import_files',
    'import_raw_rows',
    'import_validation_issues',
    'import_entity_candidates',
    'import_duplicate_candidates',
    'import_mapping_results',
    'import_publish_queue',
  ]) {
    requirePattern(
      content,
      new RegExp(`alter\\s+table\\s+public\\.${tableName}\\s+enable\\s+row\\s+level\\s+security`, 'i'),
      `0061 must enable RLS on ${tableName}.`,
    );
  }
}

function validateDoctorPracticeHardeningRlsMigration() {
  const content = readMigration('doctorPracticeHardening');
  validateNoAdminPolicies(content, '0062');
  requirePattern(content, /alter\s+table\s+public\.doctor_practice_locations/i, '0062 must alter doctor_practice_locations.');
  requirePattern(content, /public_relation_visible\s+boolean\s+not\s+null\s+default\s+false/i, '0062 must keep public relation visibility false by default.');
}

function runLegacyStaticRlsTestWithoutLaterMigrations() {
  for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths)) {
    assert(!existsSync(hiddenPath), `Hidden migration file already exists for ${key}.`);
  }

  for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths)) {
    renameSync(migrationPaths[key], hiddenPath);
  }

  try {
    execFileSync(process.execPath, [legacyRlsStaticTest], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths).reverse()) {
      if (existsSync(hiddenPath)) {
        renameSync(hiddenPath, migrationPaths[key]);
      }
    }
  }
}

validateTaxonomyRlsMigration();
validateSpecialtyAliasRlsMigration();
validateAdminAuditEventsRlsMigration();
validateAdminMediaLibraryRlsMigration();
validateAdminCmsRlsMigration();
validateImportStagingRlsMigration();
validateDoctorPracticeHardeningRlsMigration();
runLegacyStaticRlsTestWithoutLaterMigrations();

console.log('ADM-IMPORT-A static RLS validation passed.');
