import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPharmacyPrivateAdminServerAction } from "./import-pharmacy-private-admin-server-action";

function completed() {
  return {
    operation: "private_publish" as const,
    status: "completed" as const,
    entityId: "pharmacy-1",
    blockers: [],
    publicVisibility: "private" as const,
    indexEligible: false as const,
    sitemapEligible: false as const,
    routeEnabled: false as const,
    executionReference: "reference-1",
  };
}

describe("Pharmacy private Admin confirmation normalization", () => {
  it("accepts Unicode spaces and line wrapping without weakening the exact phrase", async () => {
    const execute = vi.fn(async () => completed());
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      enabledOperations: ["private_publish"],
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });
    const formData = new FormData();
    formData.set("operation", "private_publish");
    formData.set("entityId", "pharmacy-1");
    formData.set("confirmation", "EXECUTE\u00a0PRIVATE\nPUBLISH\u202fpharmacy-1");

    const result = await action({ actorId: "admin-1", formData });

    expect(result).toEqual({ ok: true, workflow: completed() });
    expect(execute).toHaveBeenCalledWith({
      operation: "private_publish",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
    });
  });

  it("still rejects altered words or a different entity", async () => {
    const execute = vi.fn(async () => completed());
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      enabledOperations: ["private_publish"],
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });
    const formData = new FormData();
    formData.set("operation", "private_publish");
    formData.set("entityId", "pharmacy-1");
    formData.set("confirmation", "EXECUTE PRIVATE PUBLISH pharmacy-2");

    const result = await action({ actorId: "admin-1", formData });

    expect(result).toEqual({ ok: false, blockers: ["invalid_confirmation"] });
    expect(execute).not.toHaveBeenCalled();
  });
});
