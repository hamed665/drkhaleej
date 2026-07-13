import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const issuerPath = "src/server/admin/import-pharmacy-preview-publish-authorization-issue.ts";
const issuerTestPath = "src/server/admin/import-pharmacy-preview-publish-authorization-issue.test.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";
const storePath = "src/server/admin/import-pharmacy-publish-authorization-store.ts";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [issuer, tests, action, panel, store] = await Promise.all([
  readText(issuerPath),
  readText(issuerTestPath),
  readText(actionPath),
  readText(panelPath),
  readText(storePath),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "issuePharmacyPreviewPublishAuthorization",
  "authorization_store_unavailable",
  "authorization_issue_failed",
  "!input.capability.visible",
  "reviewSnapshotHash: input.reviewState.snapshotHash",
  "entityFingerprint: input.reviewState.entityFingerprint",
]) assert(issuer.includes(token), `${issuerPath} must include ${token}`);

for (const token of [
  "issues one opaque authorization only after a visible non-executable capability",
  "does not issue when capability is locked",
  "locks capability when store is unavailable or persistence fails",
]) assert(tests.includes(token), `${issuerTestPath} must cover ${token}`);

for (const token of [
  "issuePharmacyPreviewPublishAuthorization",
  "createPharmacyPublishAuthorizationStoreFromEnvironment()",
  "publishCapability = issuance.capability",
  "authorizationReady: issuance.authorization !== null",
  "authorizationStatus: issuance.authorization ? \"ready\" : \"unavailable\"",
  "expiresAt: issuance.authorization?.expiresAt ?? null",
]) assert(action.includes(token), `${actionPath} must include ${token}`);

for (const forbidden of [
  "PharmacyPublishAuthorizationEnvelope",
  "publishAuthorization?:",
  "let publishAuthorization",
  "publishAuthorization = issuance.authorization",
  "publishAuthorization,",
  ".token",
  ".nonce",
  "authorization.token",
  "authorization.nonce",
]) assert(!action.includes(forbidden), `${actionPath} must not expose authorization material through the Server Action result: ${forbidden}`);

for (const token of [
  "createPharmacyPublishAuthorizationStoreFromEnvironment",
  'environment.VERCEL_ENV !== "preview"',
  "SUPABASE_SERVICE_ROLE_KEY",
]) assert(store.includes(token), `${storePath} must include ${token}`);

for (const forbidden of [
  "publishAuthorization",
  ".token",
  ".nonce",
  "authorization.token",
  "authorization.nonce",
  "Preview publish now",
  'name="operation" value="private_publish"',
  'name="publishToken"',
  'name="publishNonce"',
]) assert(!panel.includes(forbidden), `${panelPath} must not render or submit authorization material: ${forbidden}`);

for (const forbidden of [
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "private_publish"]',
  "verifyAndConsume(",
  'visibility: "public"',
  "indexEligible: true",
  "sitemapEligible: true",
  "routeEnabled: true",
]) assert(!action.includes(forbidden), `${actionPath} must not enable publish execution: ${forbidden}`);

console.log("Pharmacy Preview publish authorization issuance check passed.");
