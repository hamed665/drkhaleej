import "server-only";

import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "./import-pharmacy-admin-state-machine";
import {
  resolvePharmacyExpiredReservationRecoveryOperation,
  type PharmacyExpiredReservationRecoveryOperation,
} from "./import-pharmacy-expired-reservation-recovery-gate";

export type PharmacyCompleteCanaryOperation = PharmacyExpiredReservationRecoveryOperation;

export type PharmacyCompleteCanaryPlan = Readonly<{
  operation: PharmacyCompleteCanaryOperation;
  recovery: boolean;
}>;

function stageStatus(
  state: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
): PharmacyAdminStateMachineStageStatus | null {
  return state.stages.find((stage) => stage.id === stageId)?.status ?? null;
}

export function isPharmacyCompleteCanaryFinished(
  state: PharmacyAdminStateMachineSnapshot,
): boolean {
  return stageStatus(state, "exact_recovery_verified") === "complete" &&
    stageStatus(state, "bounded_audit_history") === "complete";
}

export function resolvePharmacyCompleteCanaryPlan(
  state: PharmacyAdminStateMachineSnapshot,
): PharmacyCompleteCanaryPlan | null {
  if (isPharmacyCompleteCanaryFinished(state)) return null;

  const recoveryOperation = resolvePharmacyExpiredReservationRecoveryOperation(state);
  if (recoveryOperation) {
    return { operation: recoveryOperation, recovery: true };
  }

  if (stageStatus(state, "rollback") === "available") {
    return { operation: "rollback", recovery: false };
  }
  if (stageStatus(state, "private_publish") === "available") {
    return { operation: "private_publish", recovery: false };
  }
  if (stageStatus(state, "reservation") === "available") {
    return { operation: "reserve_private_publish", recovery: false };
  }

  const dryRunStatus = stageStatus(state, "dry_run");
  const reviewStatus = stageStatus(state, "exact_review");
  const authorizationStatus = stageStatus(state, "authorization_ready");

  if (
    dryRunStatus === "available" ||
    dryRunStatus === "expired" ||
    reviewStatus === "stale"
  ) {
    return { operation: "dry_run", recovery: false };
  }

  if (
    reviewStatus === "available" ||
    reviewStatus === "expired" ||
    authorizationStatus === "expired" ||
    authorizationStatus === "stale"
  ) {
    return { operation: "review", recovery: false };
  }

  return null;
}
