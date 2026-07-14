import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = "src/server/admin/import-pharmacy-publish-authorization-envelope.ts";
const testPath = "src/server/admin/import-pharmacy-publish-authorization-envelope.test.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";

const [source, tests, action, panel] = await Promise.all([
  readFile(path.join(root, sourcePath), "utf8"),
  readFile(path.join(root, testPath), "utf8"),
  readFile(path.join(root, actionPath), "utf8"),
  readFile(path.join(root, panelPath), "utf8"),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "randomBytes(32)",
  "randomBytes(24)",
  "tokenHash",
  "nonceHash",
  "reviewSnapshotHash",
  "entityFingerprint",
  "operationAttemptId",
  "requestHash",
  "patchHash",
  "resolveReviewStateId",
  "authorizationId: string",
  "expiresAt: string",
]) assert(source.includes(token), `${sourcePath} must include ${token}`);

for (const forbidden of ["token: string;", "nonce: string;"]) {
  const envelopeType = source.slice(
    source.indexOf("export type PharmacyPublishAuthorizationEnvelope ="),
    source.indexOf("function sha256"),
  );
  assert(!envelopeType.includes(forbidden), `${sourcePath} must not expose ${forbidden}`);
}

for (const token of [
  "returns only a server-owned handle while persisting the full bounded identity",
  "fails closed when the persisted Review cannot be resolved",
  "fails closed for malformed identity or persistence failure",
]) assert(tests.includes(token), `${testPath} must cover ${token}`);

for (const forbidden of [
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "private_publish"]',
  'readOnlyEnabled: true,\n    operation: "private_publish"',
  "verifyAndConsume(",
  "createPharmacyPublishAuthorizationEnvelopeService(",
  "authorization.token",
  "authorization.nonce",
]) {
  assert(!action.includes(forbidden), `${actionPath} must not enable or expose authorization consumption: ${forbidden}`);
  assert(!panel.includes(forbidden), `${panelPath} must not enable or expose authorization consumption: ${forbidden}`);
}

console.log("Pharmacy publish authorization envelope check passed.");
