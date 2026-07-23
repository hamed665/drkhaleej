import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { runPharmacyRealRollbackCanary } from "./import-pharmacy-real-rollback-canary";
import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";

const HASH = "a".repeat(64);

function publishCanary(overrides: Partial<PharmacyRealPreviewCanaryResult> = {}): PharmacyRealPreviewCanaryResult {
  return {
    verified: true,
    actorId: "actor-1",
    entityId: "pharmacy-1",
    publishReference: "rollback-authority-ready",
    readback: null,
    blockers: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
    ...overrides,
  };
}

function readback(overrides: Record<string, unknown> = {}) {
  return {
    rolledBackAuditCount: 1,
    rollbackReplayCount: 0,
    duplicateRollbackCount: 0,
    referenceCount: 1,
    referenceConsumed: true,
    entity: {
      id: "pharmacy-1",
      centerType: "pharmacy",
      status: "draft",
      isActive: false,
      isFeatured: false,
      logicalSnapshotHash: HASH,
    },
    ...overrides,
  };
}

function completed(reference = "rollback-authority-consumed") {
  return {
    operation: "rollback" as const,
    status: "completed" as const,
    entityId: "pharmacy-1",
    blockers: [],
    publicVisibility: "private" as const,
    indexEligible: false as const,
    sitemapEligible: false as const,
    routeEnabled: false as const,
    executionReference: reference,
  };
}

describe("runPharmacyRealRollbackCanary", () => {
  it("verifies one exact private rollback without sending a raw reference", async () => {
    const executor = vi.fn().mockResolvedValue(completed());
    const client = { read: vi.fn().mockResolvedValue({ data: readback(), error: null }) };

    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshotHash: HASH,
      executor,
      readbackClient: client,
    });

    expect(result.verified).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.rawReferenceExposed).toBe(false);
    expect(executor).toHaveBeenCalledWith({
      operation: "rollback",
      actorId: "actor-1",
      entityId: "pharmacy-1",
      confirmation: "ROLLBACK PRIVATE PUBLISH pharmacy-1",
    });
    expect(client.read).toHaveBeenCalledWith({ actorId: "actor-1", entityId: "pharmacy-1" });
    expect(JSON.stringify(executor.mock.calls)).not.toContain("rollback-authority-ready");
  });

  it("fails closed before rollback when publish canary is not verified", async () => {
    const executor = vi.fn();
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary({ verified: false }),
      expectedOriginalSnapshotHash: HASH,
      executor,
      readbackClient: { read: vi.fn() },
    });

    expect(result.verified).toBe(false);
    expect(result.blockers).toContain("publish_canary_not_verified");
    expect(executor).not.toHaveBeenCalled();
  });

  it("rejects an unbounded rollback result before readback", async () => {
    const read = vi.fn();
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshotHash: HASH,
      executor: vi.fn().mockResolvedValue(completed("rollback-authority-ready")),
      readbackClient: { read },
    });
    expect(result.blockers).toEqual(["rollback_authority_result_invalid"]);
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects snapshot mismatch and duplicate rollback", async () => {
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshotHash: HASH,
      executor: vi.fn().mockResolvedValue(completed("rollback-authority-replayed")),
      readbackClient: {
        read: vi.fn().mockResolvedValue({
          data: readback({
            duplicateRollbackCount: 1,
            referenceConsumed: false,
            entity: { ...readback().entity, logicalSnapshotHash: "b".repeat(64) },
          }),
          error: null,
        }),
      },
    });

    expect(result.verified).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "duplicate_rollback_detected",
      "publish_reference_not_consumed",
      "entity_snapshot_mismatch",
    ]));
  });
});
