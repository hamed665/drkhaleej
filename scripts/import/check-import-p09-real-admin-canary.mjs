#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  scope: "docs/import/REAL_ADMIN_CANARY_SCOPE.md",
  decision: "docs/import/POST_P09_GO_NO_GO.md",
  proxy: "src/proxy.ts",
  adminLayout: "src/app/admin/layout.tsx",
  loginPage: "src/app/admin/login/page.tsx",
  loginForm: "src/components/admin/admin-login-form.tsx",
  action: "src/app/admin/imports/readiness/actions.ts",
  completeAction: "src/app/admin/imports/readiness/actions-complete-canary.ts",
  completePlan: "src/server/admin/import-pharmacy-complete-canary-plan.ts",
  completeReadback: "src/server/admin/import-pharmacy-complete-canary-readback.ts",
  completePanel: "src/components/admin/import-pharmacy-complete-canary-panel.tsx",
  recoveryAction: "src/app/admin/imports/readiness/actions-expired-reservation-recovery.ts",
  recoverySafeAction: "src/app/admin/imports/readiness/actions-expired-reservation-recovery-safe.ts",
  recoveryGate: "src/server/admin/import-pharmacy-expired-reservation-recovery-gate.ts",
  recoveryPanel: "src/components/admin/import-pharmacy-expired-reservation-recovery-panel.tsx",
  recoveryMigration: "supabase/migrations/0086_import_pharmacy_recovery_review_attempts.sql",
  readStateStore: "src/server/admin/import-pharmacy-admin-read-state-store.ts",
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
  "operator-initiated one-click full-cycle control",
  "no unattended, scheduled or background canary execution",
]) {
  assert(source.scope.toLowerCase().includes(token.toLowerCase()), `P09 scope is missing ${token}.`);
}

for (const token of [
  "NO-GO_PENDING_LITERAL_UI_SESSION",
  "browser session",
  "is_platform_admin=true",
  "exactly one allowed actor",
  "exactly one fixed Pharmacy entity",
  "one-click full-cycle control",
  "Production remained disconnected and unchanged",
]) {
  assert(source.decision.includes(token), `Post-P09 decision is missing ${token}.`);
}
assert(!/^```text\s*\nGO\s*\n```/m.test(source.decision), "Post-P09 decision must not record GO before literal UI proof.");

assert(
  source.proxy.includes("requestHeaders.set('x-drmuscat-request-path', request.nextUrl.pathname)"),
  "Proxy must forward the exact request path to server layouts.",
);
for (const token of [
  'requestHeaders.get("x-drmuscat-request-path")',
  'path === "/admin/login"',
  "return children",
  "requirePlatformAdmin",
]) {
  assert(source.adminLayout.includes(token), `Admin layout login routing is missing ${token}.`);
}

for (const token of [
  "Supabase Password Auth",
  "matching active",
  "platform-admin profile",
]) {
  assert(source.loginPage.includes(token), `Preview login page is missing ${token}.`);
}

