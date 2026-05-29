#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');

const REQUIRED_FILES = [
  '0031_rls_auth_helpers.sql',
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0034_center_access_helpers.sql',
  '0035_center_claims_memberships_rls.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0039_review_media_access_helpers.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0041_monetization_access_helpers.sql',
  '0042_monetization_sponsored_rls.sql',
  '0043_legal_consent_audit_access_helpers.sql',
  '0044_legal_consent_audit_rls.sql',
  '0046_callback_request_foundation.sql',
];

const APPROVED_POLICY_FILES = new Set([
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0035_center_claims_memberships_rls.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0042_monetization_sponsored_rls.sql',
  '0044_legal_consent_audit_rls.sql',
  '0046_callback_request_foundation.sql',
]);

const HELPER_FILES = new Set([
  '0031_rls_auth_helpers.sql',
  '0034_center_access_helpers.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0039_review_media_access_helpers.sql',
  '0041_monetization_access_helpers.sql',
  '0043_legal_consent_audit_access_helpers.sql',
]);

const REQUIRED_POLICY_NAMES = [
  'profiles_select_own',
  'profiles_select_platform_admin',
  'center_memberships_select_own',
  'center_memberships_select_platform_admin',
  'center_memberships_select_center_managers',
  'center_claims_select_own',
  'center_claims_select_platform_admin',
  'center_claims_select_center_managers',
  'patient_contacts_select_allowed',
  'appointments_select_allowed',
  'appointment_status_history_select_allowed',
  'appointment_cancellations_select_allowed',
  'reviews_select_private_allowed',
  'review_reports_select_allowed',
  'media_assets_select_private_allowed',
  'entity_media_select_private_allowed',
  'subscription_plans_select_public_active',
  'subscription_plans_select_platform_admin',
  'center_subscriptions_select_allowed',
  'sponsored_campaigns_select_allowed',
  'sponsored_placements_select_private_allowed',
  'sponsored_placements_select_public_active',
  'legal_documents_select_public_active',
  'legal_documents_select_platform_admin',
  'consent_logs_select_allowed',
  'audit_logs_select_platform_admin',
];

const SENSITIVE_TABLES_NO_ANON = new Set([
  'profiles',
  'center_memberships',
  'center_claims',
  'patient_contacts',
  'appointments',
  'appointment_status_history',
  'appointment_cancellations',
  'review_reports',
  'center_subscriptions',
  'consent_logs',
  'audit_logs',
  'callback_requests',
]);

const ALLOWED_ANON_POLICIES = new Set([
  'subscription_plans_select_public_active',
  'sponsored_placements_select_public_active',
  'legal_documents_select_public_active',
]);

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(cond, message) {
  if (!cond) fail(message);
}

assert(statSync(migrationsDir).isDirectory(), `Missing migrations directory: ${migrationsDir}`);

const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of REQUIRED_FILES) {
  assert(migrationFiles.includes(file), `Required migration file missing: ${file}`);
}

const contentsByFile = new Map(
  migrationFiles.map((file) => [file, readFileSync(path.join(migrationsDir, file), 'utf8')]),
);

for (const [file, contents] of contentsByFile) {
  if (/\bcreate\s+policy\b/i.test(contents)) {
    assert(APPROVED_POLICY_FILES.has(file), `CREATE POLICY found in non-approved file: ${file}`);
  }

  if (/\benable\s+row\s+level\s+security\b/i.test(contents)) {
    assert(APPROVED_POLICY_FILES.has(file), `ENABLE ROW LEVEL SECURITY found in non-approved file: ${file}`);
  }

  assert(!/\bdrop\b/i.test(contents), `DROP found in migration file: ${file}`);
  assert(!/\binsert\s+into\b/i.test(contents), `INSERT INTO found in migration file: ${file}`);
  assert(!/RLS test placeholder/i.test(contents), `Placeholder text found in migration file: ${file}`);
  assert(!/no policies allowed in Phase 2\.0/i.test(contents), `Phase 2.0 placeholder text found in migration file: ${file}`);
}

for (const file of HELPER_FILES) {
  const contents = contentsByFile.get(file);
  assert(contents, `Missing helper file content: ${file}`);
  assert(!/\bcreate\s+policy\b/i.test(contents), `Helper file contains CREATE POLICY: ${file}`);
  assert(!/\benable\s+row\s+level\s+security\b/i.test(contents), `Helper file contains ENABLE ROW LEVEL SECURITY: ${file}`);
}

const policyStatements = [];
const policyRegex = /create\s+policy\s+"?([a-zA-Z0-9_]+)"?\s+on\s+(?:public\.)?"?([a-zA-Z0-9_]+)"?[\s\S]*?to\s+([^;]+);/gi;
for (const file of APPROVED_POLICY_FILES) {
  const content = contentsByFile.get(file) ?? '';
  assert(!/\bfor\s+(insert|update|delete)\b/i.test(content), `Non-SELECT policy action found in approved RLS file: ${file}`);

  let match;
  while ((match = policyRegex.exec(content)) !== null) {
    const [, policyName, tableName, toClauseRaw] = match;
    policyStatements.push({ file, policyName, tableName, toClauseRaw: toClauseRaw.toLowerCase() });
  }
}

for (const name of REQUIRED_POLICY_NAMES) {
  const exists = policyStatements.some((p) => p.policyName === name);
  assert(exists, `Missing required policy name: ${name}`);
}

const publicCatalogPolicyIn0032 = policyStatements.some(
  (p) => p.file === '0032_rls_public_catalog_read_policies.sql' && p.toClauseRaw.includes('anon'),
);
assert(publicCatalogPolicyIn0032, 'Expected public catalog TO anon policy not found in 0032 file');

for (const p of policyStatements) {
  if (p.toClauseRaw.includes('anon')) {
    const isAllowedByName = ALLOWED_ANON_POLICIES.has(p.policyName);
    const isAllowedPublicCatalog = p.file === '0032_rls_public_catalog_read_policies.sql';
    assert(
      isAllowedByName || isAllowedPublicCatalog,
      `Unexpected TO anon usage in policy ${p.policyName} (${p.file})`,
    );

    assert(
      !SENSITIVE_TABLES_NO_ANON.has(p.tableName),
      `Sensitive table policy grants TO anon: ${p.tableName} via ${p.policyName} (${p.file})`,
    );
  }
}


const callbackRequestFoundationContent = contentsByFile.get('0046_callback_request_foundation.sql') ?? '';
assert(
  /alter\s+table\s+public\.callback_requests\s+enable\s+row\s+level\s+security/i.test(callbackRequestFoundationContent),
  'callback_requests must have RLS enabled in 0046_callback_request_foundation.sql',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+select/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+select[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon SELECT',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+insert/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+insert[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon INSERT',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+update/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+update[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon UPDATE',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+delete/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+delete[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon DELETE',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+select/i.test(callbackRequestFoundationContent),
  'callback_requests must not have any public SELECT policy in this phase',
);

console.log('✅ RLS static harness checks passed for required Phase 3 policy/helper migration rules.');
