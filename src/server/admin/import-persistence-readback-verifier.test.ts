import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  verifyImportPersistenceReadback,
  type ImportPersistenceAuditRow,
  type ImportPersistenceReadbackClient,
  type ImportPersistenceReadbackVerificationInput,
} from "./import-persistence-readback-verifier";

const reservationId = "33333333-3333-4333-8333-333333333333";
const snapshotId = "44444444-4444-4444-8444-444444444444";
const auditId = "55555555-5555-4555-8555-555555555555";
const authorizationId = "66666666-6666-4666-8666-666666666666";
const reviewStateId = "77777777-7777-4777-8777-777777777777";
const operationAttemptId = "88888888-8888-4888-8888-888888888888";
const requestHash = "a".repeat(64);
const snapshotHash = "b".repeat(64);
const entityFingerprint = "c".repeat(64);
const patchHash = "d".repeat(64);

const input: ImportPersistenceReadbackVerificationInput = {
  entityId: "11111111-1111-4111-8111-111111111111",
  actorId: "22222222-2222-4222-8222-222222222222",
  authorizationId,
  reviewStateId,
  operationAttemptId,
  idempotencyKey: "preview-canary-001",
  requestHash,
  patchHash,
  expectedVersion: "draft-v1",
  expectedSnapshotHash: snapshotHash,
  expectedEntityFingerprint: entityFingerprint,
  expectedReservationId: reservationId,
  expectedRollbackSnapshotId: snapshotId,
  expectedAuditEventId: auditId,
  entityFamily: "pharmacy",
  operationScope: "reserve_private_publish",
};

function auditRow(eventType: ImportPersistenceAuditRow["event_type"] = "execution_started"): ImportPersistenceAuditRow {
  return {
    id: auditId,
    entity_id: input.entityId,
    actor_profile_id: input.actorId,
    idempotency_record_id: reservationId,
    rollback_snapshot_id: snapshotId,
    event_type: eventType,
    outcome: "pending",
    expected_version: input.expectedVersion,
    phase: "reservation",
    request_hash: requestHash,
    authorization_id: authorizationId,
    review_snapshot_hash: snapshotHash,
    entity_fingerprint: entityFingerprint,
    operation_attempt_id: operationAttemptId,
    patch_hash: patchHash,
    entity_family: "pharmacy",
    operation_scope: "reserve_private_publish",
  };
}

function createClient(overrides: Partial<ImportPersistenceReadbackClient> = {}): ImportPersistenceReadbackClient {
  return {
    readAuthorizationRows: async () => ({
      data: [{
        id: authorizationId,
        review_state_id: reviewStateId,
        actor_profile_id: input.actorId,
        entity_id: input.entityId,
        review_snapshot_hash: snapshotHash,
        entity_fingerprint: entityFingerprint,
        operation_attempt_id: operationAttemptId,
        idempotency_key: input.idempotencyKey,
        request_hash: requestHash,
        patch_hash: patchHash,
        expected_entity_version: input.expectedVersion,
        entity_family: "pharmacy",
        operation_scope: "reserve_private_publish",
        status: "consumed",
        consumed_by_reservation_id: reservationId,
      }],
      error: null,
    }),
    readIdempotencyRows: async () => ({
      data: [{
        id: reservationId,
        entity_id: input.entityId,
        actor_profile_id: input.actorId,
        idempotency_key: input.idempotencyKey,
        expected_version: input.expectedVersion,
        request_hash: requestHash,
        status: "reserved",
        pharmacy_authorization_id: authorizationId,
      }],
      error: null,
    }),
    readRollbackRows: async () => ({
      data: [{
        id: snapshotId,
        entity_id: input.entityId,
        actor_profile_id: input.actorId,
        idempotency_record_id: reservationId,
        expected_version: input.expectedVersion,
        snapshot_hash: snapshotHash,
      }],
      error: null,
    }),
    readAuditRows: async () => ({ data: [auditRow()], error: null }),
    readEntityFingerprint: async () => ({
      data: [{ fingerprint: entityFingerprint, version: input.expectedVersion }],
      error: null,
    }),
    ...overrides,
  };
}

