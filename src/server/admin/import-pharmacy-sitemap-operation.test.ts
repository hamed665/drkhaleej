import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import {
  runPharmacySitemapPromotionOperation,
  runPharmacySitemapRollbackOperation,
  type PharmacySitemapRuntimePolicy,
} from "./import-pharmacy-sitemap-operation";

const actorId = "11111111-1111-4111-8111-111111111111";
const entityId = "22222222-2222-4222-8222-222222222222";

function policy(
  overrides: Partial<PharmacySitemapRuntimePolicy> = {},
): PharmacySitemapRuntimePolicy {
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
    Parameters<typeof runPharmacySitemapPromotionOperation>[0]
  > = {},
) {
  return {
    actorId,
    entityId,
    idempotencyKey: "pharmacy-sitemap-operation",
    requestHash: "a".repeat(64),
    confirmation: `INCLUDE PHARMACY SITEMAP ${entityId}`,
    policy: policy(),
    dependencies: {
      promote: vi.fn().mockResolvedValue({
        kind: "included",
        indexEligible: true,
        sitemapEligible: true,
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
    Parameters<typeof runPharmacySitemapRollbackOperation>[0]
  > = {},
) {
  return {
    actorId,
    entityId,
    confirmation: `ROLLBACK PHARMACY SITEMAP ${entityId}`,
    policy: policy(),
    dependencies: {
      rollback: vi.fn().mockResolvedValue({
        kind: "rolled_back",
        indexEligible: true,
        sitemapEligible: false,
        exactLogicalRecovery: true,
        authorityConsumed: true,
        rawReferenceExposed: false,
      }),
    },
    ...overrides,
  };
}

describe("Pharmacy Sitemap operation", () => {
  it("includes only Sitemap while preserving the P14 Index state", async () => {
    await expect(
      runPharmacySitemapPromotionOperation(promotionInput()),
    ).resolves.toEqual({
      included: true,
      replayed: false,
      blocker: null,
      visibility: "public",
      indexEligible: true,
      sitemapEligible: true,
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
    await expect(runPharmacySitemapPromotionOperation(input)).resolves.toMatchObject({
      included: false,
      blocker: "sitemap_boundary_blocked",
      sitemapEligible: false,
    });
    expect(input.dependencies.promote).not.toHaveBeenCalled();
  });

  it("requires exact confirmation and bounds writer failure", async () => {
    const blocked = promotionInput({ confirmation: "INCLUDE PHARMACY SITEMAP other" });
    await expect(runPharmacySitemapPromotionOperation(blocked)).resolves.toMatchObject({
      included: false,
      blocker: "sitemap_boundary_blocked",
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
    await expect(runPharmacySitemapPromotionOperation(failed)).resolves.toMatchObject({
      included: false,
      blocker: "sitemap_execution_failed",
    });
  });

  it("restores exact P14 state and accepts persisted replay", async () => {
    await expect(
      runPharmacySitemapRollbackOperation(rollbackInput()),
    ).resolves.toEqual({
      rolledBack: true,
      replayed: false,
      blocker: null,
      visibility: "public",
      indexEligible: true,
      sitemapEligible: false,
      routeEnabled: true,
      exactLogicalRecovery: true,
      rawReferenceExposed: false,
    });

    const replay = rollbackInput({
      dependencies: {
        rollback: vi.fn().mockResolvedValue({
          kind: "replayed",
          indexEligible: true,
          sitemapEligible: false,
          exactLogicalRecovery: true,
          authorityConsumed: true,
          rawReferenceExposed: false,
        }),
      },
    });
    await expect(runPharmacySitemapRollbackOperation(replay)).resolves.toMatchObject({
      rolledBack: true,
      replayed: true,
      exactLogicalRecovery: true,
    });
  });

  it("fails rollback closed for boundary drift", async () => {
    for (const overrides of [
      { policy: policy({ rollbackEnabled: false }) },
      { policy: policy({ environment: "production" }) },
      { confirmation: "ROLLBACK PHARMACY SITEMAP other" },
    ]) {
      const input = rollbackInput(overrides);
      await expect(runPharmacySitemapRollbackOperation(input)).resolves.toMatchObject({
        rolledBack: false,
        blocker: "sitemap_rollback_boundary_blocked",
      });
      expect(input.dependencies.rollback).not.toHaveBeenCalled();
    }
  });
});
