import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const guardPath = 'src/server/public/import-hospital-profile-guard.ts';
const importSitemapPath = 'src/server/public/import-sitemap.ts';
const transformContractPath = 'docs/import/hospital-doctor-relations-transform-contract.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const guardSource = await readText(guardPath);
const importSitemapSource = await readText(importSitemapPath);
const transformContractSource = await readText(transformContractPath);
const packageSource = await readText('package.json');

for (const token of [
  'export type PublicImportHospitalProfile',
  'export async function getPublicImportHospitalProfile',
  'family: "hospitals"',
  'entityType: "hospital"',
  'hospitalSlug: string',
  'return `/${locale}/${country}/hospitals/${slug}`;',
  'row.target_entity_type !== "hospital"',
  '.eq("target_entity_type", "hospital")',
  '.eq("sitemap_policy", "included")',
  '.eq("index_policy", "index")',
  '.eq("publish_status", "index_eligible")',
  'candidate.entity_type !== "hospital"',
  'candidate.candidate_status !== "approved"',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
  'hasLocalGeo(geo)',
]) {
  assertIncludes(guardSource, token, `${guardPath} must include ${token}`);
}

for (const token of [
  'export type PublicImportHospitalRelatedDoctor',
  'doctors: PublicImportHospitalRelatedDoctor[];',
  'const relatedDoctorLimit = 24;',
  'function relatedDoctorRows(payload: JsonRecord): JsonRecord[]',
  'function approvedRelatedDoctor(row: JsonRecord): PublicImportHospitalRelatedDoctor | null',
  'const branchVerified = booleanValue(row, "branchVerified") ?? booleanValue(row, "branch_verified")',
  'const publicVisible = booleanValue(row, "publicVisible") ?? booleanValue(row, "public_visible")',
  'if (branchVerified !== true) return null;',
  'if (publicVisible !== true) return null;',
  'if (relationStatus !== null && relationStatus !== "active" && relationStatus !== "approved") return null;',
  'if (confidence !== null && confidence !== "high" && confidence !== "medium") return null;',
  'if (!hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)) return null;',
  'doctors: approvedRelatedDoctors(payload),',
]) {
  assertIncludes(guardSource, token, `${guardPath} must preserve guarded related-doctor token ${token}`);
}

for (const token of [
  'buildPublicImportLocalSuggestions',
  'type PublicImportLocalSuggestion',
  'localSuggestions: PublicImportLocalSuggestion[];',
  'sourceFamily: "hospital"',
  'sourceSlug: currentHospitalSlug(path)',
  'limit: 12',
  'localSuggestions: buildPublicImportLocalSuggestions({',
]) {
  assertIncludes(guardSource, token, `${guardPath} must use shared local-suggestion guard token ${token}`);
}

for (const forbiddenToken of [
  'export type PublicImportHospitalLocalSuggestionFamily',
  'export type PublicImportHospitalLocalSuggestion',
  'localSuggestionFamilyAliases',
  'function localSuggestionRows(payload: JsonRecord): JsonRecord[]',
  'function approvedLocalSuggestion(',
  'function approvedLocalSuggestions(',
  'localSuggestions: approvedLocalSuggestions(payload, geo, currentHospitalSlug(path)),',
]) {
  assertNotIncludes(guardSource, forbiddenToken, `${guardPath} must not keep duplicate local-suggestion token ${forbiddenToken}`);
}

for (const token of [
  'Doctor_Hospital_Relations',
  '`relation_key`',
  '`doctor_key`',
  '`hospital_key`',
  '`doctor_name_en`',
  '`branch_verified`',
  '`source_url`',
  '`last_verified_date`',
  '`confidence`',
  '"relations": {',
  '"doctors": []',
  '"branchVerified": true',
  '"publicVisible": true',
  '"relationStatus": "active"',
  '"sourceUrl": "https://example.com/doctors"',
  'A relation can be emitted with `publicVisible: true` only when all rules below pass:',
  '`confidence` is `high` or `medium`',
  'The transformer must set `publicVisible: false` or omit the row from public relation payloads when:',
  '`confidence` is `medium_low`, `low`, empty, or unknown',
  'The existing public hospital profile guard remains the final fail-closed runtime boundary for public doctor suggestions.',
]) {
  assertIncludes(transformContractSource, token, `${transformContractPath} must preserve transform contract token ${token}`);
}

for (const token of [
  'robots_policy',
  'canonical_path',
  'import_entity_candidate_id',
  'sourceUrl: string | null;',
  'lastCheckedAt: string | null;',
  'qualityScore: Math.max(0, Math.min(100',
]) {
  assertIncludes(guardSource, token, `${guardPath} must preserve public evidence token ${token}`);
}

for (const token of [
  String.raw`^\/(en|ar)\/om\/doctor\/`,
  String.raw`^\/(en|ar)\/om\/pharmacies\/`,
  String.raw`^\/(en|ar)\/om\/hospitals\/`,
  'target_entity_type',
]) {
  assertIncludes(importSitemapSource, token, `import sitemap must preserve reviewed sitemap token ${token}`);
}

for (const packageToken of [
  'import:hospital-profile-guard:validate',
  'scripts/import/check-import-hospital-profile-guard.mjs',
  'pnpm import:hospital-profile-guard:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import hospital profile guard check passed.');
