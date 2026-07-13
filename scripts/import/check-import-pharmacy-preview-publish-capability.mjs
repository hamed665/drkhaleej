import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const resolverPath = "src/server/admin/import-pharmacy-preview-publish-capability.ts";
const resolverTestPath = "src/server/admin/import-pharmacy-preview-publish-capability.test.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [resolver, tests, action, panel] = await Promise.all([
  readText(resolverPath),
  readText(resolverTestPath),
  readText(actionPath),
  readText(panelPath),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "resolvePharmacyPreviewPublishCapability",
  'environment !== "preview"',
  "actor_not_allowlisted",
  "entity_not_allowlisted",
  "confirmation_mismatch",
  "review_required",
  "review_snapshot_mismatch",
  "review_fingerprint_mismatch",
  "review_has_blockers",
  "visible: uniqueBlockers.length === 0",
  "executable: false",
  'mode: uniqueBlockers.length === 0 ? "preview_only" : "locked"',
]) assert(resolver.includes(token), `${resolverPath} must include ${token}`);

for (const token of [
  "reveals a non-executable preview control only after exact confirmation and matching review",
  "fails closed outside Preview or without actor and entity allowlists",
  "requires the exact entity-bound confirmation phrase",
  "rejects missing, stale, mismatched, or blocked review state",
]) assert(tests.includes(token), `${resolverTestPath} must cover ${token}`);

for (const token of [
  'String(formData.get("publishConfirmation") ?? "")',
  "resolvePharmacyPreviewPublishCapability",
  "reviewState: readback",
  "expectedSnapshotHash: context.snapshotHash",
  "expectedEntityFingerprint: context.context.canaryInput.expectedEntityFingerprint",
]) assert(action.includes(token), `${actionPath} must include ${token}`);

for (const token of [
  'name="publishConfirmation"',
  "publishCapability?.visible === true",
  "Preview eligible · execution disabled",
  "no mutation execution",
]) assert(panel.includes(token), `${panelPath} must include ${token}`);

for (const forbidden of [
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "private_publish"]',
  'operation: "private_publish",\n    readOnlyEnabled: true',
  'type="submit"\n                        disabled\n                        aria-disabled="true"',
  "executionEnabled: true,\n    enabledOperations: [\"private_publish\"]",
  'visibility: "public"',
  "indexEligible: true",
  "sitemapEligible: true",
  "routeEnabled: true",
]) {
  assert(!resolver.includes(forbidden), `${resolverPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
  assert(!panel.includes(forbidden), `${panelPath} must not include ${forbidden}`);
}

console.log("import Pharmacy preview publish capability check passed.");
