import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createSupabasePharmacySitemapWriter,
  PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION,
} from "./import-supabase-pharmacy-sitemap-writer";

const request = {
  actorId: "11111111-1111-4111-8111-111111111111",
  entityId: "22222222-2222-4222-8222-222222222222",
  idempotencyKey: "pharmacy-sitemap-proof-key",
  requestHash: "a".repeat(64),
};

function authorized(status: "issued" | "replayed" = "issued") {
  return {
    status,
    authorizationId: "33333333-3333-4333-8333-333333333333",
    lifecycleStatus: status === "issued" ? "issued" : "included",
    snapshotHash: "b".repeat(64),
    rawReferenceExposed: false,
  };
}

function included(status: "included" | "replayed" = "included") {
  return {
    status,
    visibility: "public",
    indexPolicy: "index",
    robotsPolicy: "index",
    sitemapPolicy: "included",
    sitemapIncluded: true,
    rollbackAvailable: true,
    authorityConsumed: true,
    rawReferenceExposed: false,
  };
}

function rolledBack(status: "rolled_back" | "replayed" = "rolled_back") {
  return {
    status,
    visibility: "public",
    indexPolicy: "index_eligible",
    robotsPolicy: "index",
    sitemapPolicy: "excluded",
    sitemapIncluded: false,
    exactLogicalRecovery: true,
    authorityConsumed: true,
    rawReferenceExposed: false,
  };
}

describe("Supabase Pharmacy Sitemap writer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("authorizes then includes only the exact P14 Pharmacy", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: authorized(), error: null })
      .mockResolvedValueOnce({ data: included(), error: null });
    const writer = createSupabasePharmacySitemapWriter({ rpc });

    await expect(writer.promote(request)).resolves.toEqual({
      kind: "included",
      indexEligible: true,
      sitemapEligible: true,
      rollbackAvailable: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      "import_authorize_pharmacy_sitemap_promotion",
      expect.objectContaining({
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
        p_schema_version: PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION,
      }),
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "import_include_pharmacy_sitemap_by_authority",
      expect.objectContaining({
        p_authorization_id: authorized().authorizationId,
        p_entity_id: request.entityId,
      }),
    );
  });

  it("accepts replay but rejects coupled or malformed success", async () => {
    const replayWriter = createSupabasePharmacySitemapWriter({
      rpc: vi
        .fn()
        .mockResolvedValueOnce({ data: authorized("replayed"), error: null })
        .mockResolvedValueOnce({ data: included("replayed"), error: null }),
    });
    await expect(replayWriter.promote(request)).resolves.toMatchObject({
      kind: "replayed",
      indexEligible: true,
      sitemapEligible: true,
    });

    for (const result of [
      { ...included(), indexPolicy: "index_eligible" },
      { ...included(), sitemapIncluded: false },
      { ...included(), rawReferenceExposed: true },
    ]) {
      const writer = createSupabasePharmacySitemapWriter({
        rpc: vi
          .fn()
          .mockResolvedValueOnce({ data: authorized(), error: null })
          .mockResolvedValueOnce({ data: result, error: null }),
      });
      await expect(writer.promote(request)).resolves.toEqual({
        kind: "failed",
        authorityConsumed: false,
        rawReferenceExposed: false,
      });
    }
  });

  it("normalizes allowlisted conflicts without exposing authority identity", async () => {
    const writer = createSupabasePharmacySitemapWriter({
      rpc: vi.fn().mockResolvedValue({
        data: {
          status: "conflict",
          reason: "sitemap_prerequisite_queue_integrity_mismatch",
          authorityConsumed: false,
          rawReferenceExposed: false,
        },
        error: null,
      }),
    });
    await expect(writer.promote(request)).resolves.toEqual({
      kind: "conflict",
      reason: "sitemap_prerequisite_queue_integrity_mismatch",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
    await expect(writer.promote({ ...request, actorId: "" })).resolves.toEqual({
      kind: "failed",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
  });

  it("rolls Sitemap back to the exact P14 Index Queue", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: rolledBack(), error: null });
    const writer = createSupabasePharmacySitemapWriter({ rpc });
    await expect(
      writer.rollback({ actorId: request.actorId, entityId: request.entityId }),
    ).resolves.toEqual({
      kind: "rolled_back",
      indexEligible: true,
      sitemapEligible: false,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenCalledWith(
      "import_rollback_pharmacy_sitemap_by_authority",
      expect.objectContaining({
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
      }),
    );
  });

  it("rejects malformed rollback and RPC failure", async () => {
    for (const response of [
      { data: { ...rolledBack(), indexPolicy: "noindex" }, error: null },
      { data: { ...rolledBack(), sitemapIncluded: true }, error: null },
      { data: { ...rolledBack(), rawReferenceExposed: true }, error: null },
      { data: null, error: { message: "rpc failed" } },
    ]) {
      const writer = createSupabasePharmacySitemapWriter({
        rpc: vi.fn().mockResolvedValue(response),
      });
      await expect(
        writer.rollback({ actorId: request.actorId, entityId: request.entityId }),
      ).resolves.toEqual({
        kind: "failed",
        authorityConsumed: false,
        rawReferenceExposed: false,
      });
    }
  });
});