describe("verifyImportPersistenceReadback", () => {
  it("rejects malformed verification identity before any database read", async () => {
    const client = createClient();
    const reads = [
      vi.spyOn(client, "readAuthorizationRows"),
      vi.spyOn(client, "readIdempotencyRows"),
      vi.spyOn(client, "readRollbackRows"),
      vi.spyOn(client, "readAuditRows"),
      vi.spyOn(client, "readEntityFingerprint"),
    ];

    const result = await verifyImportPersistenceReadback(client, { ...input, requestHash: "not-a-hash" });

    expect(result.blockers).toEqual(["invalid_verification_input"]);
    expect(reads.every((read) => read.mock.calls.length === 0)).toBe(true);
  });

  it("verifies exactly one linked row in each persistence table and an unchanged entity", async () => {
    const result = await verifyImportPersistenceReadback(createClient(), input);

    expect(result.verified).toBe(true);
    expect(result.entityUnchanged).toBe(true);
    expect(result.counts).toEqual({
      authorization: 1,
      idempotency: 1,
      rollbackSnapshot: 1,
      reservationAudit: 1,
      executionStartedAudit: 1,
      reservationCreatedAudit: 0,
      entityFingerprint: 1,
    });
    expect(result.findings).toEqual({ duplicateCount: 0, orphanCount: 0, auditGapCount: 0 });
    expect(result.auditSignature).toBe("execution_started");
    expect(result.blockers).toEqual([]);
    expect(result.rawPayloadExposed).toBe(false);
    expect(result.writeAllowed).toBe(false);
  });

  it("accepts the future reservation audit signature without renaming the current event", async () => {
    const result = await verifyImportPersistenceReadback(
      createClient({ readAuditRows: async () => ({ data: [auditRow("reservation_created")], error: null }) }),
      input,
    );

    expect(result.verified).toBe(true);
    expect(result.auditSignature).toBe("reservation_created");
    expect(result.counts).toMatchObject({ executionStartedAudit: 0, reservationCreatedAudit: 1 });
  });

  it("fails closed when duplicate idempotency rows are returned", async () => {
    const base = createClient();
    const first = await base.readIdempotencyRows({ reservationId, limit: 2 });
    const row = first.data?.[0];
    if (!row) throw new Error("fixture row missing");

    const result = await verifyImportPersistenceReadback(
      createClient({ readIdempotencyRows: async () => ({ data: [row, { ...row, id: "duplicate" }], error: null }) }),
      input,
    );

    expect(result.verified).toBe(false);
    expect(result.findings.duplicateCount).toBe(1);
    expect(result.blockers).toContain("idempotency_row_count_invalid");
  });

  it("detects an authorization orphan and an audit identity gap", async () => {
    const base = createClient();
    const authorizationRead = await base.readAuthorizationRows({ authorizationId, limit: 2 });
    const authorization = authorizationRead.data?.[0];
    if (!authorization) throw new Error("fixture authorization missing");

    const result = await verifyImportPersistenceReadback(createClient({
      readAuthorizationRows: async () => ({
        data: [{ ...authorization, consumed_by_reservation_id: "other-reservation" }],
        error: null,
      }),
      readAuditRows: async () => ({ data: [{ ...auditRow(), patch_hash: "e".repeat(64) }], error: null }),
    }), input);

    expect(result.verified).toBe(false);
    expect(result.findings.orphanCount).toBe(1);
    expect(result.blockers).toContain("authorization_reservation_linkage_mismatch");
    expect(result.blockers).toContain("audit_identity_mismatch");
  });

  it("fails closed when the entity fingerprint changed", async () => {
    const result = await verifyImportPersistenceReadback(
      createClient({
        readEntityFingerprint: async () => ({
          data: [{ fingerprint: "f".repeat(64), version: input.expectedVersion }],
          error: null,
        }),
      }),
      input,
    );

    expect(result.verified).toBe(false);
    expect(result.entityUnchanged).toBe(false);
    expect(result.blockers).toContain("entity_changed");
  });

  it("fails closed when the entity version changed without a fingerprint change", async () => {
    const result = await verifyImportPersistenceReadback(createClient({
      readEntityFingerprint: async () => ({
        data: [{ fingerprint: entityFingerprint, version: "newer-version" }],
        error: null,
      }),
    }), input);

    expect(result.verified).toBe(false);
    expect(result.entityUnchanged).toBe(false);
    expect(result.blockers).toContain("entity_changed");
  });
});
