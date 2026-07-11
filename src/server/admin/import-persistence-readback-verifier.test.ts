import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  verifyImportPersistenceReadback,
  type ImportPersistenceReadbackClient,
  type ImportPersistenceReadbackVerificationInput,
} from "./import-persistence-readback-verifier";

const requestHash = "a".repeat(64);
const snapshotHash = "b".repeat(64);
const entityFingerprint = "c".repeat(64);

const input: ImportPersistenceReadbackVerificationInput = {
  entityId: "11111111-1111-4111-8111-111111111111",
  actorId: "22222222-2222-4222-8222-222222222222",
  idempotencyKey: "preview-canary-001",
  requestHash,
  expectedVersion: "draft-v1",
  expectedSnapshotHash: snapshotHash,
  expectedEntityFingerprint: entityFingerprint,
};

function createClient(overrides: Partial<ImportPersistenceReadbackClient> = {}): ImportPersistenceReadbackClient {
  const reservationId = "33333333-3333-4333-8333-333333333333";
  const snapshotId = "44444444-4444-4444-8444-444444444444";

  return {
    readIdempotencyRows: async () => ({
      data: [
        {
          id: reservationId,
          entity_id: input.entityId,
          actor_profile_id: input.actorId,
          idempotency_key: input.idempotencyKey,
          expected_version: input.expectedVersion,
          request_hash: requestHash,
          status: "reserved",
        },
      ],
      error: null,
    }),
    readRollbackRows: async () => ({
      data: [
        {
          id: snapshotId,
          entity_id: input.entityId,
          actor_profile_id: input.actorId,
          idempotency_record_id: reservationId,
          expected_version: input.expectedVersion,
          snapshot_hash: snapshotHash,
        },
      ],
      error: null,
    }),
    readAuditRows: async () => ({
      data: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          entity_id: input.entityId,
          actor_profile_id: input.actorId,
          idempotency_record_id: reservationId,
          rollback_snapshot_id: snapshotId,
          event_type: "execution_started",
          outcome: "pending",
          expected_version: input.expectedVersion,
        },
      ],
      error: null,
    }),
    readEntityFingerprint: async () => ({ data: [{ fingerprint: entityFingerprint }], error: null }),
    ...overrides,
  };
}

describe("verifyImportPersistenceReadback", () => {
  it("verifies exactly one linked row in each persistence table and an unchanged entity", async () => {
    const result = await verifyImportPersistenceReadback(createClient(), input);

    expect(result.verified).toBe(true);
    expect(result.entityUnchanged).toBe(true);
    expect(result.counts).toEqual({
      idempotency: 1,
      rollbackSnapshot: 1,
      executionStartedAudit: 1,
      entityFingerprint: 1,
    });
    expect(result.blockers).toEqual([]);
    expect(result.rawPayloadExposed).toBe(false);
    expect(result.writeAllowed).toBe(false);
  });

  it("fails closed when duplicate idempotency rows are returned", async () => {
    const base = createClient();
    const first = await base.readIdempotencyRows({
      entityId: input.entityId,
      idempotencyKey: input.idempotencyKey,
      requestHash,
      limit: 2,
    });
    const row = first.data?.[0];
    if (!row) throw new Error("fixture row missing");

    const result = await verifyImportPersistenceReadback(
      createClient({ readIdempotencyRows: async () => ({ data: [row, { ...row, id: "duplicate" }], error: null }) }),
      input,
    );

    expect(result.verified).toBe(false);
    expect(result.blockers).toContain("idempotency_row_count_invalid");
  });

  it("fails closed when the entity fingerprint changed", async () => {
    const result = await verifyImportPersistenceReadback(
      createClient({ readEntityFingerprint: async () => ({ data: [{ fingerprint: "d".repeat(64) }], error: null }) }),
      input,
    );

    expect(result.verified).toBe(false);
    expect(result.entityUnchanged).toBe(false);
    expect(result.blockers).toContain("entity_changed");
  });
});
