import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { comparePharmacyRollbackExactRecovery } from "./import-pharmacy-rollback-exact-recovery";
import { runPharmacyRealRollbackCanary } from "./import-pharmacy-real-rollback-canary";
import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";

const ORIGINAL_SNAPSHOT = {
  schemaVersion: "drkhaleej.import.pharmacyRollbackSnapshot.v1",
  canonicalRoute: "/en/om/pharmacies/pharmacy-1",
  center: {
    id: "pharmacy-1",
    centerType: "pharmacy",
    status: "draft",
    isActive: false,
    isFeatured: false,
    metadata: {
      visibility: "private",
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  },
  relations: [],
};

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
    exactRecovery: comparePharmacyRollbackExactRecovery({
      expected: ORIGINAL_SNAPSHOT,
      actual: ORIGINAL_SNAPSHOT,
    }),
    entity: {
      id: "pharmacy-1",
      centerType: "pharmacy",
      status: "draft",
      isActive: false,
      isFeatured: false,
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
      expectedOriginalSnapshot: ORIGINAL_SNAPSHOT,
      executor,
      readbackClient: client,
    });

    expect(result.verified).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.rawReferenceExposed).toBe(false);
    expect(result.readback?.exactRecovery.verified).toBe(true);
    expect(executor).toHaveBeenCalledWith({
      operation: "rollback",
      actorId: "actor-1",
      entityId: "pharmacy-1",
      confirmation: "ROLLBACK PRIVATE PUBLISH pharmacy-1",
    });
    expect(client.read).toHaveBeenCalledWith({
      actorId: "actor-1",
      entityId: "pharmacy-1",
      expectedOriginalSnapshot: ORIGINAL_SNAPSHOT,
    });
    expect(JSON.stringify(executor.mock.calls)).not.toContain("rollback-authority-ready");
  });

  it("fails closed before rollback when publish canary is not verified", async () => {
    const executor = vi.fn();
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary({ verified: false }),
      expectedOriginalSnapshot: ORIGINAL_SNAPSHOT,
      executor,
      readbackClient: { read: vi.fn() },
    });

    expect(result.verified).toBe(false);
    expect(result.blockers).toContain("publish_canary_not_verified");
    expect(executor).not.toHaveBeenCalled();
  });

  it("rejects a missing original logical snapshot before rollback", async () => {
    const executor = vi.fn();
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshot: {},
      executor,
      readbackClient: { read: vi.fn() },
    });

    expect(result.blockers).toEqual(["expected_original_snapshot_missing"]);
    expect(executor).not.toHaveBeenCalled();
  });

  it("rejects an unbounded rollback result before readback", async () => {
    const read = vi.fn();
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshot: ORIGINAL_SNAPSHOT,
      executor: vi.fn().mockResolvedValue(completed("rollback-authority-ready")),
      readbackClient: { read },
    });
    expect(result.blockers).toEqual(["rollback_authority_result_invalid"]);
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects bounded exact-recovery mismatch and duplicate rollback", async () => {
    const actual = {
      ...ORIGINAL_SNAPSHOT,
      center: {
        ...ORIGINAL_SNAPSHOT.center,
        metadata: {
          ...ORIGINAL_SNAPSHOT.center.metadata,
          protected: { licenseNumber: "ACTUAL-SECRET" },
        },
      },
    };
    const expected = {
      ...ORIGINAL_SNAPSHOT,
      center: {
        ...ORIGINAL_SNAPSHOT.center,
        metadata: {
          ...ORIGINAL_SNAPSHOT.center.metadata,
          protected: { licenseNumber: "EXPECTED-SECRET" },
        },
      },
    };
    const mismatch = comparePharmacyRollbackExactRecovery({ expected, actual });
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshot: expected,
      executor: vi.fn().mockResolvedValue(completed("rollback-authority-replayed")),
      readbackClient: {
        read: vi.fn().mockResolvedValue({
          data: readback({
            duplicateRollbackCount: 1,
            referenceConsumed: false,
            exactRecovery: mismatch,
          }),
          error: null,
        }),
      },
    });

    expect(result.verified).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "duplicate_rollback_detected",
      "publish_reference_not_consumed",
      "exact_recovery_mismatch_detected",
    ]));
    expect(JSON.stringify(result)).not.toContain("EXPECTED-SECRET");
    expect(JSON.stringify(result)).not.toContain("ACTUAL-SECRET");
  });

  it("rejects malformed or value-bearing diagnostics", async () => {
    const report = comparePharmacyRollbackExactRecovery({
      expected: ORIGINAL_SNAPSHOT,
      actual: ORIGINAL_SNAPSHOT,
    });
    const result = await runPharmacyRealRollbackCanary({
      publishCanary: publishCanary(),
      expectedOriginalSnapshot: ORIGINAL_SNAPSHOT,
      executor: vi.fn().mockResolvedValue(completed()),
      readbackClient: {
        read: vi.fn().mockResolvedValue({
          data: readback({
            exactRecovery: {
              ...report,
              rawValuesExposed: true,
            },
          }),
          error: null,
        }),
      },
    });

    expect(result.blockers).toContain("exact_recovery_diagnostics_invalid");
  });
});
