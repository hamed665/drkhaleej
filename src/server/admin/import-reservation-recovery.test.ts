import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  recoverExpiredImportReservation,
  type ImportReservationRecoveryInput,
  type ImportReservationRecoveryReader,
  type ImportReservationRecoveryRecord,
} from "./import-reservation-recovery";
import type { ImportPrivatePublishPersistenceAdapter } from "./import-private-persistence-adapter";

const entityId = "11111111-1111-4111-8111-111111111111";
const actorId = "22222222-2222-4222-8222-222222222222";
const requestHash = "a".repeat(64);

const record: ImportReservationRecoveryRecord = {
  id: "33333333-3333-4333-8333-333333333333",
  entityId,
  actorId,
  idempotencyKey: "preview-recovery-001",
  requestHash,
  expectedVersion: "draft-v1",
  status: "reserved",
  expiresAt: "2026-07-10T12:00:00.000Z",
  terminalResult: null,
  rollbackSnapshotId: "44444444-4444-4444-8444-444444444444",
  executionStartedAuditId: "55555555-5555-4555-8555-555555555555",
};

const input: ImportReservationRecoveryInput = {
  environment: "preview",
  entityId,
  actorId,
  idempotencyKey: record.idempotencyKey,
  requestHash,
  auditSchemaVersion: "import-publish-v1",
  now: "2026-07-11T12:00:00.000Z",
  allowedActorIds: [actorId],
  allowedEntityIds: [entityId],
  executionEnabled: true,
};

function reader(overrides: Partial<ImportReservationRecoveryReader> = {}): ImportReservationRecoveryReader {
  return {
    readRecoveryRecord: async () => ({ data: record, error: null }),
    readEntityVersion: async () => ({ data: { version: record.expectedVersion }, error: null }),
    ...overrides,
  };
}

function adapter(
  persistTerminalResult: ImportPrivatePublishPersistenceAdapter["persistTerminalResult"] = async () => ({
    kind: "persisted",
    reservationId: record.id,
    auditEventId: "66666666-6666-4666-8666-666666666666",
    outcome: "failed",
  }),
): ImportPrivatePublishPersistenceAdapter {
  return {
    runReservationSnapshotAuditTransaction: async () => ({ kind: "failed", reason: "transaction_aborted" }),
    persistTerminalResult,
  };
}

describe("recoverExpiredImportReservation", () => {
  it("marks an expired reservation failed while preserving snapshot and entity", async () => {
    const result = await recoverExpiredImportReservation(reader(), adapter(), input);

    expect(result.mode).toBe("recovered");
    expect(result.recoveryAttempted).toBe(true);
    expect(result.recovered).toBe(true);
    expect(result.snapshotPreserved).toBe(true);
    expect(result.entityMutationAllowed).toBe(false);
    expect(result.automaticRetryAllowed).toBe(false);
    expect(result.terminalResult?.status).toBe("failed");
    expect(result.blockers).toEqual([]);
  });

  it("does not recover a reservation before expiry", async () => {
    const result = await recoverExpiredImportReservation(
      reader({
        readRecoveryRecord: async () => ({
          data: { ...record, expiresAt: "2026-07-12T12:00:00.000Z" },
          error: null,
        }),
      }),
      adapter(),
      input,
    );

    expect(result.recoveryAttempted).toBe(false);
    expect(result.blockers).toContain("reservation_not_expired");
  });

  it("fails closed when the entity version changed", async () => {
    const result = await recoverExpiredImportReservation(
      reader({ readEntityVersion: async () => ({ data: { version: "draft-v2" }, error: null }) }),
      adapter(),
      input,
    );

    expect(result.recoveryAttempted).toBe(false);
    expect(result.blockers).toContain("entity_version_changed");
  });

  it("replays an existing terminal failure without another write", async () => {
    const terminalResult = {
      status: "failed" as const,
      entityId,
      idempotencyKey: record.idempotencyKey,
      requestHash,
      auditEventId: record.executionStartedAuditId,
      rollbackSnapshotId: record.rollbackSnapshotId,
      committedAt: null,
    };
    const persist = vi.fn();
    const result = await recoverExpiredImportReservation(
      reader({
        readRecoveryRecord: async () => ({ data: { ...record, status: "failed", terminalResult }, error: null }),
      }),
      adapter(persist),
      input,
    );

    expect(result.mode).toBe("replayed");
    expect(result.recovered).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it("blocks production and non-allowlisted actors", async () => {
    const result = await recoverExpiredImportReservation(reader(), adapter(), {
      ...input,
      environment: "production",
      allowedActorIds: [],
    });

    expect(result.mode).toBe("recovery_disabled");
    expect(result.blockers).toContain("environment_not_preview");
    expect(result.blockers).toContain("actor_not_allowed");
  });
});
