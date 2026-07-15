#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const source = readFileSync(
  path.join(repoRoot, "src/server/admin/import-pharmacy-canary-integrity-report.ts"),
  "utf8",
);

function requirePattern(pattern, message) {
  if (!pattern.test(source)) {
    console.error(`❌ IMPORT-PUBLISH-AH integrity report: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/orphan_authorization_detected/, "must detect orphan authorizations"],
  [/orphan_reservation_detected/, "must detect orphan reservations"],
  [/orphan_snapshot_detected/, "must detect orphan snapshots"],
  [/authorization_reservation_mismatch_detected/, "must detect authorization/reservation mismatches"],
  [/audit_gap_detected/, "must detect audit gaps"],
  [/duplicate_reservation_detected/, "must detect duplicate reservations"],
  [/duplicate_execution_detected/, "must detect duplicate execution"],
  [/duplicate_rollback_detected/, "must detect duplicate rollback"],
  [/public_route_leak_detected/, "must detect public route leakage"],
  [/search_exposure_detected/, "must detect search exposure"],
  [/sitemap_exposure_detected/, "must detect sitemap exposure"],
  [/secret_leak_detected/, "must detect secret leakage"],
  [/entity_mutation_mismatch_detected/, "must detect unexpected entity mutation"],
  [/publishDurationMs/, "must report publish timing"],
  [/rollbackDurationMs/, "must report rollback timing"],
  [/publicVisibility:\s*"private"/, "must remain private"],
  [/indexEligible:\s*false/, "must remain noindex"],
  [/sitemapEligible:\s*false/, "must remain excluded from sitemap"],
  [/routeEnabled:\s*false/, "must not enable a public route"],
]) requirePattern(pattern, message);

for (const [pattern, message] of [
  [/\bfetch\s*\(/, "must not call public HTTP endpoints"],
  [/\.from\s*\(/, "must not access tables directly"],
  [/\.rpc\s*\(/, "must not call RPCs directly"],
  [/process\.env/, "must not read secrets directly"],
]) {
  if (pattern.test(source)) {
    console.error(`❌ IMPORT-PUBLISH-AH integrity report: ${message}`);
    process.exit(1);
  }
}

console.log("IMPORT-PUBLISH-AH Pharmacy canary integrity report check passed.");
