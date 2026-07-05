import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const contractSource = await readText('src/server/admin/import-batch-dry-run-report.ts');
const docsSource = await readText('docs/import/DRKHALEEJ_IMPORT_BATCH_DRY_RUN_REPORT_V1.md');
const rehearsalSource = await readText('docs/import/DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1.md');
const transformContractSource = await readText('docs/import/hospital-doctor-relations-transform-contract.md');
const packageSource = await readText('package.json');

for (const token of [
  'drkhaleej.import.batchDryRun.v1',
  'ImportBatchDryRunReport',
  'ImportBatchDryRunCheckKey',
  'ImportBatchDryRunBlockerReason',
  'BuildImportBatchDryRunReportInput',
  'firstImportBatchDryRunCaps',
  'importBatchDryRunRequiredChecks',
  'createEmptyImportBatchDryRunReport',
  'decideImportBatchDryRunReport',
  'buildImportBatchDryRunReport',
  'familyWithinCaps',
  'familyHasNoBlockers',
]) {
  assertIncludes(contractSource, token, 'dry-run report contract');
}

for (const token of [
  'ImportBatchDryRunHospitalRelationBlockerReason',
  'ImportBatchDryRunHospitalRelationRow',
  'BuildImportBatchDryRunHospitalRelationSummaryInput',
  'ImportBatchDryRunHospitalRelationSummary',
  'emptyImportBatchDryRunHospitalRelationSummary',
  'buildImportBatchDryRunHospitalRelationSummary',
  'hospitalRelationBlockers',
  'hospitalRelationBlocker',
  'isSupportedHospitalRelationConfidence',
  'needsHospitalRelationReview',
  'candidateHospitalKeys: readonly string[];',
  'rows: readonly ImportBatchDryRunHospitalRelationRow[];',
  'hospitalRelations: ImportBatchDryRunHospitalRelationSummary;',
  'hospitalRelations?: ImportBatchDryRunHospitalRelationSummary;',
  'hasNoUnsafePublicHospitalRelations',
  'unsafePublicCount === 0',
  'hospitalRelations.unsafePublicBlockers.length === 0',
  'blockedFromPublicCount',
  'privateReviewCount',
  'hospitalSuggestionCount',
  'unsafePublicBlockers',
  'blockedFromPublicReasons',
  'branch_not_verified',
  'last_checked_missing',
  'confidence_unsupported',
  'hospital_mismatch',
  'ambiguous_review_required',
]) {
  assertIncludes(contractSource, token, 'hospital relation dry-run contract');
}

for (const token of [
  'ImportBatchDryRunLocalSuggestionFamily',
  'ImportBatchDryRunLocalSuggestionBlockerReason',
  'ImportBatchDryRunLocalSuggestionRow',
  'ImportBatchDryRunLocalSuggestionCandidateKeys',
  'BuildImportBatchDryRunLocalSuggestionSummaryInput',
  'ImportBatchDryRunLocalSuggestionSummary',
  'emptyImportBatchDryRunLocalSuggestionSummary',
  'buildImportBatchDryRunLocalSuggestionSummary',
  'localSuggestionBlockers',
  'localSuggestionBlocker',
  'isSupportedLocalSuggestionConfidence',
  'needsLocalSuggestionReview',
  'source_candidate_missing',
  'target_candidate_missing',
  'target_name_missing',
  'location_mismatch',
  'same_entity_self_link',
  'unsupported_family',
  'sourceEntitySuggestionCount',
  'locationClusterCount',
  'hasNoUnsafePublicLocalSuggestions',
  'localSuggestions: ImportBatchDryRunLocalSuggestionSummary;',
  'localSuggestions?: ImportBatchDryRunLocalSuggestionSummary;',
  'localSuggestions.unsafePublicCount === 0',
  'localSuggestions.unsafePublicBlockers.length === 0',
  'radiology',
  'dentistry',
  'beauty',
]) {
  assertIncludes(contractSource, token, 'local suggestion dry-run contract');
}

for (const token of [
  '# DrKhaleej Import Batch Dry-Run Report V1',
  'drkhaleej.import.batchDryRun.v1',
  '## Source of truth',
  '## Required top-level shape',
  '"hospitalRelations": {',
  '"unsafePublicCount": 0',
  '"unsafePublicBlockers": []',
  '"blockedFromPublicReasons": []',
  '## Hospital relation dry-run summary',
  'A blocked relation does not automatically fail the whole hospital import rehearsal. An unsafe public relation does.',
  '"localSuggestions": {',
  '"sourceEntitySuggestionCount": 0',
  '"locationClusterCount": 0',
  '## Location-aware cross-family suggestion dry-run summary',
  'hospital page in Al Khuwair can later suggest nearby hospitals, pharmacies, doctors, radiology, dentistry, and beauty providers',
  'A blocked local suggestion does not automatically fail the import rehearsal. An unsafe public local suggestion does.',
  '## Report decision rule',
]) {
  assertIncludes(docsSource, token, 'dry-run report docs');
}

for (const token of [
  'Doctor_Hospital_Relations',
  '`branch_verified`',
  '`source_url`',
  '`last_verified_date`',
  '`confidence`',
  '"publicVisible": true',
]) {
  assertIncludes(transformContractSource, token, 'hospital doctor relation transform contract');
}

for (const token of [
  '# DrKhaleej Import Batch Rehearsal V1',
  'Maximum: 50 doctors, 25 pharmacies, 10 hospitals.',
  'The audit must show zero blockers for the selected rows.',
]) {
  assertIncludes(rehearsalSource, token, 'batch rehearsal docs');
}

for (const token of [
  'import:batch-dry-run:validate',
  'scripts/import/check-import-batch-dry-run-report.mjs',
  'pnpm import:batch-dry-run:validate',
]) {
  assertIncludes(packageSource, token, 'package.json');
}

console.log('import batch dry-run report check passed.');
