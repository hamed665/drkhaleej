#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  scope: "docs/import/REAL_ADMIN_CANARY_SCOPE.md",
  action: "src/app/admin/imports/readiness/actions.ts",
  page: "src/app/admin/imports/readiness/page.tsx",
  panel: "src/components/admin/import-pharmacy-private-admin-control-panel.tsx",
  runner: "scripts/import/run-p09-real-admin-canary.mjs",
  workflow: ".github/workflows/preview-migration-sync.yml",
};

const entries = await Promise.all(
  Object.entries(files).map(async ([name, file]) => [name, await readFile(file, "utf8")]),
);
const source = Object.fromEntries(entries);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "REAL-ADMIN-CANARY",
  "Execution Phase: Phase 9",
  "Lock Scope: Phase 11",
  "Product Module: Phase 18",
  "integrity-zero set",
  "no Production connection",
  "no automatic retry",
]) {
  assert(source.scope.toLowerCase().includes(token.toLowerCase()), `P09 scope is missing ${token}.`);
}

for (const token of [
  "requirePlatformAdmin",
  '"dry_run"',
  '"review"',
  '"reserve_private_publish"',
  '"private_publish"',
  '"rollback"',
  'operationValue === "refresh_state"',
  "state_revision_mismatch",
  "expectedReadbackStage",
  "createPharmacyAdminStateMachineReaderFromEnvironment",
  "runPharmacyPrivateAdminPublishOperation",
  "runPharmacyPrivateAdminRollbackOperation",
]) {
  assert(source.action.includes(token), `P09 Admin action path is missing ${token}.`);
}

for (const token of [
  "ImportPharmacyPrivateAdminControlPanel",
  "initialStateMachine",
  "createPharmacyAdminStateMachineReaderFromEnvironment",
]) {
  assert(source.page.includes(token), `P09 Admin page is missing ${token}.`);
}

for (const token of [
  "useActionState",
  "stateRevision",
  "pending",
  'operation: "dry_run"',
  'operation: "review"',
  'operation: "reserve_private_publish"',
  'operation: "private_publish"',
  'operation: "rollback"',
  'value="refresh_state"',
]) {
  assert(source.panel.includes(token), `P09 Admin panel is missing ${token}.`);
}

for (const token of [
  "run-p05-private-publish-proof.mjs",
  "import_rollback_pharmacy_private_by_authority",
  "P09_PREVIEW_DATABASE_URL",
  "P09_PRODUCTION_PROJECT_REF",
  "integrity-zero set is not zero",
  'browserSessionExecuted: false',
  'postP09Decision: "NO-GO_PENDING_LITERAL_UI_SESSION"',
  "secondReservationCreated: false",
  "cleanupVerified: true",
  "rawIdentifiersExposed: false",
  "protectedValuesExposed: false",
  "unrestrictedPayloadExposed: false",
]) {
  assert(source.runner.includes(token), `P09 hosted runner is missing ${token}.`);
}

for (const forbidden of [
  'productionConnected: true',
  'browserSessionExecuted: true',
  'postP09Decision: "GO"',
  'publicRouteEnabled: true',
  'indexable: true',
  'sitemapEligible: true',
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  assert(!source.runner.includes(forbidden), `P09 runner contains forbidden token ${forbidden}.`);
}

for (const token of [
  "PREVIEW_DATABASE_URL",
  "PREVIEW_PROJECT_REF",
  "PRODUCTION_PROJECT_REF",
  "drmuscat-isolated-preview-database-write",
  "P09_SOURCE_COMMIT",
  "run-p09-real-admin-canary.mjs",
  "check-import-p09-real-admin-canary.mjs",
  "p09-real-admin-canary-${{ github.event.pull_request.head.sha || github.sha }}",
  "github.event.pull_request.head.sha",
]) {
  assert(source.workflow.includes(token), `Serialized Preview workflow is missing ${token}.`);
}

console.log("P09 real Admin canary contract passed.");
