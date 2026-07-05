import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const bridgeSource = await readText('src/server/admin/import-first-batch-dry-run-bridge.ts');
const adapterSource = await readText('src/server/admin/import-batch-dry-run-payload-adapter.ts');
const reportSource = await readText('src/server/admin/import-batch-dry-run-report.ts');
const selectionSource = await readText('src/server/admin/import-first-batch-selection.ts');
const packageSource = await readText('package.json');

for (const token of [
  'buildFirstBatchDryRunReport',
  'BuildFirstBatchDryRunReportInput',
  'buildImportBatchDryRunReport',
  'buildImportBatchDryRunHospitalRelationSummary',
  'buildImportBatchDryRunLocalSuggestionSummary',
  'buildImportBatchDryRunPayloadExtraction',
  'ImportBatchDryRunTransformedCandidate',
  'transformedCandidates',
  'payloadExtraction',
  'validateFirstBatchSelection',
  'defaultChecks',
  'selectedCandidateIds',
  'uniqueStrings',
  'defaultCandidateHospitalKeys',
  'defaultLocalSuggestionCandidateKeys',
  'mergeLocalSuggestionCandidateKeys',
  'hospitalRelationRows',
  'candidateHospitalKeys',
  'localSuggestionRows',
  'localSuggestionCandidateKeys',
  'hospitalRelations',
  'localSuggestions',
  'mapSelectionIssueReason',
  'issueToBlocker',
  'buildFamilySummary',
  'defaultSitemapSummary',
  'firstBatchFamilies',
]) {
  mustContain(bridgeSource, token, 'first batch dry-run bridge');
}

for (const token of [
  'doctor: selectedCandidateIds(selection, "doctor")',
  'pharmacy: selectedCandidateIds(selection, "pharmacy")',
  'hospital: selectedCandidateIds(selection, "hospital")',
  'radiology: []',
  'dentistry: []',
  'beauty: []',
]) {
  mustContain(bridgeSource, token, 'first batch local suggestion candidate key map');
}

for (const token of [
  'ImportBatchDryRunTransformedCandidate',
  'ImportBatchDryRunPayloadExtraction',
  'candidatePayload: unknown',
  'buildImportBatchDryRunPayloadExtraction',
  'mergeCandidateKeys',
  'hospitalDoctorRows',
  'localSuggestionRows',
  'toHospitalRelationRow',
  'toLocalSuggestionRow',
  'relations',
  'doctors',
  'localSuggestions',
  'local_suggestions',
  'nearby',
  'branchVerified',
  'branch_verified',
  'publicVisible',
  'public_visible',
  'sourceUrl',
  'lastCheckedAt',
  'last_verified_date',
  'confidence',
  'doctorName',
  'doctor_name_en',
  'targetFamily',
  'target_key',
  'targetArea',
  'targetGovernorate',
  'diagnostic_imaging',
  'beauty_salon',
]) {
  mustContain(adapterSource, token, 'dry-run payload adapter');
}

for (const token of [
  'canonical_unsafe',
  'source_missing',
  'contact_or_map_missing',
  'geo_missing',
  'candidate_missing',
  'queue_not_index_eligible',
  'sitemap_cap_exceeded',
  'unexpected_route_class',
]) {
  mustContain(bridgeSource, token, 'first batch dry-run blocker mapping');
}

for (const token of [
  'buildImportBatchDryRunReport',
  'buildImportBatchDryRunHospitalRelationSummary',
  'buildImportBatchDryRunLocalSuggestionSummary',
  'importBatchDryRunRequiredChecks',
  'firstImportBatchDryRunCaps',
  'ImportBatchDryRunHospitalRelationRow',
  'ImportBatchDryRunLocalSuggestionRow',
  'ImportBatchDryRunLocalSuggestionCandidateKeys',
]) {
  mustContain(reportSource, token, 'dry-run report contract');
}

for (const token of [
  'validateFirstBatchSelection',
  'firstBatchCaps',
  'firstBatchFamilies',
  'family_cap_exceeded',
]) {
  mustContain(selectionSource, token, 'first batch selection contract');
}

for (const token of [
  'import:first-batch-report-bridge:validate',
  'scripts/import/check-first-batch-dry-run-bridge.mjs',
  'pnpm import:first-batch-report-bridge:validate',
]) {
  mustContain(packageSource, token, 'package.json');
}

console.log('first batch dry-run bridge check passed.');
