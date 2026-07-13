import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const boundaryPath = "src/server/admin/import-pharmacy-preview-publish-authorization-consume-boundary.ts";
const testPath = "src/server/admin/import-pharmacy-preview-publish-authorization-consume-boundary.test.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";
const wiringPath = "src/server/admin/import-pharmacy-private-admin-real-wiring.ts";

const [boundary, tests, action, panel, wiring] = await Promise.all([
  readFile(path.join(root, boundaryPath), "utf8"),
  readFile(path.join(root, testPath), "utf8"),
  readFile(path.join(root, actionPath), "utf8"),
  readFile(path.join(root, panelPath), "utf8"),
  readFile(path.join(root, wiringPath), "utf8"),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "consumePharmacyPreviewPublishAuthorization",
  'environment !== "preview"',
  "actor_not_allowlisted",
  "entity_not_allowlisted",
  "authorization_required",
  "authorization_store_unavailable",
  "authorization_invalid_or_consumed",
  ".verifyAndConsume({",
  "executionEnabled: false",
  "reservationAllowed: false",
  "mutationAllowed: false",
  'publicVisibility: "private"',
  "indexEligible: false",
  "sitemapEligible: false",
  "routeEnabled: false",
]) assert(boundary.includes(token), `${boundaryPath} must include ${token}`);

for (const token of [
  "consumes one exact authorization while keeping execution, reservation, and mutation disabled",
  "rejects replay after the first atomic consumption",
  "fails closed outside Preview and without exact actor or entity allowlists",
  "rejects missing authorization, missing store, and invalid bounded identity",
]) assert(tests.includes(token), `${testPath} must cover ${token}`);

for (const forbidden of [
  "consumePharmacyPreviewPublishAuthorization",
  "verifyAndConsume(",
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "private_publish"]',
]) assert(!action.includes(forbidden), `${actionPath} must not wire authorization consumption or publish execution: ${forbidden}`);

for (const forbidden of [
  "publishAuthorization",
  "authorization.token",
  "authorization.nonce",
  'name="authorizationToken"',
  'name="authorizationNonce"',
  "Preview publish now",
]) assert(!panel.includes(forbidden), `${panelPath} must not render or submit authorization material: ${forbidden}`);

for (const forbidden of [
  "consumePharmacyPreviewPublishAuthorization",
  "authorization_invalid_or_consumed",
]) assert(!wiring.includes(forbidden), `${wiringPath} must not invoke the new consume boundary before a later explicit wiring PR.`);

console.log("Pharmacy Preview publish authorization consume boundary check passed.");
