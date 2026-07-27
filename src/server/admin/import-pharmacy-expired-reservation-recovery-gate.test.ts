import { describe, expect, it } from "vitest";

import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStage,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "./import-pharmacy-admin-state-machine";
import { resolvePharmacyExpiredReservationRecoveryOperation } from "./import-pharmacy-expired-reservation-recovery-gate";

const stageIds: PharmacyAdminStateMachineStageId[] = [
  "dry_run",
  "exact_review",
  "authorization_ready",
  "reservation",
  "reservation_verified",
  "private_publish",
  "publish_verified",
  "rollback",
  "exact_recovery_verified",
  "bounded_audit_history",
];

function snapshot(input: {
  statuses: Partial<Record<PharmacyAdminStateMachineStageId, PharmacyAdminStateMachineStageStatus>>;
  details?: Partial<Record<PharmacyAdminStateMachineStageId, string>>;
}): PharmacyAdminStateMachineSnapshot {
  const stages: PharmacyAdminStateMachineStage[] = stageIds.map((id) => ({
    id,
    label: id,
    status: input.statuses[id] ?? "blocked",
    detail: input.details?.[id] ?? "",
  }));
  return {
    schemaVersion: "drkhaleej.import.pharmacyAdminStateMachine.v1",
    entityId: "00000000-0000-4000-8000-000000000001",
    generatedAt: "2026-07-27T00:00:00.000Z",
    revision: "a".repeat(64),
    currentStage: "dry_run",
    stages,
    nextExpiryAt: null,
    stale: false,
    exactRecovery: null,
    auditHistory: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    bulkAllowed: false,
    automaticMutationRetryAllowed: false,
    rawIdentifiersExposed: false,
  };
}

const expiredBoundary = {
  reservation: "expired",
  publish_verified: "blocked",
  exact_recovery_verified: "blocked",
} as const;

describe("expired Reservation recovery phase gate", () => {
  it("requires a fresh dry-run first", () => {
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: {
        ...expiredBoundary,
        dry_run: "expired",
        exact_review: "expired",
        authorization_ready: "complete",
      },
      details: { authorization_ready: "Authorization is consumed." },
    }))).toBe("dry_run");
  });

  it("advances to review only after fresh dry-run readback", () => {
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: {
        ...expiredBoundary,
        dry_run: "complete",
        exact_review: "expired",
        authorization_ready: "complete",
      },
      details: { authorization_ready: "Authorization is consumed." },
    }))).toBe("review");
  });

  it("advances to a fresh Reservation only for a newly issued authorization", () => {
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: {
        ...expiredBoundary,
        dry_run: "complete",
        exact_review: "complete",
        authorization_ready: "complete",
      },
      details: { authorization_ready: "Authorization is issued." },
    }))).toBe("reserve_private_publish");
  });

  it("uses persisted availability for mutation and rollback", () => {
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: {
        private_publish: "available",
        exact_recovery_verified: "blocked",
      },
    }))).toBe("private_publish");
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: {
        rollback: "available",
        exact_recovery_verified: "blocked",
      },
    }))).toBe("rollback");
  });

  it("blocks when recovery is complete or no exact recovery phase is available", () => {
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: { exact_recovery_verified: "complete" },
    }))).toBeNull();
    expect(resolvePharmacyExpiredReservationRecoveryOperation(snapshot({
      statuses: { reservation: "complete", exact_recovery_verified: "blocked" },
    }))).toBeNull();
  });
});
