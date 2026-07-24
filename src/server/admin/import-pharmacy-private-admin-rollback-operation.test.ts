import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { runPharmacyPrivateAdminRollbackOperation } from "./import-pharmacy-private-admin-rollback-operation";

const base = {
  environment: "preview",
  actorId: "actor-1",
  entityId: "pharmacy-1",
  allowedActorIds: ["actor-1"],
  allowedEntityIds: ["pharmacy-1"],
  confirmation: "ROLLBACK PRIVATE PUBLISH pharmacy-1",
};

describe("runPharmacyPrivateAdminRollbackOperation", () => {
  it("runs the existing server-selected rollback authority without a raw reference", async () => {
    const rollback = vi.fn().mockResolvedValue({
      kind: "rolled_back",
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    const result = await runPharmacyPrivateAdminRollbackOperation({
      ...base,
      dependencies: { rollback },
    });

    expect(result).toMatchObject({ rolledBack: true, replayed: false, blocker: null });
    expect(result.rawReferenceExposed).toBe(false);
    expect(rollback).toHaveBeenCalledWith({ actorId: "actor-1", entityId: "pharmacy-1" });
    expect(JSON.stringify(rollback.mock.calls)).not.toContain("token");
  });

  it("distinguishes bounded replay from a fresh rollback", async () => {
    const result = await runPharmacyPrivateAdminRollbackOperation({
      ...base,
      dependencies: {
        rollback: vi.fn().mockResolvedValue({
          kind: "replayed",
          authorityConsumed: true,
          rawReferenceExposed: false,
        }),
      },
    });
    expect(result.rolledBack).toBe(true);
    expect(result.replayed).toBe(true);
  });

  it("fails closed before invoking rollback outside Preview or on stale identity", async () => {
    const rollback = vi.fn();
    const result = await runPharmacyPrivateAdminRollbackOperation({
      ...base,
      environment: "production",
      dependencies: { rollback },
    });
    expect(result.blocker).toBe("rollback_boundary_blocked");
    expect(rollback).not.toHaveBeenCalled();
  });

  it("does not report success for a conflict", async () => {
    const result = await runPharmacyPrivateAdminRollbackOperation({
      ...base,
      dependencies: {
        rollback: vi.fn().mockResolvedValue({
          kind: "conflict",
          authorityConsumed: false,
          rawReferenceExposed: false,
        }),
      },
    });
    expect(result.rolledBack).toBe(false);
    expect(result.blocker).toBe("rollback_execution_failed");
  });
});
