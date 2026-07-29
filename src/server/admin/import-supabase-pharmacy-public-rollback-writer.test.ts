import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createSupabasePharmacyPublicRollbackWriter,
  PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
} from "./import-supabase-pharmacy-public-rollback-writer";

const request = {
  actorId: "11111111-1111-4111-8111-111111111111",
  entityId: "22222222-2222-4222-8222-222222222222",
};

function success(status: "rolled_back" | "replayed") {
  return {
    status,
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    restoredQueuePresent: true,
    exactLogicalRecovery: true,
    authorityConsumed: true,
    rawReferenceExposed: false,
  };
}

describe("Supabase Pharmacy public/noindex rollback writer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls only the server-selected three-input authority RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: success("rolled_back"),
      error: null,
    });
    const rollback = createSupabasePharmacyPublicRollbackWriter({ rpc });

    await expect(rollback(request)).resolves.toEqual({
      kind: "rolled_back",
      restoredQueuePresent: true,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenCalledWith(
      "import_rollback_pharmacy_public_noindex_by_authority",
      {
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
        p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
      },
    );
    expect(JSON.stringify(rpc.mock.calls)).not.toMatch(
      /authorizationId|queueId|snapshot|rollbackReference/i,
    );
  });

  it("accepts only a bounded persisted replay", async () => {
    const rollback = createSupabasePharmacyPublicRollbackWriter({
      rpc: vi.fn().mockResolvedValue({ data: success("replayed"), error: null }),
    });
    await expect(rollback(request)).resolves.toEqual({
      kind: "replayed",
      restoredQueuePresent: true,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    });
  });

  it("fails before RPC when actor or entity identity is missing", async () => {
    const rpc = vi.fn();
    const rollback = createSupabasePharmacyPublicRollbackWriter({ rpc });
    await expect(rollback({ ...request, actorId: "" })).resolves.toEqual({
      kind: "failed",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("normalizes only allowlisted unconsumed conflicts", async () => {
    const rollback = createSupabasePharmacyPublicRollbackWriter({
      rpc: vi.fn().mockResolvedValue({
        data: {
          status: "conflict",
          reason: "published_queue_integrity_mismatch",
          authorityConsumed: false,
          rawReferenceExposed: false,
        },
        error: null,
      }),
    });
    await expect(rollback(request)).resolves.toEqual({
      kind: "conflict",
      reason: "published_queue_integrity_mismatch",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
  });

  it("rejects malformed success, leaked references, unknown conflicts and RPC errors", async () => {
    for (const response of [
      {
        data: { ...success("rolled_back"), rawReferenceExposed: true },
        error: null,
      },
      {
        data: { ...success("rolled_back"), exactLogicalRecovery: false },
        error: null,
      },
      {
        data: {
          status: "conflict",
          reason: "unbounded_database_error",
          authorityConsumed: false,
          rawReferenceExposed: false,
        },
        error: null,
      },
      { data: null, error: { message: "rpc failed" } },
    ]) {
      const rollback = createSupabasePharmacyPublicRollbackWriter({
        rpc: vi.fn().mockResolvedValue(response),
      });
      await expect(rollback(request)).resolves.toEqual({
        kind: "failed",
        authorityConsumed: false,
        rawReferenceExposed: false,
      });
    }
  });
});
