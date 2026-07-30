import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createSupabasePharmacyIndexWriter,
  PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
} from "./import-supabase-pharmacy-index-writer";

const request = {
  actorId: "11111111-1111-4111-8111-111111111111",
  entityId: "22222222-2222-4222-8222-222222222222",
  idempotencyKey: "pharmacy-index-proof-key",
  requestHash: "a".repeat(64),
};

function authorized(status: "issued" | "replayed" = "issued") {
  return {
    status,
    authorizationId: "33333333-3333-4333-8333-333333333333",
    lifecycleStatus: status === "issued" ? "issued" : "promoted",
    snapshotHash: "b".repeat(64),
    rawReferenceExposed: false,
  };
}

function promoted(status: "promoted" | "replayed" = "promoted") {
  return {
    status,
    visibility: "public",
    indexPolicy: "index_eligible",
    robotsPolicy: "index",
    sitemapPolicy: "excluded",
    sitemapIncluded: false,
    rollbackAvailable: true,
    authorityConsumed: true,
    rawReferenceExposed: false,
  };
}

function rolledBack(status: "rolled_back" | "replayed" = "rolled_back") {
  return {
    status,
    visibility: "public_noindex",
    indexPolicy: "noindex",
    robotsPolicy: "noindex",
    sitemapPolicy: "excluded",
    sitemapIncluded: false,
    exactLogicalRecovery: true,
    authorityConsumed: true,
    rawReferenceExposed: false,
  };
}

describe("Supabase Pharmacy Index writer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("authorizes then promotes without returning the raw authority identity", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: authorized(), error: null })
      .mockResolvedValueOnce({ data: promoted(), error: null });
    const writer = createSupabasePharmacyIndexWriter({ rpc });

    await expect(writer.promote(request)).resolves.toEqual({
      kind: "promoted",
      indexEligible: true,
      sitemapEligible: false,
      rollbackAvailable: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      "import_authorize_pharmacy_index_promotion",
      {
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
        p_idempotency_key: request.idempotencyKey,
        p_request_hash: request.requestHash,
        p_schema_version: PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
        p_ttl_hours: 24,
      },
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "import_promote_pharmacy_index_by_authority",
      expect.objectContaining({
        p_authorization_id: authorized().authorizationId,
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
      }),
    );
    expect(await writer.promote({ ...request, actorId: "" })).toEqual({
      kind: "failed",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
  });

  it("accepts only the bounded independent Index state", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: authorized("replayed"), error: null })
      .mockResolvedValueOnce({ data: promoted("replayed"), error: null });
    const writer = createSupabasePharmacyIndexWriter({ rpc });
    await expect(writer.promote(request)).resolves.toMatchObject({
      kind: "replayed",
      indexEligible: true,
      sitemapEligible: false,
    });
  });

  it("normalizes allowlisted conflicts and rejects malformed or coupled success", async () => {
    const conflictWriter = createSupabasePharmacyIndexWriter({
      rpc: vi.fn().mockResolvedValue({
        data: {
          status: "conflict",
          reason: "index_prerequisite_queue_integrity_mismatch",
          authorityConsumed: false,
          rawReferenceExposed: false,
        },
        error: null,
      }),
    });
    await expect(conflictWriter.promote(request)).resolves.toEqual({
      kind: "conflict",
      reason: "index_prerequisite_queue_integrity_mismatch",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });

    for (const result of [
      { ...promoted(), sitemapIncluded: true },
      { ...promoted(), sitemapPolicy: "included" },
      { ...promoted(), rawReferenceExposed: true },
    ]) {
      const writer = createSupabasePharmacyIndexWriter({
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

  it("rolls Index back through the server-selected actor/entity RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: rolledBack(),
      error: null,
    });
    const writer = createSupabasePharmacyIndexWriter({ rpc });
    await expect(
      writer.rollback({ actorId: request.actorId, entityId: request.entityId }),
    ).resolves.toEqual({
      kind: "rolled_back",
      indexEligible: false,
      sitemapEligible: false,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenCalledWith(
      "import_rollback_pharmacy_index_by_authority",
      {
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
        p_schema_version: PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
      },
    );
  });

  it("rejects malformed rollback success, leaked references and RPC errors", async () => {
    for (const response of [
      { data: { ...rolledBack(), exactLogicalRecovery: false }, error: null },
      { data: { ...rolledBack(), sitemapIncluded: true }, error: null },
      { data: { ...rolledBack(), rawReferenceExposed: true }, error: null },
      { data: null, error: { message: "rpc failed" } },
    ]) {
      const writer = createSupabasePharmacyIndexWriter({
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
