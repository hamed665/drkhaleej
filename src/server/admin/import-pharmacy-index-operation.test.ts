import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import {
  runPharmacyIndexPromotionOperation,
  runPharmacyIndexRollbackOperation,
  type PharmacyIndexRuntimePolicy,
} from "./import-pharmacy-index-operation";

const actorId = "11111111-1111-4111-8111-111111111111";
const entityId = "22222222-2222-4222-8222-222222222222";

function policy(
  overrides: Partial<PharmacyIndexRuntimePolicy> = {},
): PharmacyIndexRuntimePolicy {
  return {
    promotionEnabled: true,
    rollbackEnabled: true,
    environment: "preview",
    previewProjectRef: "preview-ref",
    productionProjectRef: "production-ref",
    supabaseUrl: "https://preview-ref.supabase.co",
    allowedActorIds: [actorId],
    allowedEntityIds: [entityId],
    ...overrides,
  };
}

function promotionInput(
  overrides: Partial<
    Parameters<typeof runPharmacyIndexPromotionOperation>[0]
  > = {},
) {
  return {
    actorId,
    entityId,
    idempotencyKey: "pharmacy-index-operation",
    requestHash: "a".repeat(64),
    confirmation: `PROMOTE PHARMACY INDEX ${entityId}`,
    policy: policy(),
    dependencies: {
      promote: vi.fn().mockResolvedValue({
        kind: "promoted",
        indexEligible: true,
        sitemapEligible: false,
        rollbackAvailable: true,
        authorityConsumed: true,
        rawReferenceExposed: false,
      }),
    },
    ...overrides,
  };
}

function rollbackInput(
  overrides: Partial<
    Parameters<typeof runPharmacyIndexRollbackOperation>[0]
  > = {},
) {
  return {
    actorId,
    entityId,
    confirmation: `ROLLBACK PHARMACY INDEX ${entityId}`,
    policy: policy(),
    dependencies: {
      rollback: vi.fn().mockResolvedValue({
        kind: "rolled_back",
        indexEligible: false,
        sitemapEligible: false,
        exactLogicalRecovery: true,
        authorityConsumed: true,
        rawReferenceExposed: false,
      }),
    },
    ...overrides,
  };
}

describe("Pharmacy Index operation", () => {
  it("returns only an Index promotion while Sitemap stays closed", async () => {
    const input = promotionInput();
    await expect(runPharmacyIndexPromotionOperation(input)).resolves.toEqual({
      promoted: true,
      replayed: false,
      blocker: null,
      visibility: "public",
      indexEligible: true,
      sitemapEligible: false,
      routeEnabled: true,
      rollbackAvailable: true,
      rawReferenceExposed: false,
    });
  });

  it.each([
    ["disabled", policy({ promotionEnabled: false })],
    ["non-preview", policy({ environment: "production" })],
    ["same project", policy({ productionProjectRef: "preview-ref" })],
    ["Production URL", policy({ supabaseUrl: "https://production-ref.supabase.co" })],
    ["actor not allowed", policy({ allowedActorIds: [] })],
    ["entity not allowed", policy({ allowedEntityIds: [] })],
  ])("fails promotion closed for %s", async (_label, blockedPolicy) => {
    const input = promotionInput({ policy: blockedPolicy });
    await expect(runPharmacyIndexPromotionOperation(input)).resolves.toMatchObject({
      promoted: false,
      blocker: "index_boundary_blocked",
      sitemapEligible: false,
    });
    expect(input.dependencies.promote).not.toHaveBeenCalled();
  });

  it("requires exact promotion confirmation and bounds execution failure", async () => {
    const blocked = promotionInput({ confirmation: "PROMOTE PHARMACY INDEX other" });
    await expect(runPharmacyIndexPromotionOperation(blocked)).resolves.toMatchObject({
      promoted: false,
      blocker: "index_boundary_blocked",
    });

    const failed = promotionInput({
      dependencies: {
        promote: vi.fn().mockResolvedValue({
          kind: "failed",
          authorityConsumed: false,
          rawReferenceExposed: false,
        }),
      },
    });
    await expect(runPharmacyIndexPromotionOperation(failed)).resolves.toMatchObject({
      promoted: false,
      blocker: "index_execution_failed",
      sitemapEligible: false,
    });
  });

  it("returns exact public/noindex recovery and persisted replay", async () => {
    const fresh = rollbackInput();
    await expect(runPharmacyIndexRollbackOperation(fresh)).resolves.toEqual({
      rolledBack: true,
      replayed: false,
      blocker: null,
      visibility: "public_noindex",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: true,
      exactLogicalRecovery: true,
      rawReferenceExposed: false,
    });

    const replay = rollbackInput({
      dependencies: {
        rollback: vi.fn().mockResolvedValue({
          kind: "replayed",
          indexEligible: false,
          sitemapEligible: false,
          exactLogicalRecovery: true,
          authorityConsumed: true,
          rawReferenceExposed: false,
        }),
      },
    });
    await expect(runPharmacyIndexRollbackOperation(replay)).resolves.toMatchObject({
      rolledBack: true,
      replayed: true,
      exactLogicalRecovery: true,
    });
  });

  it("fails rollback closed before the writer for boundary drift", async () => {
    for (const overrides of [
      { policy: policy({ rollbackEnabled: false }) },
      { policy: policy({ environment: "production" }) },
      { confirmation: "ROLLBACK PHARMACY INDEX other" },
    ]) {
      const input = rollbackInput(overrides);
      await expect(runPharmacyIndexRollbackOperation(input)).resolves.toMatchObject({
        rolledBack: false,
        blocker: "index_rollback_boundary_blocked",
      });
      expect(input.dependencies.rollback).not.toHaveBeenCalled();
    }
  });
});
