import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-batch-dry-run-report.ts';
const docsPath = 'docs/import/DRKHALEEJ_IMPORT_BATCH_DRY_RUN_REPORT_V1.md';
const rehearsalPath = 'docs/import/DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

const contractSource = await readText(contractPath);
const docsSource = await readText(docsPath);
const rehearsalSource = await readText(rehearsalPath);
const packageSource = await readText('package.json');
const auditSource = await readText('src/server/admin/import-publish-readiness-audit.ts');
const sitemapSource = await readText('src/server/public/import-sitemap.ts');
const smokeSource = await readText('scripts/import/check-public-import-profile-smoke.mjs');

for (const token of [
  'export type ImportBatchDryRunFamily = "doctor" | "pharmacy" | "hospital";',
  'export type ImportBatchDryRunDecision = "go" | "no_go";',
  'export type ImportBatchDryRunCheckKey =',
  'export type ImportBatchDryRunBlockerReason =',
  'export type ImportBatchDryRunReportSchemaVersion = "drkhaleej.import.batchDryRun.v1";',
  'export type ImportBatchDryRunReport = {',
  'schemaVersion: ImportBatchDryRunReportSchemaVersion;',
  'decision: ImportBatchDryRunDecision;',
  'caps: ImportBatchDryRunCaps;',
  'byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>;',
  'export const importBatchDryRunSchemaVersion',
  'export const firstImportBatchDryRunCaps = {',
  'doctor: 50,',
  'pharmacy: 25,',
  'hospital: 10,',
  'export const importBatchDryRunRequiredChecks',
  'export function createEmptyImportBatchDryRunReport',
  'decision: "no_go"',
]) {
  assertIncludes(contractSource, token, `${contractPath} must include ${token}`);
}

for (const token of [
  'ci_green',
  'seo_check_green',
  'readiness_audit_zero_blockers',
  'sitemap_diff_frozen',
  'representative_profile_smoke_passed',
  'blocked_route_classes_absent',
]) {
  assertIncludes(contractSource, token, `${contractPath} must include required check key ${token}`);
  assertIncludes(docsSource, token, `${docsPath} must document required check key ${token}`);
}

for (const token of [
  'canonical_unsafe',
  'source_missing',
  'contact_or_map_missing',
  'geo_missing',
  'candidate_missing',
  'candidate_not_approved',
  'candidate_type_mismatch',
  'queue_not_index_eligible',
  'sitemap_not_included',
  'robots_not_index',
  'sitemap_cap_exceeded',
  'unexpected_route_class',
  'representative_smoke_failed',
]) {
  assertIncludes(contractSource, token, `${contractPath} must include blocker reason ${token}`);
  assertIncludes(docsSource, token, `${docsPath} must document blocker reason ${token}`);
}

for (const token of [
  '# DrKhaleej Import Batch Dry-Run Report V1',
  'drkhaleej.import.batchDryRun.v1',
  '## Source of truth',
  '## Required top-level shape',
  '## Blocker reasons',
  '## Report decision rule',
  '"decision": "no_go"',
  '"doctor": 50',
  '"pharmacy": 25',
  '"hospital": 10',
]) {
  assertIncludes(docsSource, token, `${docsPath} must include ${token}`);
}

for (const token of [
  'DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1',
  'Maximum: 50 doctors, 25 pharmacies, 10 hospitals.',
  'The audit must show zero blockers for the selected rows.',
  'decision is `NO-GO`.',
]) {
  assertIncludes(rehearsalSource, token, `${rehearsalPath} must preserve ${token}`);
}

for (const token of [
  'getImportPublishReadinessAudit',
  'canonical_unsafe',
  'source_missing',
  'contact_or_map_missing',
  'geo_missing',
  'candidate_not_approved',
]) {
  assertIncludes(auditSource, token, `readiness audit must preserve ${token}`);
}

for (const token of [
  'doctor: 3000,',
  'pharmacy: 1500,',
  'hospital: 500,',
  'applyFamilyCaps(entries)',
]) {
  assertIncludes(sitemapSource, token, `import sitemap must preserve ${token}`);
}

for (const token of [
  'profileContracts',
  'doctor',
  'pharmacy',
  'hospital',
]) {
  assertIncludes(smokeSource, token, `profile smoke check must preserve ${token}`);
}

for (const packageToken of [
  'import:batch-dry-run:validate',
  'scripts/import/check-import-batch-dry-run-report.mjs',
  'pnpm import:batch-dry-run:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}`);
}

console.log('import batch dry-run report check passed.');
