import { describe, expect, it, vi } from "vitest";

import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "./import-pharmacy-admin-state-machine";
import {
  isPharmacyCompleteCanaryOperationReadbackVerified,
  readPharmacyCompleteCanaryOperationReadback,
} from "./import-pharmacy-complete-canary-readback";

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
  revision: string;
  statuses?: Partial<Record<PharmacyAdminStateMachineStageId, PharmacyAdminStateMachineStageStatus>>;
}): PharmacyAdminStateMachineSnapshot {
  return {
    schemaVersion: "drkhaleej.import.pharmacyAdminStateMachine.v1",
    entityId: "00000000-0000-4000-8000-000000000001",
    generatedAt: "2026-07-28T00:00:00.000Z",
    revision: input.revision,
    currentStage: "private_publish",
    stages: stageIds.map((id) => ({
      id,
      label: id,
      status: input.statuses?.[id] ?? "blocked",
      detail: "",
    })),
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

describe("complete canary readback-only convergence", () => {
  it("waits for the persisted publish stage without re-running a write", async () => {
    const beforeRevision = "a".repeat(64);
    const stale = snapshot({ revision: beforeRevision, statuses: { private_publish: "available" } });
    const complete = snapshot({
      revision: "b".repeat(64),
      statuses: { private_publish: "complete", publish_verified: "complete", rollback: "available" },
    });
    const reader = vi
      .fn()
      .mockResolvedValueOnce(stale)
      .mockResolvedValueOnce(stale)
      .mockResolvedValueOnce(complete);
    const waitForNextRead = vi.fn().mockResolvedValue(undefined);

    const result = await readPharmacyCompleteCanaryOperationReadback({
      reader,
      actorId: "actor",
      entityId: complete.entityId,
      operation: "private_publish",
      beforeRevision,
      attempts: 4,
      delayMs: 1,
      waitForNextRead,
    });

    expect(result).toEqual(complete);
    expect(reader).toHaveBeenCalledTimes(3);
    expect(waitForNextRead).toHaveBeenCalledTimes(2);
  });

  it("remains fail-closed when the expected persisted stage never appears", async () => {
    const beforeRevision = "a".repeat(64);
    const reader = vi.fn().mockResolvedValue(
      snapshot({ revision: beforeRevision, statuses: { private_publish: "available" } }),
    );
    const waitForNextRead = vi.fn().mockResolvedValue(undefined);

    const result = await readPharmacyCompleteCanaryOperationReadback({
      reader,
      actorId: "actor",
      entityId: "00000000-0000-4000-8000-000000000001",
      operation: "private_publish",
      beforeRevision,
      attempts: 3,
      delayMs: 1,
      waitForNextRead,
    });

    expect(result).toBeNull();
    expect(reader).toHaveBeenCalledTimes(3);
    expect(waitForNextRead).toHaveBeenCalledTimes(2);
  });

  it("requires exact recovery for rollback completion", () => {
    const beforeRevision = "a".repeat(64);
    expect(isPharmacyCompleteCanaryOperationReadbackVerified({
      state: snapshot({
        revision: "b".repeat(64),
        statuses: { rollback: "complete", exact_recovery_verified: "blocked" },
      }),
      operation: "rollback",
      beforeRevision,
    })).toBe(false);

    expect(isPharmacyCompleteCanaryOperationReadbackVerified({
      state: snapshot({
        revision: "c".repeat(64),
        statuses: { rollback: "complete", exact_recovery_verified: "complete" },
      }),
      operation: "rollback",
      beforeRevision,
    })).toBe(true);
  });
});
