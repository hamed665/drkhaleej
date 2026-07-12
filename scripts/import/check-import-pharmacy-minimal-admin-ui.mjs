#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const panel = readFileSync(
  path.join(repoRoot, "src/components/admin/import-pharmacy-private-admin-control-panel.tsx"),
  "utf8",
);
const page = readFileSync(
  path.join(repoRoot, "src/app/admin/imports/readiness/page.tsx"),
  "utf8",
);
const model = readFileSync(
  path.join(repoRoot, "src/server/admin/import-pharmacy-minimal-admin-ui-model.ts"),
  "utf8",
);

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) {
    console.error(`❌ IMPORT-ADMIN-E Pharmacy read-only UI: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/"use client"/, "must use client action state for authenticated submissions"],
  [/rounded-3xl/, "must follow the existing rounded Admin card language"],
  [/bg-sky-50\/70/, "must use the existing restrained tinted panel language"],
  [/runPharmacyPrivateAdminActionState/, "must call the guarded Server Action adapter"],
  [/name="operation" value={step\.operation}/, "must submit one explicit operation"],
  [/name="entityId" value={entityId \?\? ""}/, "must submit only the selected canary entity"],
  [/Generate dry-run/, "must show the dry-run stage"],
  [/Review exact diff/, "must show the review stage"],
  [/Private publish/, "must show the private publish stage"],
  [/Rollback/, "must show the rollback stage"],
  [/readOnlyEnabled: false/, "must keep mutation stages disabled"],
  [/Mutation controls remain locked/, "must state the mutation lock"],
  [/No bulk/, "must state the no-bulk boundary"],
  [/aria-labelledby/, "must include accessible section labelling"],
]) requirePattern(panel, pattern, message);

for (const [pattern, message] of [
  [/ImportPharmacyPrivateAdminControlPanel/, "must mount on the existing readiness page"],
  [/getPharmacyMinimalAdminUiModel/, "must consume the server-side UI model"],
  [/dry-run and review may execute/, "must describe the read-only capability truthfully"],
  [/Private publish, rollback.*remain locked/s, "must preserve the mutation boundary"],
]) requirePattern(page, pattern, message);

for (const [pattern, message] of [
  [/resolvePharmacyPreviewCanaryActivation/, "must derive state from the existing activation gate"],
  [/publicVisibility:\s*"private"/, "must preserve private visibility"],
  [/indexEligible:\s*false/, "must preserve noindex"],
  [/sitemapEligible:\s*false/, "must remain outside sitemap"],
  [/bulkAllowed:\s*false/, "must reject bulk"],
]) requirePattern(model, pattern, message);

for (const [source, pattern, message] of [
  [panel, /dangerouslySetInnerHTML/, "must not render unrestricted payload HTML"],
  [panel, /process\.env/, "panel must not read environment variables"],
  [panel, /PUBLISH PRIVATE PHARMACY|ROLLBACK PRIVATE PHARMACY/, "panel must not expose mutation confirmations yet"],
  [page, /process\.env/, "route must not interpret runtime environment directly"],
]) {
  if (pattern.test(source)) {
    console.error(`❌ IMPORT-ADMIN-E Pharmacy read-only UI: ${message}`);
    process.exit(1);
  }
}

console.log("IMPORT-ADMIN-E Pharmacy read-only Admin UI check passed.");
