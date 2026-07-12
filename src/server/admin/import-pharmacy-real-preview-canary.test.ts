import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let runPharmacyRealPreviewCanary: typeof import("./import-pharmacy-real-preview-canary").runPharmacyRealPreviewCanary;

beforeAll(async () => {
  ({ runPharmacyRealPreviewCanary } = await import("./import-pharmacy-real-preview-canary"));
});

const activation = {
  enabled: true as const,
  actorId: "actor-1",
  entityId: "pharmacy-1",
  approvalToken: "token",
  blockers: [] as const,
};

const successfulReadback = {
  reservationCount: 1,
  rollbackSnapshotCount: 1,
  executionStartedAuditCount: 1,
  terminalSuccessAuditCount: 1,
  publishReferenceCount: 1,
  duplicateExecutionCount: 0,
  entity: {
    id: "pharmacy-1",
    centerType: "pharmacy",
    status: "draft",
    isActive: false,
    isFeatured: false,
  },
};

function completed(reference = "opaque-reference") {
  return {
    operation: "private_publish" as const,
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

describe("runPharmacyRealPreviewCanary", () => {
  it("verifies exactly one persistence chain and a private Pharmacy entity", async () => {
    const executor = vi.fn(async () => completed());
    const read = vi.fn(async () => ({ data: successfulReadback, error: null }));

    const result = await runPharmacyRealPreviewCanary({
      activation,
      executor,
      readbackClient: { read },
    });

    expect(result.verified).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.publicVisibility).toBe("private");
    expect(result.indexEligible).toBe(false);
    expect(result.sitemapEligible).toBe(false);
    expect(executor).toHaveBeenCalledWith({
      operation: "private_publish",
      actorId: "actor-1",
      entityId: "pharmacy-1",
      confirmation: "PUBLISH PRIVATE PHARMACY",
      publishReference: null,
    });
    expect(read).toHaveBeenCalledWith({ actorId: "actor-1", entityId: "pharmacy-1", publishReference: "opaque-reference" });
  });

  it("does not execute when activation is disabled", async () => {
    const executor = vi.fn();
    const read = vi.fn();
    const result = await runPharmacyRealPreviewCanary({
      activation: { enabled: false, actorId: null, entityId: null, approvalToken: null, blockers: ["activation_flag_disabled"] },
      executor,
      readbackClient: { read },
    });
    expect(result.blockers).toEqual(["activation_disabled"]);
    expect(executor).not.toHaveBeenCalled();
    expect(read).not.toHaveBeenCalled();
  });

  it("fails closed when execution does not complete", async () => {
    const executor = vi.fn(async () => ({ ...completed(null as unknown as string), status: "failed" as const, executionReference: null }));
    const read = vi.fn();
    const result = await runPharmacyRealPreviewCanary({ activation, executor, readbackClient: { read } });
    expect(result.blockers).toEqual(["publish_failed"]);
    expect(read).not.toHaveBeenCalled();
  });

  it("reports every persistence and entity mismatch", async () => {
    const badReadback = {
      ...successfulReadback,
      reservationCount: 2,
      rollbackSnapshotCount: 0,
      executionStartedAuditCount: 0,
      terminalSuccessAuditCount: 2,
      publishReferenceCount: 0,
      duplicateExecutionCount: 1,
      entity: { ...successfulReadback.entity, status: "active", isActive: true },
    };
    const result = await runPharmacyRealPreviewCanary({
      activation,
      executor: async () => completed(),
      readbackClient: { read: async () => ({ data: badReadback, error: null }) },
    });
    expect(result.verified).toBe(false);
    expect(result.blockers).toEqual([
      "reservation_count_invalid",
      "rollback_snapshot_count_invalid",
      "execution_started_audit_count_invalid",
      "terminal_success_audit_count_invalid",
      "publish_reference_count_invalid",
      "duplicate_execution_detected",
      "entity_state_invalid",
    ]);
  });
});
