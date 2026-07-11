import "server-only";

import type {
  ImportPrivatePublishPersistenceAdapter,
  ImportPublishPersistenceTerminalResult,
} from "./import-private-persistence-adapter";

export const IMPORT_RESERVATION_RECOVERY_ENABLED = false as const;

export type ImportReservationRecoveryRecord = {
  id: string;
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
  expectedVersion: string;
  status: "reserved" | "in_progress" | "succeeded" | "failed" | "rolled_back";
  expiresAt: string;
  terminalResult: ImportPublishPersistenceTerminalResult | null;
  rollbackSnapshotId: string;
  executionStartedAuditId: string;
};

export interface ImportReservationRecoveryReader {
  readRecoveryRecord(input: {
    entityId: string;
    idempotencyKey: string;
  }): Promise<{ data: ImportReservationRecoveryRecord | null; error: { code?: string; message?: string } | null }>;
  readEntityVersion(entityId: string): Promise<{
    data: { version: string } | null;
    error: { code?: string; message?: string } | null;
  }>;
}

export type ImportReservationRecoveryInput = {
  environment: "development" | "preview" | "production";
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
  auditSchemaVersion: string;
  now: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  executionEnabled: boolean;
};

export type ImportReservationRecoveryBlocker =
  | "recovery_disabled"
  | "environment_not_preview"
  | "actor_not_allowed"
  | "entity_not_allowed"
  | "invalid_input"
  | "reservation_read_failed"
  | "reservation_not_found"
  | "reservation_identity_mismatch"
  | "reservation_not_recoverable"
  | "reservation_not_expired"
  | "entity_read_failed"
  | "entity_version_changed"
  | "terminal_persistence_failed";

export type ImportReservationRecoveryResult = {
  mode: "recovery_disabled" | "recovery_checked" | "recovered" | "replayed";
  recoveryAttempted: boolean;
  recovered: boolean;
  snapshotPreserved: true;
  entityMutationAllowed: false;
  automaticRetryAllowed: false;
  blockers: readonly ImportReservationRecoveryBlocker[];
  terminalResult: ImportPublishPersistenceTerminalResult | null;
};

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function result(
  mode: ImportReservationRecoveryResult["mode"],
  blockers: readonly ImportReservationRecoveryBlocker[],
  options: {
    recoveryAttempted?: boolean;
    recovered?: boolean;
    terminalResult?: ImportPublishPersistenceTerminalResult | null;
  } = {},
): ImportReservationRecoveryResult {
  return {
    mode,
    recoveryAttempted: options.recoveryAttempted ?? false,
    recovered: options.recovered ?? false,
    snapshotPreserved: true,
    entityMutationAllowed: false,
    automaticRetryAllowed: false,
    blockers: [...new Set(blockers)],
    terminalResult: options.terminalResult ?? null,
  };
}

export async function recoverExpiredImportReservation(
  reader: ImportReservationRecoveryReader,
  adapter: ImportPrivatePublishPersistenceAdapter,
  input: ImportReservationRecoveryInput,
): Promise<ImportReservationRecoveryResult> {
  const blockers: ImportReservationRecoveryBlocker[] = [];

  if (!input.executionEnabled) blockers.push("recovery_disabled");
  if (input.environment !== "preview") blockers.push("environment_not_preview");
  if (!input.allowedActorIds.includes(input.actorId)) blockers.push("actor_not_allowed");
  if (!input.allowedEntityIds.includes(input.entityId)) blockers.push("entity_not_allowed");
  if (
    !input.entityId.trim() ||
    !input.actorId.trim() ||
    input.idempotencyKey.trim().length < 8 ||
    !isSha256(input.requestHash) ||
    !input.auditSchemaVersion.trim() ||
    !validDate(input.now)
  ) blockers.push("invalid_input");

  if (blockers.length > 0) return result("recovery_disabled", blockers);

  const recordRead = await reader.readRecoveryRecord({
    entityId: input.entityId,
    idempotencyKey: input.idempotencyKey,
  });
  if (recordRead.error) blockers.push("reservation_read_failed");
  if (!recordRead.data) blockers.push("reservation_not_found");

  const record = recordRead.data;
  if (!record || blockers.length > 0) return result("recovery_checked", blockers);

  if (
    record.entityId !== input.entityId ||
    record.actorId !== input.actorId ||
    record.idempotencyKey !== input.idempotencyKey ||
    record.requestHash !== input.requestHash
  ) blockers.push("reservation_identity_mismatch");

  if (record.terminalResult) {
    return result("replayed", blockers, {
      recovered: record.terminalResult.status === "failed",
      terminalResult: record.terminalResult,
    });
  }

  if (record.status !== "reserved" && record.status !== "in_progress") {
    blockers.push("reservation_not_recoverable");
  }
  if (!validDate(record.expiresAt) || Date.parse(record.expiresAt) > Date.parse(input.now)) {
    blockers.push("reservation_not_expired");
  }

  const entityRead = await reader.readEntityVersion(input.entityId);
  if (entityRead.error || !entityRead.data) blockers.push("entity_read_failed");
  else if (entityRead.data.version !== record.expectedVersion) blockers.push("entity_version_changed");

  if (blockers.length > 0) return result("recovery_checked", blockers);

  const terminalResult: ImportPublishPersistenceTerminalResult = {
    status: "failed",
    entityId: record.entityId,
    idempotencyKey: record.idempotencyKey,
    requestHash: record.requestHash,
    auditEventId: record.executionStartedAuditId,
    rollbackSnapshotId: record.rollbackSnapshotId,
    committedAt: null,
  };

  const persisted = await adapter.persistTerminalResult({
    reservationId: record.id,
    entityId: record.entityId,
    actorId: record.actorId,
    outcome: "failed",
    actualVersion: record.expectedVersion,
    terminalResult,
    auditSchemaVersion: input.auditSchemaVersion,
  });

  if (persisted.kind === "replayed") {
    return result("replayed", [], {
      recoveryAttempted: true,
      recovered: persisted.terminalResult.status === "failed",
      terminalResult: persisted.terminalResult,
    });
  }

  if (persisted.kind !== "persisted") {
    return result("recovery_checked", ["terminal_persistence_failed"], {
      recoveryAttempted: true,
    });
  }

  return result("recovered", [], {
    recoveryAttempted: true,
    recovered: true,
    terminalResult,
  });
}
