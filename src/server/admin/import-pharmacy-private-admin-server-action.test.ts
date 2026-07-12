import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPharmacyPrivateAdminServerAction } from "./import-pharmacy-private-admin-server-action";

function form(values: Record<string, string | readonly string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) data.append(key, item);
    } else {
      data.append(key, value as string);
    }
  }
  return data;
}

function completed(operation: "dry_run" | "review" | "private_publish" | "rollback") {
  return {
    operation,
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

describe("pharmacy private Admin server action", () => {
  it("fails closed while the production action switch is disabled", async () => {
    const execute = vi.fn(async () => completed("dry_run"));
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: false,
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const result = await action({
      actorId: "admin-1",
      formData: form({ operation: "dry_run", entityId: "pharmacy-1" }),
    });

    expect(result).toEqual({ ok: false, blockers: ["action_disabled"] });
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects duplicate fields, non-allowlisted entities, and production mutation", async () => {
    const execute = vi.fn(async () => completed("private_publish"));
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      environment: "production",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const result = await action({
      actorId: "admin-1",
      formData: form({
        operation: ["private_publish", "rollback"],
        entityId: "pharmacy-2",
        confirmation: "PUBLISH PRIVATE PHARMACY",
      }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockers).toEqual(
        expect.arrayContaining(["invalid_operation", "entity_not_allowed"]),
      );
    }
    expect(execute).not.toHaveBeenCalled();
  });

  it("requires exact confirmation before one private publish", async () => {
    const execute = vi.fn(async () => completed("private_publish"));
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const blocked = await action({
      actorId: "admin-1",
      formData: form({ operation: "private_publish", entityId: "pharmacy-1", confirmation: "publish" }),
    });
    expect(blocked).toEqual({ ok: false, blockers: ["invalid_confirmation"] });

    const result = await action({
      actorId: "admin-1",
      formData: form({
        operation: "private_publish",
        entityId: "pharmacy-1",
        confirmation: "PUBLISH PRIVATE PHARMACY",
      }),
    });

    expect(result).toEqual({ ok: true, workflow: completed("private_publish") });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("requires an opaque publish reference before rollback", async () => {
    const execute = vi.fn(async () => completed("rollback"));
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const result = await action({
      actorId: "admin-1",
      formData: form({
        operation: "rollback",
        entityId: "pharmacy-1",
        confirmation: "ROLLBACK PRIVATE PHARMACY",
      }),
    });

    expect(result).toEqual({ ok: false, blockers: ["invalid_publish_reference"] });
    expect(execute).not.toHaveBeenCalled();
  });
});
