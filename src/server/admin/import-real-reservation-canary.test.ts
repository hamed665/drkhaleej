import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  runImportRealReservationCanary,
  type ImportRealReservationCanaryInput,
} from "./import-real-reservation-canary";
import type { ImportPrivatePublishPersistenceAdapter } from "./import-private-persistence-adapter";
import type { ImportPersistenceReadbackClient } from "./import-persistence-readback-verifier";

const entityId = "11111111-1111-4111-8111-111111111111";
const actorId = "22222222-2222-4222-8222-222222222222";
const reservationId = "33333333-3333-4333-8333-333333333333";
const snapshotId = "44444444-4444-4444-8444-444444444444";
const auditId = "55555555-5555-4555-8555-555555555555";
const requestHash = "a".repeat(64);
const snapshotHash = "b".repeat(64);
const fingerprint = "c".repeat(64);

const input: ImportRealReservationCanaryInput = {
  executionEnabled: true,
  environment: "preview",
  actorId,
  entityId,
  allowedActorIds: [actorId],
  allowedEntityIds: [entityId],
  approvalToken: "approved-once",
  expectedApprovalToken: "approved-once",
  expectedSnapshotHash: snapshotHash,
  expectedEntityFingerprint: fingerprint,
  reservationRequest: {
    entityId,
    actorId,
    idempotencyKey: "preview-canary-001",
    requestHash,
    expectedVersion: "draft-v1",
    rollbackSnapshot: {
      visibility: "private",
      indexPolicy: "noindex",
      sitemapPolicy: "excluded",
      publishStatus: "draft",
      publicReady: false,
      projectionVersion: "projection-v1",
      canonicalRoute: "/en/hospitals/canary",
    },
    auditSchemaVersion: "v1",
    reservationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    rollbackExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

function createAdapter(): ImportPrivatePublishPersistenceAdapter {
  return {
    runReservationSnapshotAuditTransaction: vi.fn(async () => ({
      kind: "reserved" as const,
      reservationId,
      rollbackSnapshotId: snapshotId,
      auditEventId: auditId,
    })),
    persistTerminalResult: vi.fn(async () => ({ kind: "failed" as const, reason: "rpc_failed" as const })),
  };
}

function createReadbackClient(): ImportPersistenceReadbackClient {
  return {
    readIdempotencyRows: vi.fn(async () => ({
      data: [{
        id: reservationId,
        entity_id: entityId,
        actor_profile_id: actorId,
        idempotency_key: input.reservationRequest.idempotencyKey,
        expected_version: input.reservationRequest.expectedVersion,
        request_hash: requestHash,
        status: "reserved",
      }],
      error: null,
    })),
    readRollbackRows: vi.fn(async () => ({
      data: [{
        id: snapshotId,
        entity_id: entityId,
        actor_profile_id: actorId,
        idempotency_record_id: reservationId,
        expected_version: input.reservationRequest.expectedVersion,
        snapshot_hash: snapshotHash,
      }],
      error: null,
    })),
    readAuditRows: vi.fn(async () => ({
      data: [{
        id: auditId,
        entity_id: entityId,
        actor_profile_id: actorId,
        idempotency_record_id: reservationId,
        rollback_snapshot_id: snapshotId,
        event_type: "execution_started",
        outcome: "pending",
        expected_version: input.reservationRequest.expectedVersion,
      }],
      error: null,
    })),
    readEntityFingerprint: vi.fn(async () => ({ data: [{ fingerprint }], error: null })),
  };
}

describe("runImportRealReservationCanary", () => {
  it("reserves and verifies exactly one preview canary without entity mutation", async () => {
    const adapter = createAdapter();
    const result = await runImportRealReservationCanary(input, adapter, createReadbackClient());

    expect(result.attempted).toBe(true);
    expect(result.reserved).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.entityMutationAllowed).toBe(false);
    expect(adapter.runReservationSnapshotAuditTransaction).toHaveBeenCalledTimes(1);
    expect(adapter.persistTerminalResult).not.toHaveBeenCalled();
  });

  it("blocks production before any reservation attempt", async () => {
    const adapter = createAdapter();
    const result = await runImportRealReservationCanary(
      { ...input, environment: "production" },
      adapter,
      createReadbackClient(),
    );

    expect(result.attempted).toBe(false);
    expect(result.blockers).toContain("environment_not_preview");
    expect(adapter.runReservationSnapshotAuditTransaction).not.toHaveBeenCalled();
  });

  it("blocks a non-canary entity before any reservation attempt", async () => {
    const adapter = createAdapter();
    const result = await runImportRealReservationCanary(
      { ...input, allowedEntityIds: ["other"] },
      adapter,
      createReadbackClient(),
    );

    expect(result.attempted).toBe(false);
    expect(result.blockers).toContain("entity_not_allowed");
    expect(adapter.runReservationSnapshotAuditTransaction).not.toHaveBeenCalled();
  });
});
