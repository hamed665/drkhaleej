import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const gatePath = "src/server/admin/import-pharmacy-admin-publish-review-gate.ts";
const gateTestPath = "src/server/admin/import-pharmacy-admin-publish-review-gate.test.ts";
const wiringPath = "src/server/admin/import-pharmacy-private-admin-real-wiring.ts";
const wiringTestPath = "src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts";
const loaderPath = "src/server/admin/import-pharmacy-verified-reservation-loader.ts";
const operationPath = "src/server/admin/import-pharmacy-private-admin-publish-operation.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [gate, gateTests, wiring, wiringTests, loader, operation, action, panel] = await Promise.all([
  readText(gatePath),
  readText(gateTestPath),
  readText(wiringPath),
  readText(wiringTestPath),
  readText(loaderPath),
  readText(operationPath),
  readText(actionPath),
  readText(panelPath),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "verifyPharmacyAdminPublishReview",
  'operation: "review"',
  "readLatestFresh",
  "review_snapshot_mismatch",
  "review_fingerprint_mismatch",
  "review_has_blockers",
  "review_public_boundary_invalid",
  'publicVisibility !== "private"',
  "isPharmacyAdminBoundedReadStateFresh",
]) assert(gate.includes(token), `${gatePath} must include ${token}`);

for (const token of [
  "verifyPublishReview",
  "expectedSnapshotHash: context.canaryInput.expectedSnapshotHash",
  "expectedEntityFingerprint: context.canaryInput.expectedEntityFingerprint",
  "if (!reviewApproved) return { ok: false, reference: null }",
  "loadVerifiedReservationEvidence",
  "runPharmacyVerifiedReservationHandoff",
]) assert(wiring.includes(token), `${wiringPath} must include ${token}`);

for (const token of [
  "readLatestReview",
  'review.operation !== "review"',
  "contextMatchesReview",
  "authorizationMatchesReview",
  "isPharmacyAdminBoundedReadStateFresh",
]) assert(loader.includes(token), `${loaderPath} must preserve exact Review binding with ${token}`);

for (const token of [
  "verifyPublishReview: async",
  "expectedSnapshotHash === loaded.review.snapshotHash",
  "expectedEntityFingerprint === loaded.review.entityFingerprint",
  "createPharmacyPrivateAdminRealPorts",
]) assert(operation.includes(token), `${operationPath} must preserve the Review gate with ${token}`);

for (const token of [
  "approves only one fresh matching reviewed state",
  "rejects missing or stale review state",
  "rejects snapshot, fingerprint, blocker, and identity mismatch",
]) assert(gateTests.includes(token), `${gateTestPath} must cover ${token}`);

for (const token of [
  "hands a pre-verified reservation to the injected executor exactly once",
  "fails closed before reading reservation evidence when persisted review is not approved",
  "keeps private publish disabled when the executor port is absent",
]) assert(wiringTests.includes(token), `${wiringTestPath} must cover ${token}`);

for (const token of [
  '"private_publish"',
  "runPharmacyPrivateAdminPublishOperation",
]) assert(action.includes(token), `${actionPath} must include P05 activation token ${token}`);

for (const forbidden of [
  'readOnlyEnabled: true,\n    operation: "private_publish"',
  'visibility: "public"',
  "indexEligible: true",
  "sitemapEligible: true",
  "routeEnabled: true",
]) {
  assert(!gate.includes(forbidden), `${gatePath} must not include ${forbidden}`);
  assert(!wiring.includes(forbidden), `${wiringPath} must not include ${forbidden}`);
  assert(!operation.includes(forbidden), `${operationPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
  assert(!panel.includes(forbidden), `${panelPath} must not include ${forbidden}`);
}

console.log("persisted Pharmacy private publish Review gate check passed.");
