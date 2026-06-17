#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const legacyValidator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations.mjs');
const taxC1Migration = '0054_healthcare_verticals_center_categories.sql';
const taxC1MigrationPath = path.join(migrationsDir, taxC1Migration);
const hiddenTaxC1MigrationPath = path.join(
  migrationsDir,
  `.taxc1db-${taxC1Migration}.hidden`,
);

const expectedMigrations = [
  '0001_extensions.sql',
  '0002_enums.sql',
  '0003_profiles_auth.sql',
  '0004_geo.sql',
  '0005_taxonomy.sql',
  '0006_centers.sql',
  '0007_center_locations.sql',
  '0008_center_services.sql',
  '0009_center_ownership_claims.sql',
  '0010_doctors.sql',
  '0011_doctor_practice_locations.sql',
  '0012_doctor_services.sql',
  '0013_doctor_schedules.sql',
  '0014_doctor_schedule_exceptions.sql',
  '0015_appointment_slots.sql',
  '0016_patient_contacts.sql',
  '0017_appointments.sql',
  '0018_appointment_status_history.sql',
  '0019_appointment_cancellations.sql',
  '0020_reviews.sql',
  '0021_review_reports.sql',
  '0022_center_type_expansion.sql',
  '0023_media_assets.sql',
  '0024_entity_media.sql',
  '0025_subscription_plans.sql',
  '0026_center_subscriptions.sql',
  '0027_sponsored_campaigns.sql',
  '0028_legal_documents.sql',
  '0029_consent_logs.sql',
  '0030_audit_logs.sql',
  '0031_rls_auth_helpers.sql',
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0034_center_access_helpers.sql',
  '0035_center_claims_memberships_rls.sql',
  '0036_patient_contacts_profile_link.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0039_review_media_access_helpers.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0041_monetization_access_helpers.sql',
  '0042_monetization_sponsored_rls.sql',
  '0043_legal_consent_audit_access_helpers.sql',
  '0044_legal_consent_audit_rls.sql',
  '0045_contact_visibility_foundation.sql',
  '0046_callback_request_foundation.sql',
  '0047_provider_license_verification_foundation.sql',
  '0048_media_public_visibility_hardening.sql',
  '0049_media_public_rls_hardening.sql',
  '0050_provider_onboarding_leads.sql',
  '0051_landing_page_contents.sql',
  '0052_review_companion_tables.sql',
  '0053_provider_onboarding_lead_events.sql',
  taxC1Migration,
];

