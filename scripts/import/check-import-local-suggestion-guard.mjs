import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const guardPath = 'src/server/public/import-local-suggestion-guard.ts';
const doctorGuardPath = 'src/server/public/import-doctor-profile-guard.ts';
const pharmacyGuardPath = 'src/server/public/import-pharmacy-profile-guard.ts';
const hospitalGuardPath = 'src/server/public/import-hospital-profile-guard.ts';
const importedProfileRoutePath = 'src/components/public/import-profile/GuardedImportProfilePage.tsx';
const contractPath = 'docs/import/public-local-suggestion-guard-contract.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

const guardSource = await readText(guardPath);
const doctorGuardSource = await readText(doctorGuardPath);
const pharmacyGuardSource = await readText(pharmacyGuardPath);
const hospitalGuardSource = await readText(hospitalGuardPath);
const routeSource = await readText(importedProfileRoutePath);
const contractSource = await readText(contractPath);

for (const token of [
  'import "server-only";',
  'export type PublicImportLocalSuggestionFamily = "doctor" | "pharmacy" | "hospital" | "radiology" | "dentistry" | "beauty";',
  'export type PublicImportLocalSuggestion = {',
  'confidence: "high" | "medium";',
  'localSuggestionFamilyAliases',
  'physician: "doctor"',
  'diagnostic_imaging: "radiology"',
  'dental: "dentistry"',
  'beauty_center: "beauty"',
  'beauty_salon: "beauty"',
  'function localSuggestionRows(payload: JsonRecord): JsonRecord[]',
  'recordArray(relations, "localSuggestions")',
  'recordArray(relations, "local_suggestions")',
  'recordArray(relations, "nearby")',
  'recordArray(payload, "localSuggestions")',
  'recordArray(payload, "local_suggestions")',
  'recordArray(payload, "nearby")',
  'function approvedLocalSuggestion(input: {',
  'sourceFamily: PublicImportLocalSuggestionFamily;',
  'sourceSlug: string | null;',
  'locationKey(sourceArea) !== locationKey(targetArea)',
  'locationKey(sourceGovernorate) !== locationKey(targetGovernorate)',
  'publicVisible !== true',
  'relationStatus !== null && relationStatus !== "active" && relationStatus !== "approved"',
  'confidence !== "high" && confidence !== "medium"',
  '!hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'family === sourceFamily && sourceSlug !== null && slug === sourceSlug',
  'export function buildPublicImportLocalSuggestions(input: {',
  'limit?: number;',
  'const limit = input.limit ?? 12;',
  'const key = `${suggestion.family}:${suggestion.slug ?? suggestion.name.toLocaleLowerCase()}`;',
]) {
  assertIncludes(guardSource, token, guardPath);
}

for (const [label, source, sourceFamilyToken] of [
  [doctorGuardPath, doctorGuardSource, 'sourceFamily: "doctor"'],
  [pharmacyGuardPath, pharmacyGuardSource, 'sourceFamily: "pharmacy"'],
]) {
  for (const token of [
    'buildPublicImportLocalSuggestions',
    'type PublicImportLocalSuggestion',
    'localSuggestions: PublicImportLocalSuggestion[];',
    sourceFamilyToken,
    'limit: 12',
  ]) {
    assertIncludes(source, token, label);
  }
}

for (const token of [
  'export type PublicImportHospitalLocalSuggestionFamily',
  'export type PublicImportHospitalLocalSuggestion',
  'localSuggestions: PublicImportHospitalLocalSuggestion[];',
  'approvedLocalSuggestions(payload, geo, currentHospitalSlug(path))',
]) {
  assertIncludes(hospitalGuardSource, token, hospitalGuardPath);
}

for (const token of [
  'PublicImportLocalSuggestion',
  'PublicImportLocalSuggestionFamily',
  'localSuggestions?: PublicImportLocalSuggestion[];',
  'localSuggestions.length > 0',
  'publicLocalSuggestionHref',
  'suggestion.family === "doctor"',
  'suggestion.family === "pharmacy"',
  'suggestion.family === "hospital"',
]) {
  assertIncludes(routeSource, token, importedProfileRoutePath);
}

for (const token of [
  '# Public Local Suggestion Guard Contract',
  'doctor',
  'pharmacy',
  'hospital',
  'radiology',
  'dentistry',
  'beauty',
  'candidate_payload.relations.localSuggestions[]',
  'candidate_payload.relations.local_suggestions[]',
  'candidate_payload.relations.nearby[]',
  'publicVisible',
  'confidence is `high` or `medium`',
  'the row is not a self-link back to the same source profile',
  'Future radiology, dentistry, and beauty imported profile guards should use `buildPublicImportLocalSuggestions(...)` directly',
]) {
  assertIncludes(contractSource, token, contractPath);
}

console.log('public import local suggestion guard contract check passed.');
