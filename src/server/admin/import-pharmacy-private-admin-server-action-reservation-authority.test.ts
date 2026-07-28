import { afterEach, describe, expect, it, vi } from "vitest";

const publishMocks = vi.hoisted(() => ({
  createDependencies: vi.fn(),
  runOperation: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./import-pharmacy-private-admin-publish-operation", () => ({
  createPharmacyPrivateAdminPublishOperationDependenciesFromEnvironment: publishMocks.createDependencies,
  runPharmacyPrivateAdminPublishOperation: publishMocks.runOperation,
}));

import { createPharmacyPrivateAdminServerAction } from "./import-pharmacy-private-admin-server-action";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("P09 UI persisted Reservation authority", () => {
  it("routes private publish directly to the verified Reservation operation in Vercel Preview", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("IMPORT_PREVIEW_ALLOWED_ACTOR_IDS", "admin-1");
    publishMocks.createDependencies.mockReturnValue({});
    publishMocks.runOperation.mockResolvedValue({
      published: true,
      executionReference: "publish-reference-1",
      blocker: null,
      publicVisibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      rawIdentifiersExposed: false,
    });
    const execute = vi.fn();
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      enabledOperations: ["private_publish"],
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const result = await action({
      actorId: "admin-1",
      formData: form({
        operation: "private_publish",
        entityId: "pharmacy-1",
        confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
      }),
    });

    expect(result).toEqual({
      ok: true,
      workflow: {
        operation: "private_publish",
        status: "completed",
        entityId: "pharmacy-1",
        blockers: [],
        publicVisibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        executionReference: "publish-reference-1",
      },
    });
    expect(execute).not.toHaveBeenCalled();
    expect(publishMocks.createDependencies).toHaveBeenCalledWith({
      allowedActorIds: ["admin-1"],
      allowedEntityIds: ["pharmacy-1"],
    });
    expect(publishMocks.runOperation).toHaveBeenCalledWith(expect.objectContaining({
      environment: "preview",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
    }));
  });

  it("keeps the direct publish path disabled outside the actual Vercel Preview runtime", async () => {
    const execute = vi.fn(async () => ({
      operation: "private_publish" as const,
      status: "completed" as const,
      entityId: "pharmacy-1",
      blockers: [],
      publicVisibility: "private" as const,
      indexEligible: false as const,
      sitemapEligible: false as const,
      routeEnabled: false as const,
      executionReference: "test-reference",
    }));
    const action = createPharmacyPrivateAdminServerAction({
      executionEnabled: true,
      enabledOperations: ["private_publish"],
      environment: "preview",
      allowedEntityIds: ["pharmacy-1"],
      execute,
    });

    const result = await action({
      actorId: "admin-1",
      formData: form({
        operation: "private_publish",
        entityId: "pharmacy-1",
        confirmation: "EXECUTE PRIVATE PUBLISH pharmacy-1",
      }),
    });

    expect(result.ok).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(publishMocks.runOperation).not.toHaveBeenCalled();
  });
});
