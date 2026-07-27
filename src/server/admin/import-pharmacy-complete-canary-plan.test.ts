import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStage,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "./import-pharmacy-admin-state-machine";
import {
  isPharmacyCompleteCanaryFinished,
  resolvePharmacyCompleteCanaryPlan,
} from "./import-pharmacy-complete-canary-plan";

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

describe("one-click Pharmacy Preview canary plan", () => {
  it("walks the normal persisted lifecycle in order", () => {
    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: { dry_run: "available" },
    }))).toEqual({ operation: "dry_run", recovery: false });

    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: { dry_run: "complete", exact_review: "available" },
    }))).toEqual({ operation: "review", recovery: false });

    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: {
        dry_run: "complete",
        exact_review: "complete",
        authorization_ready: "complete",
        reservation: "available",
      },
      details: { authorization_ready: "Authorization is issued." },
    }))).toEqual({ operation: "reserve_private_publish", recovery: false });

    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: {
        reservation: "complete",
        reservation_verified: "complete",
        private_publish: "available",
      },
    }))).toEqual({ operation: "private_publish", recovery: false });

    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: {
        private_publish: "complete",
        publish_verified: "complete",
        rollback: "available",
      },
    }))).toEqual({ operation: "rollback", recovery: false });
  });

  it("uses the recovery authority when an old consumed Review still renders complete", () => {
    expect(resolvePharmacyCompleteCanaryPlan(snapshot({
      statuses: {
        dry_run: "complete",
        exact_review: "complete",
        authorization_ready: "complete",
        reservation: "expired",
        publish_verified: "blocked",
        exact_recovery_verified: "blocked",
      },
      details: { authorization_ready: "Authorization is consumed." },
    }))).toEqual({ operation: "review", recovery: true });
  });

  it("finishes only after exact recovery and bounded audit history are complete", () => {
    const completed = snapshot({
      statuses: {
        exact_recovery_verified: "complete",
        bounded_audit_history: "complete",
      },
    });
    expect(isPharmacyCompleteCanaryFinished(completed)).toBe(true);
    expect(resolvePharmacyCompleteCanaryPlan(completed)).toBeNull();
  });
});
