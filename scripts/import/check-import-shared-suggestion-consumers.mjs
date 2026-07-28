import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

function assertNotIncludes(source, token, label) {
  assert(!source.includes(token), `${label} must not include ${token}`);
}

const sharedGuardPath = 'src/server/public/import-local-suggestion-guard.ts';
const sharedGuardSource = await readText(sharedGuardPath);

for (const token of [
  'export type PublicImportLocalSuggestionFamily = "doctor" | "pharmacy" | "hospital" | "radiology" | "dentistry" | "beauty";',
  'export type PublicImportLocalSuggestion = {',
  'function approvedLocalSuggestion(input: {',
  'publicVisible !== true',
  'confidence !== "high" && confidence !== "medium"',
  'family === sourceFamily && sourceSlug !== null && slug === sourceSlug',
  'export function buildPublicImportLocalSuggestions(input: {',
]) {
  assertIncludes(sharedGuardSource, token, sharedGuardPath);
}

for (const [consumerPath, familyToken] of [
  ['src/server/public/import-doctor-profile-guard.ts', 'sourceFamily: "doctor"'],
  ['src/server/public/import-hospital-profile-guard.ts', 'sourceFamily: "hospital"'],
]) {
  const source = await readText(consumerPath);
  for (const token of [
    'buildPublicImportLocalSuggestions',
    'type PublicImportLocalSuggestion',
    'localSuggestions: PublicImportLocalSuggestion[];',
    familyToken,
    'limit: 12',
  ]) {
    assertIncludes(source, token, consumerPath);
  }
}

const pharmacySource = await readText('src/server/public/import-pharmacy-profile-guard.ts');
for (const token of [
  'PublicImportLocalSuggestion',
  'localSuggestions: PublicImportLocalSuggestion[];',
  'localSuggestions: []',
]) {
  assertIncludes(pharmacySource, token, 'src/server/public/import-pharmacy-profile-guard.ts');
}
assertNotIncludes(
  pharmacySource,
  'buildPublicImportLocalSuggestions',
  'src/server/public/import-pharmacy-profile-guard.ts',
);

const hospitalSource = await readText('src/server/public/import-hospital-profile-guard.ts');
for (const token of [
  'export type PublicImportHospitalLocalSuggestionFamily',
  'export type PublicImportHospitalLocalSuggestion',
  'function approvedLocalSuggestion(',
  'function approvedLocalSuggestions(',
  'approvedLocalSuggestions(payload, geo, currentHospitalSlug(path))',
]) {
  assertNotIncludes(hospitalSource, token, 'src/server/public/import-hospital-profile-guard.ts');
}

const contractSource = await readText('docs/import/public-local-suggestion-guard-contract.md');
for (const token of [
  'Current imported profile guards using this shared runtime boundary:',
  'src/server/public/import-doctor-profile-guard.ts',
  'src/server/public/import-hospital-profile-guard.ts',
  'Pharmacy public/noindex profiles intentionally return an empty suggestion set',
]) {
  assertIncludes(contractSource, token, 'docs/import/public-local-suggestion-guard-contract.md');
}

console.log('import shared suggestion consumer check passed.');
