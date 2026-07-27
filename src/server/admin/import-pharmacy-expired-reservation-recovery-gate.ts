import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "./import-pharmacy-admin-state-machine";

export type PharmacyExpiredReservationRecoveryOperation =
  | "dry_run"
  | "review"
  | "reserve_private_publish"
  | "private_publish"
  | "rollback";

function stageStatus(
  state: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
): PharmacyAdminStateMachineStageStatus | null {
  return state.stages.find((stage) => stage.id === stageId)?.status ?? null;
}

function stageDetail(
  state: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
): string | null {
  return state.stages.find((stage) => stage.id === stageId)?.detail ?? null;
}

export function resolvePharmacyExpiredReservationRecoveryOperation(
  state: PharmacyAdminStateMachineSnapshot,
): PharmacyExpiredReservationRecoveryOperation | null {
  if (stageStatus(state, "exact_recovery_verified") === "complete") return null;
  if (stageStatus(state, "rollback") === "available") return "rollback";
  if (stageStatus(state, "private_publish") === "available") return "private_publish";

  const expiredBeforeMutation =
    stageStatus(state, "reservation") === "expired" &&
    stageStatus(state, "publish_verified") === "blocked" &&
    stageStatus(state, "exact_recovery_verified") === "blocked";
  if (!expiredBeforeMutation) return null;

  const authorizationIssued =
    stageStatus(state, "authorization_ready") === "complete" &&
    stageDetail(state, "authorization_ready") === "Authorization is issued.";
  if (
    stageStatus(state, "exact_review") === "complete" &&
    authorizationIssued
  ) return "reserve_private_publish";

  // A fresh dry-run is the persisted boundary for issuing a new recovery Review.
  // The previous Review may still render as complete while its authorization is
  // consumed, so authorization state, not the old Review badge, decides whether
  // the next operation is Review or Reservation.
  if (stageStatus(state, "dry_run") === "complete") return "review";

  return "dry_run";
}
