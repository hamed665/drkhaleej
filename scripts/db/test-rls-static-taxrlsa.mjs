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
const taxRlsMigration = '0055_taxonomy_public_rls.sql';
const specialtyTaxonomyMigration = '0057_specialty_taxonomy_hierarchy.sql';
const adminAuditEventsMigration = '0058_admin_audit_events.sql';
const taxRlsMigrationPath = path.join(migrationsDir, taxRlsMigration);
const specialtyTaxonomyMigrationPath = path.join(migrationsDir, specialtyTaxonomyMigration);
const adminAuditEventsMigrationPath = path.join(migrationsDir, adminAuditEventsMigration);
const hiddenTaxRlsMigrationPath = path.join(
  migrationsDir,
  `.taxrlsa-static-${taxRlsMigration}.hidden`,
);
const hiddenSpecialtyTaxonomyMigrationPath = path.join(
  migrationsDir,
  `.taxspecialtymodela-static-${specialtyTaxonomyMigration}.hidden`,
);
const hiddenAdminAuditEventsMigrationPath = path.join(
  migrationsDir,
  `.admgova-static-${adminAuditEventsMigration}.hidden`,
);

function fail(message) {
  console.error(`❌ TAX-RLS-A static test: ${message}`);
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

function validateTaxonomyRlsMigration() {
  assert(statSync(migrationsDir).isDirectory(), `Missing migrations directory: ${migrationsDir}`);
  assert(existsSync(taxRlsMigrationPath), `${taxRlsMigration} is missing.`);

  const content = readFileSync(taxRlsMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0055 must not contain INSERT INTO.'],
    [/\bdrop\b/i, '0055 must not contain DROP.'],
    [/\bfor\s+insert\b/i, '0055 must not contain INSERT policies.'],
    [/\bfor\s+update\b/i, '0055 must not contain UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0055 must not contain DELETE policies.'],
    [/\bto\s+service_role\b/i, '0055 must not grant to service_role.'],
    [/\busing\s*\(\s*true\s*\)/i, '0055 must not use broad TRUE policy predicates.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  for (const [pattern, message] of [
    [/alter\s+table\s+public\.healthcare_verticals\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on healthcare_verticals.'],
    [/alter\s+table\s+public\.center_categories\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_categories.'],
    [/alter\s+table\s+public\.center_category_assignments\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_category_assignments.'],

    [/create\s+policy\s+healthcare_verticals_select_public_active[\s\S]*on\s+public\.healthcare_verticals[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_active\s*=\s*true/i, 'healthcare_verticals policy must be public active SELECT only.'],
    [/create\s+policy\s+center_categories_select_public_active[\s\S]*on\s+public\.center_categories[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_active\s*=\s*true/i, 'center_categories policy must be public active SELECT only.'],
    [/create\s+policy\s+center_category_assignments_select_public_approved[\s\S]*on\s+public\.center_category_assignments[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated[\s\S]*deleted_at\s+is\s+null[\s\S]*is_public\s*=\s*true[\s\S]*review_status\s*=\s*'approved'/i, 'center_category_assignments policy must be approved public SELECT only.'],

    [/public_directory_enabled\s*=\s*true/i, '0055 must require public_directory_enabled where relevant.'],
    [/public_profile_enabled\s*=\s*true/i, '0055 must require public_profile_enabled where relevant.'],
    [/centers\.status\s*=\s*'active'/i, '0055 assignment policy must require center active status.'],
    [/centers\.is_active\s*=\s*true/i, '0055 assignment policy must require centers.is_active.'],
    [/from\s+public\.healthcare_verticals/i, '0055 must check healthcare_verticals in subqueries.'],
    [/from\s+public\.center_categories/i, '0055 must check center_categories in subqueries.'],
    [/from\s+public\.centers/i, '0055 must check centers in assignment policy.'],
  ]) {
    requirePattern(content, pattern, message);
  }
}

function validateSpecialtyAliasRlsMigration() {
  assert(existsSync(specialtyTaxonomyMigrationPath), `${specialtyTaxonomyMigration} is missing.`);

  const content = readFileSync(specialtyTaxonomyMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0057 must not contain INSERT INTO.'],
    [/\bdrop\s+table\b/i, '0057 must not drop tables.'],
    [/\bfor\s+insert\b/i, '0057 must not add INSERT policies.'],
    [/\bfor\s+update\b/i, '0057 must not add UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0057 must not add DELETE policies.'],
    [/\bto\s+service_role\b/i, '0057 must not grant to service_role.'],
    [/\busing\s*\(\s*true\s*\)/i, '0057 must not use broad TRUE policy predicates.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  for (const [pattern, message] of [
    [/create\s+table\s+if\s+not\s+exists\s+public\.specialty_aliases/i, '0057 must create specialty_aliases.'],
    [/alter\s+table\s+public\.specialty_aliases\s+enable\s+row\s+level\s+security/i, '0057 must enable RLS on specialty_aliases.'],
    [/create\s+policy\s+specialty_aliases_select_public_active[\s\S]*on\s+public\.specialty_aliases[\s\S]*for\s+select[\s\S]*to\s+anon\s*,\s*authenticated/i, 'specialty_aliases policy must be public SELECT only.'],
    [/is_active\s*=\s*true[\s\S]*deleted_at\s+is\s+null/i, 'specialty_aliases policy must require active non-deleted aliases.'],
    [/from\s+public\.specialties\s+specialty/i, 'specialty_aliases policy must check parent specialties.'],
    [/specialty\.is_active\s*=\s*true/i, 'specialty_aliases policy must require active specialty.'],
    [/specialty\.deleted_at\s+is\s+null/i, 'specialty_aliases policy must require non-deleted specialty.'],
    [/specialty\.public_directory_enabled\s*=\s*true/i, 'specialty_aliases policy must respect specialty public_directory_enabled.'],
    [/specialty\.public_profile_enabled\s*=\s*true/i, 'specialty_aliases policy must respect specialty public_profile_enabled.'],
  ]) {
    requirePattern(content, pattern, message);
  }
}

function validateAdminAuditEventsRlsMigration() {
  assert(existsSync(adminAuditEventsMigrationPath), `${adminAuditEventsMigration} is missing.`);
  const content = readFileSync(adminAuditEventsMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0058 must not create RLS policies.'],
    [/\bfor\s+select\b/i, '0058 must not add SELECT policies.'],
    [/\bfor\s+insert\b/i, '0058 must not add INSERT policies.'],
    [/\bfor\s+update\b/i, '0058 must not add UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0058 must not add DELETE policies.'],
    [/\bto\s+anon\b/i, '0058 must not expose anon access.'],
    [/\bto\s+authenticated\b/i, '0058 must not expose authenticated access.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  requirePattern(
    content,
    /alter\s+table\s+public\.admin_audit_events\s+enable\s+row\s+level\s+security/i,
    '0058 must enable RLS on admin_audit_events.',
  );
}

function runLegacyStaticRlsTestWithoutTaxRls() {
  assert(!existsSync(hiddenTaxRlsMigrationPath), 'Hidden TAX-RLS-A migration file already exists.');
  assert(!existsSync(hiddenSpecialtyTaxonomyMigrationPath), 'Hidden TAX-SPECIALTY-MODEL-A migration file already exists.');
  assert(!existsSync(hiddenAdminAuditEventsMigrationPath), 'Hidden ADM-GOV-A migration file already exists.');

  renameSync(taxRlsMigrationPath, hiddenTaxRlsMigrationPath);
  renameSync(specialtyTaxonomyMigrationPath, hiddenSpecialtyTaxonomyMigrationPath);
  renameSync(adminAuditEventsMigrationPath, hiddenAdminAuditEventsMigrationPath);

  try {
    execFileSync(process.execPath, [legacyRlsStaticTest], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    if (existsSync(hiddenAdminAuditEventsMigrationPath)) {
      renameSync(hiddenAdminAuditEventsMigrationPath, adminAuditEventsMigrationPath);
    }

    if (existsSync(hiddenSpecialtyTaxonomyMigrationPath)) {
      renameSync(hiddenSpecialtyTaxonomyMigrationPath, specialtyTaxonomyMigrationPath);
    }

    if (existsSync(hiddenTaxRlsMigrationPath)) {
      renameSync(hiddenTaxRlsMigrationPath, taxRlsMigrationPath);
    }
  }
}

validateTaxonomyRlsMigration();
validateSpecialtyAliasRlsMigration();
validateAdminAuditEventsRlsMigration();
runLegacyStaticRlsTestWithoutTaxRls();

console.log('ADM-GOV-A static RLS validation passed.');