function fail(message) {
  console.error(`ERROR: TAX-C1-DB: ${message}`);
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

function readSqlMigrationFiles() {
  requireCondition(statSync(migrationsDir).isDirectory(), 'Missing migrations directory.');

  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

function validateMigrationInventory() {
  const actualMigrations = readSqlMigrationFiles();

  if (actualMigrations.join('|') !== expectedMigrations.join('|')) {
    const missing = expectedMigrations.filter((name) => !actualMigrations.includes(name));
    const unexpected = actualMigrations.filter((name) => !expectedMigrations.includes(name));

    if (missing.length > 0) console.error(`Missing required files: ${missing.join(', ')}`);
    if (unexpected.length > 0) console.error(`Unexpected SQL migration files: ${unexpected.join(', ')}`);

    fail('Migration inventory must be exactly 0001 through 0054 for TAX-C1-DB.');
  }
}

function validateTaxC1Migration() {
  requireCondition(existsSync(taxC1MigrationPath), `${taxC1Migration} is missing.`);

  const content = readFileSync(taxC1MigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0054 must not seed rows or use INSERT INTO.'],
    [/\bcreate\s+policy\b/i, '0054 must not create RLS policies.'],
    [/\benable\s+row\s+level\s+security\b/i, '0054 must not enable RLS.'],
    [/\bdrop\b/i, '0054 must not contain DROP statements.'],
    [/\bpostgis\b/i, '0054 must not use PostGIS.'],
    [/\bgeometry\b/i, '0054 must not use geometry.'],
    [/\bgeography\b/i, '0054 must not use geography.'],
    [/\bpayments?\b/i, '0054 must not include payment scope.'],
    [/\binvoices?\b/i, '0054 must not include invoice scope.'],
    [/\bbilling\b/i, '0054 must not include billing scope.'],
    [/\bprovider\s+dashboard\b/i, '0054 must not include provider dashboard scope.'],
    [/\bai\b/i, '0054 must not include AI scope.'],
    [/\bstorage\s+bucket\b/i, '0054 must not include storage scope.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  const requiredPatterns = [
    [/create\s+table\s+if\s+not\s+exists\s+public\.healthcare_verticals/i, '0054 must create public.healthcare_verticals.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.center_categories/i, '0054 must create public.center_categories.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.center_category_assignments/i, '0054 must create public.center_category_assignments.'],

    [/slug\s+text\s+not\s+null/i, '0054 must define slug text not null.'],
    [/name_en\s+text\s+not\s+null/i, '0054 must define name_en text not null.'],
    [/name_ar\s+text\s+not\s+null/i, '0054 must define name_ar text not null.'],
    [/metadata\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i, '0054 must default metadata to empty jsonb.'],
    [/deleted_at\s+timestamptz\s+null/i, '0054 must include soft-delete columns.'],

    [/is_medical\s+boolean\s+not\s+null\s+default\s+true/i, '0054 must include is_medical.'],
    [/requires_medical_disclaimer\s+boolean\s+not\s+null\s+default\s+false/i, '0054 must include requires_medical_disclaimer.'],
    [/is_human_health\s+boolean\s+not\s+null\s+default\s+true/i, '0054 must include is_human_health.'],
    [/is_veterinary\s+boolean\s+not\s+null\s+default\s+false/i, '0054 must include is_veterinary.'],
    [/is_food_related\s+boolean\s+not\s+null\s+default\s+false/i, '0054 must include is_food_related.'],
    [/schema_org_hint\s+text\s+null/i, '0054 must include schema_org_hint.'],
    [/public_directory_enabled\s+boolean\s+not\s+null\s+default\s+false/i, '0054 must include public_directory_enabled.'],
    [/public_profile_enabled\s+boolean\s+not\s+null\s+default\s+true/i, '0054 must include public_profile_enabled.'],

    [/vertical_id\s+uuid\s+not\s+null\s+references\s+public\.healthcare_verticals\s*\(\s*id\s*\)/i, '0054 must link categories/assignments to healthcare_verticals.'],
    [/parent_category_id\s+uuid\s+null\s+references\s+public\.center_categories\s*\(\s*id\s*\)/i, '0054 must support parent center categories.'],
    [/default_center_type\s+center_type\s+null/i, '0054 must keep default_center_type broad and nullable.'],
    [/center_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i, '0054 must link assignments to centers.'],
    [/category_id\s+uuid\s+not\s+null\s+references\s+public\.center_categories\s*\(\s*id\s*\)/i, '0054 must link assignments to categories.'],
    [/reviewed_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i, '0054 must link assignment review to profiles.'],

    [/healthcare_verticals_slug_active_unique_idx/i, '0054 must create healthcare vertical slug unique index.'],
    [/center_categories_vertical_slug_active_unique_idx/i, '0054 must create center category vertical/slug unique index.'],
    [/center_category_assignments_center_category_active_unique_idx/i, '0054 must create assignment center/category unique index.'],
    [/center_category_assignments_primary_idx/i, '0054 must create primary assignment index.'],
    [/center_category_assignments_public_idx/i, '0054 must create public assignment index.'],

    [/healthcare_verticals_veterinary_not_human_health_check/i, '0054 must guard veterinary verticals.'],
    [/healthcare_verticals_food_not_medical_check/i, '0054 must guard food-related verticals.'],
    [/center_category_assignments_review_status_check/i, '0054 must constrain assignment review_status.'],
    [/center_category_assignments_public_requires_approved_check/i, '0054 must prevent public non-approved assignments.'],

    [/create\s+trigger\s+set_healthcare_verticals_updated_at/i, '0054 must create healthcare_verticals updated_at trigger.'],
    [/create\s+trigger\s+set_center_categories_updated_at/i, '0054 must create center_categories updated_at trigger.'],
    [/create\s+trigger\s+set_center_category_assignments_updated_at/i, '0054 must create center_category_assignments updated_at trigger.'],
    [/execute\s+function\s+public\.set_updated_at\s*\(\s*\)/i, '0054 must use public.set_updated_at().'],
  ];

  for (const [pattern, message] of requiredPatterns) {
    requirePattern(content, pattern, message);
  }
}

function runLegacyValidatorWithoutTaxC1() {
  requireCondition(!existsSync(hiddenTaxC1MigrationPath), 'Hidden TAX-C1 migration file already exists.');

  renameSync(taxC1MigrationPath, hiddenTaxC1MigrationPath);

  try {
    execFileSync(process.execPath, [legacyValidator], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    if (existsSync(hiddenTaxC1MigrationPath)) {
      renameSync(hiddenTaxC1MigrationPath, taxC1MigrationPath);
    }
  }
}

validateMigrationInventory();
validateTaxC1Migration();
runLegacyValidatorWithoutTaxC1();

console.log('TAX-C1 migration validation passed.');