for (const token of [
  "createBrowserClient",
  "signInWithPassword",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  'type="password"',
  'autoComplete="current-password"',
  'router.replace("/admin/imports/readiness")',
  "Sign in securely",
]) {
  assert(source.loginForm.includes(token), `Preview browser password login is missing ${token}.`);
}
for (const forbidden of ["signInWithOtp", "requestAdminLoginLink", "Send secure sign-in link"]) {
  assert(!source.loginForm.includes(forbidden), `P09 Preview login must not contain ${forbidden}.`);
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
  "runPharmacyCompleteCanaryActionState",
  "MAX_ONE_CLICK_OPERATIONS = 5",
  "COMPLETE PRIVATE CANARY",
  "requirePlatformAdmin",
  'process.env.VERCEL_ENV !== "preview"',
  "allowedActorIds.length !== 1",
  "allowedEntityIds.length !== 1",
  "automaticMutationRetryAllowed !== false",
  "executedOperations.has(plan.operation)",
  "complete_canary_no_progress",
  "complete_canary_post_step_readback_unverified",
  "completedWithDeferredStateReadback",
  "readPharmacyCompleteCanaryOperationReadback",
  "runExpiredReservationRecoverySafeActionState",
  "runPharmacyPrivateAdminActionState",
]) {
  assert(source.completeAction.includes(token), `P09 one-click action is missing ${token}.`);
}
for (const forbidden of [/while\s*\(/, /setTimeout|setInterval/]) {
  assert(!forbidden.test(source.completeAction), `P09 one-click action contains forbidden retry/scheduling pattern ${forbidden}.`);
}

for (const token of [
  "DEFAULT_READBACK_ATTEMPTS = 6",
  "MAX_READBACK_ATTEMPTS = 8",
  "setTimeout as wait",
  "await input.reader",
  "isPharmacyCompleteCanaryOperationReadbackVerified",
  'operation === "private_publish"',
  'return "publish_verified"',
  'return "exact_recovery_verified"',
]) {
  assert(source.completeReadback.includes(token), `P09 readback-only convergence is missing ${token}.`);
}
for (const forbidden of [
  "runPharmacyPrivateAdminActionState",
  "runPharmacyPrivateAdminPublishOperation",
  "runPharmacyPrivateAdminRollbackOperation",
  "runPharmacyAdminReservationOperation",
]) {
  assert(!source.completeReadback.includes(forbidden), `P09 readback convergence must not invoke write path ${forbidden}.`);
}

for (const token of [
  "resolvePharmacyCompleteCanaryPlan",
  "isPharmacyCompleteCanaryFinished",
  "expiredReservationRecoveryActive",
  "resolvePharmacyExpiredReservationRecoveryOperation",
  'stageStatus(state, "rollback") === "available"',
  'stageStatus(state, "private_publish") === "available"',
  'stageStatus(state, "reservation") === "available"',
]) {
  assert(source.completePlan.includes(token), `P09 one-click planner is missing ${token}.`);
}

for (const token of [
  "P09 · one-click literal canary",
  "Complete the full Preview cycle",
  "COMPLETE PRIVATE CANARY",
  'name="completeCanaryConfirmation"',
  "readOnly",
  "Full canary stopped safely",
  "Running persisted stages",
]) {
  assert(source.completePanel.includes(token), `P09 one-click panel is missing ${token}.`);
}
for (const forbidden of ["process.env", "dangerouslySetInnerHTML", "publishReference", "rollbackSnapshotId", "reservationId"]) {
  assert(!source.completePanel.includes(forbidden), `P09 one-click panel contains forbidden token ${forbidden}.`);
}

for (const token of [
  "runExpiredReservationRecoveryActionState",
  "readByOperationAttemptId",
  "recovery_review_persist_failed",
  "recovery_review_exact_readback_failed",
  "recovery_review_identity_mismatch",
  "isPharmacyAdminBoundedReadStateFresh",
]) {
  assert(source.recoveryAction.includes(token), `P09 recovery action is missing ${token}.`);
}
for (const token of [
  "runExpiredReservationRecoverySafeActionState",
  "resolvePharmacyExpiredReservationRecoveryOperation",
  'formData.set("stateRevision", currentState.revision)',
  "recovery_phase_changed",
  "runExpiredReservationRecoveryActionState(previousState, formData)",
]) {
  assert(source.recoverySafeAction.includes(token), `P09 safe recovery action is missing ${token}.`);
}
for (const token of [
  "resolvePharmacyExpiredReservationRecoveryOperation",
  'stageStatus(state, "rollback") === "available"',
  'stageStatus(state, "private_publish") === "available"',
  'stageStatus(state, "reservation") === "expired"',
  'stageDetail(state, "authorization_ready") === "Authorization is issued."',
  'stageStatus(state, "dry_run") === "complete"',
]) {
  assert(source.recoveryGate.includes(token), `P09 recovery phase gate is missing ${token}.`);
}
for (const token of [
  "Fail-closed recovery",
  "Expired Reservation before mutation",
  "runExpiredReservationRecoverySafeActionState",
  'key={`${definition.operation}:${stateMachine.revision}`}',
  "readOnly",
  "Waiting for persisted readback",
]) {
  assert(source.recoveryPanel.includes(token), `P09 recovery panel is missing ${token}.`);
}
for (const token of [
  "P09-B EXPIRED-RESERVATION-RECOVERY",
  "drop index if exists public.import_pharmacy_admin_read_states_identity_idx",
  "import_pharmacy_admin_read_states_legacy_identity_idx",
  "where operation_attempt_id is null",
]) {
  assert(source.recoveryMigration.includes(token), `P09 recovery migration is missing ${token}.`);
}
for (const token of [
  "readByOperationAttemptId",
  'eq("operation_attempt_id", input.operationAttemptId)',
]) {
  assert(source.readStateStore.includes(token), `P09 exact recovery read-state store is missing ${token}.`);
}

for (const token of [
  "ImportPharmacyCompleteCanaryPanel",
  "ImportPharmacyPrivateAdminControlPanel",
  "initialStateMachine",
  "createPharmacyAdminStateMachineReaderFromEnvironment",
  "unattended execution",
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
  "POST_P09_GO_NO_GO.md",
  "p09-real-admin-canary-${{ github.event.pull_request.head.sha || github.sha }}",
  "github.event.pull_request.head.sha",
]) {
  assert(source.workflow.includes(token), `Serialized Preview workflow is missing ${token}.`);
}

console.log("P09 real Admin canary contract passed.");
