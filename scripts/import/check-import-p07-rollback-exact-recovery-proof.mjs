#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  comparator: path.resolve('src/server/admin/import-pharmacy-rollback-exact-recovery.ts'),
  canary: path.resolve('src/server/admin/import-pharmacy-real-rollback-canary.ts'),
  proof: path.resolve('scripts/import/run-p07-rollback-exact-recovery-proof.mjs'),
  workflow: path.resolve('.github/workflows/preview-migration-sync.yml'),
  scope: path.resolve('docs/import/ROLLBACK_EXACT_RECOVERY.md'),
};

for (const [name, file] of Object.entries(files)) {
  if (!existsSync(file)) throw new Error(`P07 ${name} file is missing: ${file}`);
}

const comparator = readFileSync(files.comparator, 'utf8');
const canary = readFileSync(files.canary, 'utf8');
const proof = readFileSync(files.proof, 'utf8');
const workflow = readFileSync(files.workflow, 'utf8');
const scope = readFileSync(files.scope, 'utf8');

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}

function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

for (const [pattern, message] of [
  [/MAX_MISMATCH_DIAGNOSTICS\s*=\s*24/, 'P07 comparator must cap mismatch diagnostics.'],
  [/path:\s*path\.slice\(0,\s*180\)/, 'P07 comparator must bound field paths.'],
  [/expectedHash:\s*sha256\(expected\)/, 'P07 comparator must hash expected mismatch values.'],
  [/actualHash:\s*sha256\(actual\)/, 'P07 comparator must hash actual mismatch values.'],
  [/rawValuesExposed:\s*false/, 'P07 comparator must state raw values are not exposed.'],
  [/maskAllowedDifferences/, 'P07 comparator must mask allowlisted operational differences before aggregate hashing.'],
  [/diagnosticsTruncated/, 'P07 comparator must report bounded diagnostic truncation.'],
  [/function\s+canonicalize\(value:\s*unknown\):\s*unknown/, 'P07 comparator must canonicalize nested logical state.'],
]) requirePattern(comparator, pattern, message);

for (const [pattern, message] of [
  [/expectedOriginalSnapshot:\s*PharmacyRollbackLogicalSnapshot/, 'P07 canary must require the original logical snapshot server-side.'],
  [/hashPharmacyRollbackLogicalSnapshot/, 'P07 canary must bind readback to the expected logical snapshot hash.'],
  [/exactRecoveryDiagnosticsValid/, 'P07 canary must validate bounded exact-recovery diagnostics.'],
  [/exact_recovery_mismatch_detected/, 'P07 canary must fail closed on logical mismatch.'],
  [/exact_recovery_diagnostics_invalid/, 'P07 canary must reject malformed diagnostics.'],
  [/rawReferenceExposed:\s*false/, 'P07 canary must keep the raw rollback reference closed.'],
]) requirePattern(canary, pattern, message);

for (const [pattern, message] of [
  [/P07_PREVIEW_DATABASE_URL/, 'P07 hosted proof must require the isolated Preview database URL.'],
  [/P07_PRODUCTION_PROJECT_REF/, 'P07 hosted proof must reject Production identity.'],
  [/parsed\.port === '5432'/, 'P07 hosted proof must require Session pooler port 5432.'],
  [/import_rollback_pharmacy_private_by_authority/, 'P07 hosted proof must execute the existing atomic rollback authority.'],
  [/allowedDifferencePaths/, 'P07 hosted proof must define the exact operational difference allowlist.'],
  [/logical\.center\.metadata\.protected\.licenseNumber/, 'P07 hosted proof must exercise a protected nested mismatch path.'],
  [/mismatchDiagnosticPaths/, 'P07 evidence must emit only bounded mismatch paths.'],
  [/protectedValuesExposed:\s*false/, 'P07 evidence must state protected values were not exposed.'],
  [/relationSnapshotContract:\s*'empty_and_exact'/, 'P07 proof must explicitly bind the current empty relation snapshot contract.'],
  [/productionConnected:\s*false/, 'P07 evidence must state Production was not connected.'],
  [/rawIdentifiersExposed:\s*false/, 'P07 evidence must remain identifier-bounded.'],
]) requirePattern(proof, pattern, message);

for (const [pattern, message] of [
  [/run-p07-rollback-exact-recovery-proof\.mjs/, 'Preview Migration Sync must run the P07 exact recovery proof.'],
  [/P07_EVIDENCE_PATH/, 'Preview Migration Sync must define the P07 evidence path.'],
  [/p07-rollback-exact-recovery-/, 'Preview Migration Sync must upload a distinct exact-SHA P07 artifact.'],
  [/Run isolated P06 atomic rollback authority proof[\s\S]*Run isolated P07 exact rollback recovery proof/, 'P07 proof must run after the P06 authority regression.'],
]) requirePattern(workflow, pattern, message);

for (const [pattern, message] of [
  [/ROLLBACK-EXACT-RECOVERY/, 'P07 scope document must name the subphase.'],
  [/bounded\s+Pharmacy\s+entity\s+fields/i, 'P07 scope document must cover bounded entity fields.'],
  [/locale\s+and\s+country/i, 'P07 scope document must cover locale and country.'],
  [/canonical\s+slug\/path\s+identity/i, 'P07 scope document must cover canonical path identity.'],
  [/geo\s+and\s+projection\s+metadata/i, 'P07 scope document must cover geo and projection metadata.'],
  [/protected\s+metadata/i, 'P07 scope document must cover protected metadata.'],
  [/snapshot-governed\s+relation\s+state/i, 'P07 scope document must cover snapshot-governed relations.'],
  [/deletion\s+and\s+sort\s+state/i, 'P07 scope document must cover deletion and sort state.'],
  [/no\s+Production\s+connection/i, 'P07 scope document must keep Production disconnected.'],
]) requirePattern(scope, pattern, message);

for (const [source, pattern, message] of [
  [comparator, /expectedValue|actualValue|rawExpected|rawActual/, 'P07 comparator must not expose raw mismatch value fields.'],
  [canary, /publishReference\s*:\s*input\.publishReference/, 'P07 canary must not accept a raw rollback reference from input.'],
  [proof, /P07_PRODUCTION_DATABASE_URL/, 'P07 proof must not accept a Production database URL.'],
  [proof, /status\s*=\s*'active'/i, 'P07 proof must not activate a public Pharmacy.'],
  [proof, /is_active\s*=\s*true/i, 'P07 proof must not enable a Pharmacy.'],
  [proof, /is_featured\s*=\s*true/i, 'P07 proof must not feature a Pharmacy.'],
]) forbidPattern(source, pattern, message);

console.log('P07 rollback exact recovery contract passed.');
