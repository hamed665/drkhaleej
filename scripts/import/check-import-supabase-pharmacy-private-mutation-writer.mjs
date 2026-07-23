#!/usr/bin/env node
import '../db/check-import-pharmacy-private-publish-rpc.mjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const writerPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-mutation-writer.ts');
const testPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-mutation-writer.test.ts');
const canonicalPatchPath = path.resolve('src/server/admin/import-pharmacy-canonical-mutation-patch.ts');
for (const requiredPath of [writerPath, testPath, canonicalPatchPath]) {
  if (!existsSync(requiredPath)) throw new Error(`required Pharmacy mutation file is missing: ${requiredPath}`);
}
const writerSource = readFileSync(writerPath, 'utf8');
const testSource = readFileSync(testPath, 'utf8');
const canonicalPatchSource = readFileSync(canonicalPatchPath, 'utf8');

const writerRequired = [
  /import\s+"server-only"/,
  /IMPORT_PHARMACY_EXECUTION_AUDIT_SCHEMA_VERSION/,
  /drkhaleej\.import\.publishAudit\.v3/,
  /import_publish_pharmacy_private/,
  /p_idempotency_record_id:\s*payload\.reservationId/,
  /p_rollback_snapshot_id:\s*payload\.rollbackSnapshotId/,
  /p_execution_started_audit_id:\s*payload\.auditEventId/,
  /verified reservation audit id/,
  /p_expected_version:\s*payload\.expectedVersion/,
  /p_patch:\s*buildPharmacyCanonicalMutationPatch\(payload\.draft\)/,
  /p_audit_schema_version:\s*IMPORT_PHARMACY_EXECUTION_AUDIT_SCHEMA_VERSION/,
  /async\s+rollbackOne\(\)\s*\{[\s\S]*return\s+false/,
];
for (const pattern of writerRequired) {
  if (!pattern.test(writerSource)) throw new Error(`Pharmacy writer missing required safety pattern: ${pattern}`);
}

for (const pattern of [
  /calls only the atomic Pharmacy RPC with the verified Reservation audit/,
  /p_execution_started_audit_id:\s*"reservation-audit-001"/,
  /metadata_patch:\s*expect\.objectContaining/,
  /does not claim rollback support before P06/,
]) {
  if (!pattern.test(testSource)) throw new Error(`Pharmacy writer tests missing P05 coverage: ${pattern}`);
}

const canonicalPrivateBoundary = [
  /visibility:\s*"private"/,
  /publicRouteEnabled:\s*false/,
  /indexable:\s*false/,
  /sitemapEligible:\s*false/,
];
for (const pattern of canonicalPrivateBoundary) {
  if (!pattern.test(canonicalPatchSource)) {
    throw new Error(`canonical Pharmacy patch missing required private boundary: ${pattern}`);
  }
}

const forbiddenWriterPatterns = [
  /p_reservation_audit_id/,
  /\.from\(/,
  /\.insert\(/,
  /\.update\(/,
  /\.delete\(/,
  /status:\s*['"]active['"]/,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
];
for (const pattern of forbiddenWriterPatterns) {
  if (pattern.test(writerSource)) throw new Error(`Pharmacy writer contains forbidden pattern: ${pattern}`);
}

const forbiddenCanonicalPatterns = [
  /visibility:\s*"public"/,
  /publicRouteEnabled:\s*true/,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
];
for (const pattern of forbiddenCanonicalPatterns) {
  if (pattern.test(canonicalPatchSource)) {
    throw new Error(`canonical Pharmacy patch contains forbidden public pattern: ${pattern}`);
  }
}

console.log('Supabase Pharmacy private mutation writer validation passed.');
