#!/usr/bin/env node
import '../db/check-import-pharmacy-private-publish-rpc.mjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const writerPath = path.resolve('src/server/admin/import-supabase-pharmacy-private-mutation-writer.ts');
const canonicalPatchPath = path.resolve('src/server/admin/import-pharmacy-canonical-mutation-patch.ts');
for (const requiredPath of [writerPath, canonicalPatchPath]) {
  if (!existsSync(requiredPath)) throw new Error(`required Pharmacy mutation file is missing: ${requiredPath}`);
}
const writerSource = readFileSync(writerPath, 'utf8');
const canonicalPatchSource = readFileSync(canonicalPatchPath, 'utf8');

const writerRequired = [
  /import\s+"server-only"/,
  /import_publish_pharmacy_private/,
  /p_idempotency_record_id/,
  /p_rollback_snapshot_id/,
  /p_execution_started_audit_id/,
  /p_expected_version/,
  /p_patch:\s*buildPharmacyCanonicalMutationPatch\(payload\.draft\)/,
  /async\s+rollbackOne\(\)\s*\{[\s\S]*return\s+false/,
];
for (const pattern of writerRequired) {
  if (!pattern.test(writerSource)) throw new Error(`pharmacy writer missing required safety pattern: ${pattern}`);
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
  /\.from\(['"]centers['"]\)/,
  /\.update\(/,
  /status:\s*['"]active['"]/,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
];
for (const pattern of forbiddenWriterPatterns) {
  if (pattern.test(writerSource)) throw new Error(`pharmacy writer contains forbidden pattern: ${pattern}`);
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

console.log('Supabase pharmacy private mutation writer validation passed.');
