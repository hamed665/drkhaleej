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
    console.error(`❌ IMPORT-ADMIN-C Pharmacy minimal UI: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/rounded-3xl/, "must follow the existing rounded Admin card language"],
  [/bg-sky-50\/70/, "must use the existing restrained tinted panel language"],
  [/Generate dry-run/, "must show the dry-run stage"],
  [/Review exact diff/, "must show the review stage"],
  [/Private publish/, "must show the private publish stage"],
  [/Rollback/, "must show the rollback stage"],
  [/Audit timeline/, "must show the audit timeline boundary"],
  [/No bulk/, "must state the no-bulk boundary"],
  [/aria-labelledby/, "must include accessible section labelling"],
  [/disabled/, "must keep operation controls disabled"],
]) requirePattern(panel, pattern, message);

for (const [pattern, message] of [
  [/ImportPharmacyPrivateAdminControlPanel/, "must mount on the existing readiness page"],
  [/getPharmacyMinimalAdminUiModel/, "must consume the server-side UI model"],
  [/Controlled boundary/, "must replace the obsolete read-only boundary copy truthfully"],
]) requirePattern(page, pattern, message);

for (const [pattern, message] of [
  [/resolvePharmacyPreviewCanaryActivation/, "must derive state from the existing activation gate"],
  [/publicVisibility:\s*"private"/, "must preserve private visibility"],
  [/indexEligible:\s*false/, "must preserve noindex"],
  [/sitemapEligible:\s*false/, "must remain outside sitemap"],
  [/bulkAllowed:\s*false/, "must reject bulk"],
]) requirePattern(model, pattern, message);

for (const [source, pattern, message] of [
  [panel, /<form\b/, "must not submit a form before runtime connection"],
  [panel, /runPharmacyPrivateAdminAction/, "must not call the Server Action before runtime connection"],
  [panel, /dangerouslySetInnerHTML/, "must not render unrestricted payload HTML"],
  [panel, /process\.env/, "panel must not read environment variables"],
  [page, /process\.env/, "route must not interpret runtime environment directly"],
]) {
  if (pattern.test(source)) {
    console.error(`❌ IMPORT-ADMIN-C Pharmacy minimal UI: ${message}`);
    process.exit(1);
  }
}

console.log("IMPORT-ADMIN-C Pharmacy minimal Admin UI check passed.");
