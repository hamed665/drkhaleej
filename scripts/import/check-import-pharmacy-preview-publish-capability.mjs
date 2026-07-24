import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const resolverPath = "src/server/admin/import-pharmacy-preview-publish-capability.ts";
const resolverTestPath = "src/server/admin/import-pharmacy-preview-publish-capability.test.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";
const stateMachinePath = "src/server/admin/import-pharmacy-admin-state-machine.ts";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [resolver, tests, action, panel, stateMachine] = await Promise.all([
  readText(resolverPath),
  readText(resolverTestPath),
  readText(actionPath),
  readText(panelPath),
  readText(stateMachinePath),
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
  'if (operation === "private_publish")',
  "runPharmacyPrivateAdminPublishOperation",
  "submittedRevision !== beforeState.revision",
  "state_readback_unverified",
]) assert(action.includes(token), `${actionPath} must include ${token}`);

for (const token of [
  'confirmationName: "publishConfirmation"',
  'confirmationPrefix: "PRIVATE PUBLISH"',
  'confirmationName: "confirmation"',
  'confirmationPrefix: "EXECUTE PRIVATE PUBLISH"',
  'name={operation.confirmationName}',
  'name="stateRevision"',
  'operationAvailable',
  'Locked by server state',
  'Waiting for server readback',
  'No automatic mutation retry',
]) assert(panel.includes(token), `${panelPath} must include ${token}`);

for (const token of [
  '"authorization_ready"',
  '"private_publish"',
  '"publish_verified"',
  'automaticMutationRetryAllowed: false',
  'publicVisibility: "private"',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
  'bulkAllowed: false',
]) assert(stateMachine.includes(token), `${stateMachinePath} must include ${token}`);

for (const forbidden of [
  'operation: "private_publish",\n    readOnlyEnabled: true',
  'type="submit"\n                        disabled\n                        aria-disabled="true"',
  'visibility: "public"',
  "indexEligible: true",
  "sitemapEligible: true",
  "routeEnabled: true",
  "publicRouteEnabled: true",
]) {
  assert(!resolver.includes(forbidden), `${resolverPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
  assert(!panel.includes(forbidden), `${panelPath} must not include ${forbidden}`);
  assert(!stateMachine.includes(forbidden), `${stateMachinePath} must not include ${forbidden}`);
}

for (const forbidden of [/setTimeout\s*\(/, /setInterval\s*\(/]) {
  assert(!forbidden.test(action), `${actionPath} must not automatically retry publish`);
}

console.log("import Pharmacy preview publish capability check passed through P08 staged activation.");
