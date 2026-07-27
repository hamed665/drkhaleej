"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import {
  runExpiredReservationRecoveryActionState,
} from "./actions-expired-reservation-recovery";
import type {
  PharmacyPrivateAdminActionStateResult,
} from "./actions";
import {
  createPharmacyAdminStateMachineReaderFromEnvironment,
} from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import {
  resolvePharmacyExpiredReservationRecoveryOperation,
  type PharmacyExpiredReservationRecoveryOperation,
} from "@/server/admin/import-pharmacy-expired-reservation-recovery-gate";

const recoveryOperations = new Set<PharmacyExpiredReservationRecoveryOperation>([
  "dry_run",
  "review",
  "reserve_private_publish",
  "private_publish",
  "rollback",
]);

function blockedResult(input: {
  blocker: string;
  operation: PharmacyExpiredReservationRecoveryOperation;
  stateMachine: PharmacyPrivateAdminActionStateResult["stateMachine"];
}): PharmacyPrivateAdminActionStateResult {
  return {
    ok: false,
    blockers: [input.blocker],
    workflow: null,
    readState: null,
    publishCapability: null,
    authorizationState: null,
    reservationState: null,
    stateMachine: input.stateMachine,
    receipt: {
      operation: input.operation,
      outcome: "blocked",
      recordedAt: input.stateMachine?.generatedAt ?? new Date().toISOString(),
    },
  };
}

export async function runExpiredReservationRecoverySafeActionState(
  previousState: PharmacyPrivateAdminActionStateResult,
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const operationValue = String(formData.get("operation") ?? "").trim();
  if (!recoveryOperations.has(operationValue as PharmacyExpiredReservationRecoveryOperation)) {
    return {
      ...previousState,
      ok: false,
      blockers: ["invalid_recovery_operation"],
      receipt: {
        operation: "refresh_state",
        outcome: "blocked",
        recordedAt: previousState.stateMachine?.generatedAt ?? new Date().toISOString(),
      },
    };
  }

  const operation = operationValue as PharmacyExpiredReservationRecoveryOperation;
  const admin = await requirePlatformAdmin();
  const entityId = String(formData.get("entityId") ?? "").trim();
  const stateReader = createPharmacyAdminStateMachineReaderFromEnvironment();
  const currentState = stateReader && entityId
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;
  if (!currentState) {
    return blockedResult({
      blocker: "state_readback_unavailable",
      operation,
      stateMachine: previousState.stateMachine,
    });
  }

  const currentOperation = resolvePharmacyExpiredReservationRecoveryOperation(currentState);
  if (currentOperation !== operation) {
    return blockedResult({
      blocker: "recovery_phase_changed",
      operation,
      stateMachine: currentState,
    });
  }

  // This is not a mutation retry. The operator clicked exactly once; the server
  // refreshes the stale form token and the delegated action performs its own
  // second readback before any write. A concurrent state change still fails closed.
  formData.set("stateRevision", currentState.revision);
  return runExpiredReservationRecoveryActionState(previousState, formData);
}
