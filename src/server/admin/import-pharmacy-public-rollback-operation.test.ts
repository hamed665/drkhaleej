import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import {
  runPharmacyPublicRollbackOperation,
  type PharmacyPublicRollbackRuntimePolicy,
} from "./import-pharmacy-public-rollback-operation";

const actorId = "11111111-1111-4111-8111-111111111111";
const entityId = "22222222-2222-4222-8222-222222222222";

function policy(
  overrides: Partial<PharmacyPublicRollbackRuntimePolicy> = {},
): PharmacyPublicRollbackRuntimePolicy {
  return {
    executionEnabled: true,
    environment: "preview",
    previewProjectRef: "preview-ref",
    productionProjectRef: "production-ref",
    supabaseUrl: "https://preview-ref.supabase.co",
    allowedActorIds: [actorId],
    allowedEntityIds: [entityId],
    ...overrides,
  };
}

function input(
  overrides: Partial<Parameters<typeof runPharmacyPublicRollbackOperation>[0]> =
    {},
) {
  return {
    actorId,
    entityId,
    confirmation: `ROLLBACK PHARMACY PUBLIC ${entityId}`,
    policy: policy(),
    dependencies: {
      rollback: vi.fn().mockResolvedValue({
        kind: "rolled_back",
        restoredQueuePresent: true,
        exactLogicalRecovery: true,
        authorityConsumed: true,
        rawReferenceExposed: false,
      }),
    },
    ...overrides,
  };
}

describe("Pharmacy public/noindex rollback operation", () => {
  it("returns an exact private rollback without exposing authority identity", async () => {
    const request = input();
    await expect(runPharmacyPublicRollbackOperation(request)).resolves.toEqual({
      rolledBack: true,
      replayed: false,
      blocker: null,
      visibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      exactLogicalRecovery: true,
      rawReferenceExposed: false,
    });
    expect(request.dependencies.rollback).toHaveBeenCalledWith({
      actorId,
      entityId,
    });
  });

  it("distinguishes persisted replay from a fresh rollback", async () => {
    const request = input({
      dependencies: {
        rollback: vi.fn().mockResolvedValue({
          kind: "replayed",
          restoredQueuePresent: false,
          exactLogicalRecovery: true,
          authorityConsumed: true,
          rawReferenceExposed: false,
        }),
      },
    });
    await expect(runPharmacyPublicRollbackOperation(request)).resolves.toMatchObject({
      rolledBack: true,
      replayed: true,
      blocker: null,
      exactLogicalRecovery: true,
    });
  });

  it.each([
    ["disabled runtime", policy({ executionEnabled: false })],
    ["non-preview environment", policy({ environment: "production" })],
    [
      "same Preview and Production identity",
      policy({ productionProjectRef: "preview-ref" }),
    ],
    [
      "Production URL",
      policy({ supabaseUrl: "https://production-ref.supabase.co" }),
    ],
    ["actor outside allowlist", policy({ allowedActorIds: [] })],
    ["entity outside allowlist", policy({ allowedEntityIds: [] })],
  ])("fails closed for %s", async (_label, blockedPolicy) => {
    const request = input({ policy: blockedPolicy });
    await expect(runPharmacyPublicRollbackOperation(request)).resolves.toMatchObject({
      rolledBack: false,
      blocker: "rollback_boundary_blocked",
    });
    expect(request.dependencies.rollback).not.toHaveBeenCalled();
  });

  it("requires exact entity-bound confirmation", async () => {
    const request = input({ confirmation: "ROLLBACK PHARMACY PUBLIC other" });
    await expect(runPharmacyPublicRollbackOperation(request)).resolves.toMatchObject({
      rolledBack: false,
      blocker: "rollback_boundary_blocked",
    });
    expect(request.dependencies.rollback).not.toHaveBeenCalled();
  });

  it("maps conflict and failure to one bounded execution blocker", async () => {
    for (const result of [
      {
        kind: "conflict",
        reason: "published_queue_integrity_mismatch",
        authorityConsumed: false,
        rawReferenceExposed: false,
      },
      {
        kind: "failed",
        authorityConsumed: false,
        rawReferenceExposed: false,
      },
    ] as const) {
      await expect(
        runPharmacyPublicRollbackOperation(
          input({
            dependencies: {
              rollback: vi.fn().mockResolvedValue(result),
            },
          }),
        ),
      ).resolves.toEqual({
        rolledBack: false,
        replayed: false,
        blocker: "rollback_execution_failed",
        visibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        exactLogicalRecovery: false,
        rawReferenceExposed: false,
      });
    }
  });
});
