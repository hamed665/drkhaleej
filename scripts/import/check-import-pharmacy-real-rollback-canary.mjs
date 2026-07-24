#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const source = readFileSync(
  path.join(repoRoot, "src/server/admin/import-pharmacy-real-rollback-canary.ts"),
  "utf8",
);

function requirePattern(pattern, message) {
  if (!pattern.test(source)) {
    console.error(`❌ IMPORT-PUBLISH-AG rollback canary: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/operation:\s*"rollback"/, "must execute rollback operation"],
  [/confirmation:\s*`ROLLBACK PRIVATE PUBLISH \$\{entityId\}`/, "must require exact entity-bound rollback confirmation"],
  [/publish_canary_not_verified/, "must require verified publish canary"],
  [/expected_original_snapshot_missing/, "must require the original logical snapshot"],
  [/hashPharmacyRollbackLogicalSnapshot/, "must bind exact recovery to the original snapshot hash"],
  [/rollback_authority_result_invalid/, "must reject unbounded rollback authority results"],
  [/rollback-authority-consumed/, "must accept fresh bounded authority consumption"],
  [/rollback-authority-replayed/, "must accept bounded authority replay"],
  [/exactRecoveryDiagnosticsValid/, "must validate bounded exact-recovery diagnostics"],
  [/exact_recovery_mismatch_detected/, "must fail closed on exact logical mismatch"],
  [/exact_recovery_diagnostics_invalid/, "must reject malformed recovery diagnostics"],
  [/duplicate_rollback_detected/, "must reject duplicate rollback"],
  [/publish_reference_not_consumed/, "must require consumed durable reference"],
  [/rawReferenceExposed:\s*false/, "must state that raw rollback references are not exposed"],
  [/publicVisibility:\s*"private"/, "must remain private"],
  [/indexEligible:\s*false/, "must remain noindex"],
  [/sitemapEligible:\s*false/, "must remain excluded from sitemap"],
  [/routeEnabled:\s*false/, "must not enable a public route"],
]) requirePattern(pattern, message);

for (const [pattern, message] of [
  [/publishReference,\s*\n\s*\}/, "must not send a publish reference to rollback execution"],
  [/read\(\{\s*actorId,\s*entityId,\s*publishReference\s*\}\)/, "must not send a raw reference to rollback readback"],
  [/confirmation:\s*"ROLLBACK PRIVATE PHARMACY"/, "must not use the legacy unbound rollback confirmation"],
  [/expectedValue|actualValue|rawExpected|rawActual/, "must not expose raw exact-recovery values"],
  [/\bfetch\s*\(/, "must not call public HTTP endpoints"],
  [/\.from\s*\(/, "must not write/read tables directly in the verifier"],
  [/\.rpc\s*\(/, "must not call RPCs directly in the verifier"],
]) {
  if (pattern.test(source)) {
    console.error(`❌ IMPORT-PUBLISH-AG rollback canary: ${message}`);
    process.exit(1);
  }
}

console.log("IMPORT-PUBLISH-AG Pharmacy real rollback canary check passed.");
