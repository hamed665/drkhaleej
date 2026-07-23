import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPharmacyPrivateAdminRuntimeExecutor } from "./import-pharmacy-private-admin-runtime-executor";

function ports() {
  return {
    dryRun: vi.fn(async () => ({ ok: true, reference: "dry-run-1" })),
    review: vi.fn(async () => ({ ok: true, reference: "review-1" })),
    reservePrivatePublish: vi.fn(async () => ({ ok: true, reference: "reservation-1" })),
    privatePublish: vi.fn(async () => ({ ok: true, reference: "rollback-authority-ready" })),
    rollback: vi.fn(async () => ({ ok: true, reference: "rollback-authority-consumed" })),
    audit: vi.fn(async () => true),
  };
}

describe("pharmacy private Admin runtime executor", () => {
  it("executes the guarded workflow through supplied real ports", async () => {
    const runtimePorts = ports();
    const execute = createPharmacyPrivateAdminRuntimeExecutor({
      loadExecution: vi.fn(async () => ({
        ports: runtimePorts,
        controlState: { readinessPassed: true, reviewApproved: true, auditAvailable: true },
      })),
    });

    const result = await execute({
      operation: "private_publish",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
    });

    expect(result).toMatchObject({ status: "completed", entityId: "pharmacy-1", executionReference: "rollback-authority-ready" });
    expect(runtimePorts.privatePublish).toHaveBeenCalledOnce();
    expect(runtimePorts.audit).toHaveBeenCalledOnce();
  });

  it("fails closed when runtime loading is unavailable", async () => {
    const execute = createPharmacyPrivateAdminRuntimeExecutor({
      loadExecution: vi.fn(async () => null),
    });

    await expect(execute({
      operation: "dry_run",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      confirmation: null,
    })).resolves.toMatchObject({ status: "failed", executionReference: null });
  });

  it("keeps readiness and review enforcement inside the workflow", async () => {
    const runtimePorts = ports();
    const execute = createPharmacyPrivateAdminRuntimeExecutor({
      loadExecution: vi.fn(async () => ({
        ports: runtimePorts,
        controlState: { readinessPassed: false, reviewApproved: false, auditAvailable: true },
      })),
    });

    const result = await execute({
      operation: "private_publish",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
    });

    expect(result.status).toBe("blocked");
    expect(result.blockers).toEqual(expect.arrayContaining(["readiness_blocked", "review_required"]));
    expect(runtimePorts.privatePublish).not.toHaveBeenCalled();
  });
});
