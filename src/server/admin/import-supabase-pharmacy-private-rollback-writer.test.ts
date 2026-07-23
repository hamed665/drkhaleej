import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { createSupabasePharmacyPrivateRollbackWriter } from "./import-supabase-pharmacy-private-rollback-writer";

function request() {
  return {
    entityId: "11111111-1111-4111-8111-111111111111",
    actorId: "22222222-2222-4222-8222-222222222222",
  };
}

function success(status: "rolled_back" | "replayed") {
  return {
    status,
    entityId: request().entityId,
    actualVersion: "2026-07-24 02:01:00+00",
    authorityConsumed: true,
    privateBoundaryVerified: true,
    rawReferenceExposed: false,
  };
}

describe("Supabase pharmacy atomic rollback authority writer", () => {
  it("calls only the authority RPC with actor/entity identity and no raw reference", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: success("rolled_back"), error: null });
    const rollback = createSupabasePharmacyPrivateRollbackWriter({ rpc });

    await expect(rollback(request())).resolves.toEqual({
      kind: "rolled_back",
      entityId: request().entityId,
      actualVersion: "2026-07-24 02:01:00+00",
      authorityConsumed: true,
      privateBoundaryVerified: true,
      rawReferenceExposed: false,
    });
    expect(rpc).toHaveBeenCalledWith("import_rollback_pharmacy_private_by_authority", {
      p_entity_id: request().entityId,
      p_actor_profile_id: request().actorId,
      p_audit_schema_version: "drkhaleej.import.publishAudit.v4",
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("publishReference");
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("rollbackSnapshotId");
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("reservationId");
  });

  it("returns a bounded replay for an already consumed authority", async () => {
    const rollback = createSupabasePharmacyPrivateRollbackWriter({
      rpc: vi.fn().mockResolvedValue({ data: success("replayed"), error: null }),
    });
    await expect(rollback(request())).resolves.toEqual({
      kind: "replayed",
      entityId: request().entityId,
      actualVersion: "2026-07-24 02:01:00+00",
      authorityConsumed: true,
      privateBoundaryVerified: true,
      rawReferenceExposed: false,
    });
  });

  it("fails closed before RPC for missing actor or entity identity", async () => {
    const rpc = vi.fn();
    const rollback = createSupabasePharmacyPrivateRollbackWriter({ rpc });
    await expect(rollback({ ...request(), actorId: "" })).resolves.toEqual({
      kind: "failed",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("normalizes approved conflicts only when consumption stayed false", async () => {
    const rollback = createSupabasePharmacyPrivateRollbackWriter({
      rpc: vi.fn().mockResolvedValue({
        data: {
          status: "conflict",
          reason: "rollback_authority_not_available",
          authorityConsumed: false,
          rawReferenceExposed: false,
        },
        error: null,
      }),
    });
    await expect(rollback(request())).resolves.toEqual({
      kind: "conflict",
      reason: "rollback_authority_not_available",
      authorityConsumed: false,
      rawReferenceExposed: false,
    });
  });

  it("rejects malformed success, raw-reference exposure, and RPC errors", async () => {
    for (const response of [
      { data: { ...success("rolled_back"), authorityConsumed: false }, error: null },
      { data: { ...success("rolled_back"), rawReferenceExposed: true }, error: null },
      { data: { status: "rolled_back" }, error: null },
      { data: null, error: { message: "rpc failed" } },
    ]) {
      const rollback = createSupabasePharmacyPrivateRollbackWriter({ rpc: vi.fn().mockResolvedValue(response) });
      await expect(rollback(request())).resolves.toEqual({
        kind: "failed",
        authorityConsumed: false,
        rawReferenceExposed: false,
      });
    }
  });
});
