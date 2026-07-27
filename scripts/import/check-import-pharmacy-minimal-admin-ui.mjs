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
const completePanel = readFileSync(
  path.join(repoRoot, "src/components/admin/import-pharmacy-complete-canary-panel.tsx"),
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
const actions = readFileSync(
  path.join(repoRoot, "src/app/admin/imports/readiness/actions.ts"),
  "utf8",
);
const completeAction = readFileSync(
  path.join(repoRoot, "src/app/admin/imports/readiness/actions-complete-canary.ts"),
  "utf8",
);
const completePlan = readFileSync(
  path.join(repoRoot, "src/server/admin/import-pharmacy-complete-canary-plan.ts"),
  "utf8",
);
const stateModel = readFileSync(
  path.join(repoRoot, "src/server/admin/import-pharmacy-admin-state-machine.ts"),
  "utf8",
);

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) {
    console.error(`❌ P08 Pharmacy Admin state machine: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/"use client"/, "must remain a client action-state panel"],
  [/useActionState/, "must use authenticated Server Action state"],
  [/initialStateMachine/, "must receive initial server readback"],
  [/name="operation" value="refresh_state"/, "must provide explicit readback-only refresh"],
  [/name="stateRevision"/, "must bind every form to a server revision"],
  [/Ten server-authoritative Pharmacy stages/, "must render the ten-stage model"],
  [/No automatic mutation retry/, "must state the no-auto-retry boundary"],
  [/EXECUTE PRIVATE PUBLISH/, "must require entity-bound private publish confirmation"],
  [/ROLLBACK PRIVATE PUBLISH/, "must require entity-bound rollback confirmation"],
  [/state_revision_mismatch/, "must explain multi-tab stale-form collisions"],
  [/Waiting for server readback/, "must avoid optimistic success"],
  [/Bounded audit history/, "must render bounded audit history"],
  [/Exact recovery readback/, "must render exact recovery evidence"],
  [/rounded-3xl/, "must follow the existing rounded Admin card language"],
  [/bg-sky-50\/70/, "must use the restrained tinted panel language"],
  [/aria-labelledby/, "must include accessible section labelling"],
]) requirePattern(panel, pattern, message);

for (const [pattern, message] of [
  [/"use client"/, "one-click panel must remain a client action-state surface"],
  [/useActionState/, "one-click panel must use an authenticated Server Action"],
  [/COMPLETE PRIVATE CANARY/, "one-click panel must require exact entity-bound full-cycle confirmation"],
  [/name="completeCanaryConfirmation"/, "one-click panel must submit the dedicated confirmation field"],
  [/readOnly/, "one-click confirmation must be server-selected and read-only"],
  [/Running persisted stages/, "one-click panel must display bounded pending state"],
  [/window\.location\.reload\(\)/, "one-click panel may reload only after verified completion"],
  [/Production, public routing, indexing, sitemap inclusion, bulk execution, and automatic retries remain disabled/, "one-click panel must state every closed boundary"],
  [/Full canary stopped safely/, "one-click panel must expose a bounded fail-closed error state"],
]) requirePattern(completePanel, pattern, message);

for (const [pattern, message] of [
  [/requirePlatformAdmin/, "page must bind initial state to the authenticated admin"],
  [/pharmacyUiModel\.actorId === admin\.id/, "page must keep controls locked for non-allowlisted admins"],
  [/createPharmacyAdminStateMachineReaderFromEnvironment/, "page must load initial state from server readback"],
  [/initialStateMachine=/, "page must pass bounded initial state to the client"],
  [/ImportPharmacyCompleteCanaryPanel/, "page must expose the bounded one-click literal canary"],
  [/never retried automatically/, "page must preserve no-auto-retry policy"],
  [/unattended execution, and bulk remain locked/, "page must keep unattended execution and promotion closed"],
]) requirePattern(page, pattern, message);

for (const [pattern, message] of [
  [/"rollback"/, "Server Action must enable the proven rollback operation"],
  [/createPharmacyAdminStateMachineReaderFromEnvironment/, "actions must refresh from persisted server state"],
  [/submittedRevision !== beforeState\.revision/, "actions must reject stale multi-tab submissions"],
  [/state_readback_unverified/, "actions must fail when post-operation readback is not proven"],
  [/operationValue === "refresh_state"/, "refresh must be readback-only"],
  [/runPharmacyPrivateAdminRollbackOperation/, "rollback UI must reuse the existing atomic authority"],
]) requirePattern(actions, pattern, message);

for (const [pattern, message] of [
  [/requirePlatformAdmin/, "one-click action must require the authenticated platform Admin"],
  [/MAX_ONE_CLICK_OPERATIONS = 5/, "one-click action must have a bounded operation limit"],
  [/COMPLETE PRIVATE CANARY/, "one-click action must enforce exact full-cycle confirmation"],
  [/allowedActorIds\.length !== 1/, "one-click action must require exactly one allowed actor"],
  [/allowedEntityIds\.length !== 1/, "one-click action must require exactly one allowed entity"],
  [/process\.env\.VERCEL_ENV !== "preview"/, "one-click action must remain Preview-only"],
  [/automaticMutationRetryAllowed !== false/, "one-click action must reject any state that permits automatic retries"],
  [/executedOperations\.has\(plan\.operation\)/, "one-click action must never execute an operation twice"],
  [/complete_canary_no_progress/, "one-click action must stop when the persisted state does not advance"],
  [/complete_canary_post_step_readback_unavailable/, "one-click action must stop when post-step readback is unavailable"],
  [/runExpiredReservationRecoverySafeActionState/, "one-click action must reuse the fail-closed recovery authority"],
  [/runPharmacyPrivateAdminActionState/, "one-click action must reuse the existing Admin operation authority"],
  [/RESERVE PRIVATE PUBLISH/, "one-click action must retain exact Reservation confirmation"],
  [/EXECUTE PRIVATE PUBLISH/, "one-click action must retain exact mutation confirmation"],
  [/ROLLBACK PRIVATE PUBLISH/, "one-click action must retain exact rollback confirmation"],
]) requirePattern(completeAction, pattern, message);

for (const [pattern, message] of [
  [/resolvePharmacyExpiredReservationRecoveryOperation/, "one-click planner must reuse the recovery phase authority"],
  [/expiredReservationRecoveryActive/, "one-click planner must scope recovery delegation to an expired Reservation"],
  [/stageStatus\(state, "rollback"\) === "available"/, "one-click planner must prefer persisted rollback availability"],
  [/stageStatus\(state, "private_publish"\) === "available"/, "one-click planner must prefer persisted mutation availability"],
  [/stageStatus\(state, "reservation"\) === "available"/, "one-click planner must require persisted Reservation availability"],
  [/operation: "dry_run"/, "one-click planner must support fresh dry-run"],
  [/operation: "review"/, "one-click planner must support exact Review"],
]) requirePattern(completePlan, pattern, message);

for (const [pattern, message] of [
  [/resolvePharmacyPreviewCanaryActivation/, "must derive activation from the existing Preview gate"],
  [/actorId:\s*string \| null/, "server UI model must retain the allowlisted actor binding"],
  [/publicVisibility:\s*"private"/, "must preserve private visibility"],
  [/indexEligible:\s*false/, "must preserve noindex"],
  [/sitemapEligible:\s*false/, "must remain outside sitemap"],
  [/bulkAllowed:\s*false/, "must reject bulk"],
]) requirePattern(model, pattern, message);

for (const [pattern, message] of [
  [/PHARMACY_ADMIN_STATE_MACHINE_STAGE_IDS/, "must define one canonical ordered stage list"],
  [/"dry_run"[\s\S]*"exact_review"[\s\S]*"authorization_ready"[\s\S]*"reservation"[\s\S]*"reservation_verified"[\s\S]*"private_publish"[\s\S]*"publish_verified"[\s\S]*"rollback"[\s\S]*"exact_recovery_verified"[\s\S]*"bounded_audit_history"/, "must preserve all ten ordered stages"],
  [/comparePharmacyRollbackExactRecovery/, "must reuse the proven P07 exact recovery comparator"],
  [/allowedDifferencePaths:\s*allowedRecoveryDifferences/, "must keep the exact recovery allowlist explicit"],
  [/slice\(-10\)/, "must cap bounded audit history"],
  [/revisionHash/, "must derive a server revision for stale-form rejection"],
  [/automaticMutationRetryAllowed:\s*false/, "must forbid automatic Reservation, mutation, and rollback retry"],
  [/rawIdentifiersExposed:\s*false/, "must state raw identifiers are not exposed"],
  [/publicVisibility:\s*"private"/, "must preserve private visibility"],
  [/indexEligible:\s*false/, "must preserve noindex"],
  [/sitemapEligible:\s*false/, "must preserve sitemap exclusion"],
  [/routeEnabled:\s*false/, "must preserve route exclusion"],
  [/bulkAllowed:\s*false/, "must preserve no-bulk boundary"],
]) requirePattern(stateModel, pattern, message);

for (const [source, pattern, message] of [
  [panel, /dangerouslySetInnerHTML/, "must not render unrestricted payload HTML"],
  [panel, /process\.env/, "panel must not read environment variables"],
  [panel, /publishReference|rollbackSnapshotId|reservationId/, "panel must not receive raw persistence identifiers"],
  [completePanel, /dangerouslySetInnerHTML/, "one-click panel must not render unrestricted payload HTML"],
  [completePanel, /process\.env/, "one-click panel must not read environment variables"],
  [completePanel, /publishReference|rollbackSnapshotId|reservationId/, "one-click panel must not receive raw persistence identifiers"],
  [page, /process\.env/, "route must not interpret runtime environment directly"],
  [actions, /setTimeout|setInterval/, "Server Action must not automatically retry writes"],
  [completeAction, /setTimeout|setInterval/, "one-click Server Action must not schedule or retry writes"],
  [completeAction, /while\s*\(/, "one-click Server Action must use a fixed bounded operation loop"],
  [stateModel, /rawExpected|rawActual|expectedValue|actualValue/, "state model must not expose raw mismatch values"],
]) {
  if (pattern.test(source)) {
    console.error(`❌ P08 Pharmacy Admin state machine: ${message}`);
    process.exit(1);
  }
}

console.log("P08 Pharmacy server-authoritative Admin UI check passed.");
