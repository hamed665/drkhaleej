import "server-only";

const MAX_ROWS_PER_READ = 2 as const;

export type ImportPersistenceReadbackError = {
  code?: string;
  message?: string;
};

export type ImportPersistenceReadResult<T> = {
  data: readonly T[] | null;
  error: ImportPersistenceReadbackError | null;
};

export type ImportPersistenceIdempotencyRow = {
  id: string;
  entity_id: string;
  actor_profile_id: string;
  idempotency_key: string;
  expected_version: string;
  request_hash: string;
  status: string;
};

export type ImportPersistenceRollbackRow = {
  id: string;
  entity_id: string;
  actor_profile_id: string;
  idempotency_record_id: string;
  expected_version: string;
  snapshot_hash: string;
};

export type ImportPersistenceAuditRow = {
  id: string;
  entity_id: string;
  actor_profile_id: string;
  idempotency_record_id: string;
  rollback_snapshot_id: string | null;
  event_type: string;
  outcome: string;
  expected_version: string;
};

export interface ImportPersistenceReadbackClient {
  readIdempotencyRows(input: {
    entityId: string;
    idempotencyKey: string;
    requestHash: string;
    limit: typeof MAX_ROWS_PER_READ;
  }): Promise<ImportPersistenceReadResult<ImportPersistenceIdempotencyRow>>;
  readRollbackRows(input: {
    entityId: string;
    idempotencyRecordId: string;
    limit: typeof MAX_ROWS_PER_READ;
  }): Promise<ImportPersistenceReadResult<ImportPersistenceRollbackRow>>;
  readAuditRows(input: {
    entityId: string;
    idempotencyRecordId: string;
    eventType: "execution_started";
    limit: typeof MAX_ROWS_PER_READ;
  }): Promise<ImportPersistenceReadResult<ImportPersistenceAuditRow>>;
  readEntityFingerprint(entityId: string): Promise<ImportPersistenceReadResult<{ fingerprint: string }>>;
}

export type ImportPersistenceReadbackVerificationInput = {
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
  expectedVersion: string;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
};

export type ImportPersistenceReadbackBlocker =
  | "invalid_verification_input"
  | "idempotency_read_failed"
  | "idempotency_row_count_invalid"
  | "idempotency_identity_mismatch"
  | "rollback_read_failed"
  | "rollback_row_count_invalid"
  | "rollback_linkage_mismatch"
  | "audit_read_failed"
  | "audit_row_count_invalid"
  | "audit_linkage_mismatch"
  | "entity_read_failed"
  | "entity_row_count_invalid"
  | "entity_changed";

export type ImportPersistenceReadbackVerificationResult = {
  verified: boolean;
  entityUnchanged: boolean;
  counts: {
    idempotency: number;
    rollbackSnapshot: number;
    executionStartedAudit: number;
    entityFingerprint: number;
  };
  recordIds: {
    idempotencyRecordId: string | null;
    rollbackSnapshotId: string | null;
    auditEventId: string | null;
  };
  blockers: readonly ImportPersistenceReadbackBlocker[];
  rawPayloadExposed: false;
  writeAllowed: false;
  publicEndpointAllowed: false;
  adminEndpointAllowed: false;
};

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export async function verifyImportPersistenceReadback(
  client: ImportPersistenceReadbackClient,
  input: ImportPersistenceReadbackVerificationInput,
): Promise<ImportPersistenceReadbackVerificationResult> {
  const blockers: ImportPersistenceReadbackBlocker[] = [];

  if (
    !isNonEmpty(input.entityId) ||
    !isNonEmpty(input.actorId) ||
    !isNonEmpty(input.idempotencyKey) ||
    !isSha256(input.requestHash) ||
    !isNonEmpty(input.expectedVersion) ||
    !isSha256(input.expectedSnapshotHash) ||
    !isSha256(input.expectedEntityFingerprint)
  ) {
    blockers.push("invalid_verification_input");
  }

  let idempotencyRows: readonly ImportPersistenceIdempotencyRow[] = [];
  let rollbackRows: readonly ImportPersistenceRollbackRow[] = [];
  let auditRows: readonly ImportPersistenceAuditRow[] = [];
  let entityRows: readonly { fingerprint: string }[] = [];

  if (blockers.length === 0) {
    const idempotencyRead = await client.readIdempotencyRows({
      entityId: input.entityId,
      idempotencyKey: input.idempotencyKey,
      requestHash: input.requestHash,
      limit: MAX_ROWS_PER_READ,
    });

    if (idempotencyRead.error || !idempotencyRead.data) blockers.push("idempotency_read_failed");
    else idempotencyRows = idempotencyRead.data;
  }

  const idempotencyRow = idempotencyRows.length === 1 ? idempotencyRows[0] : null;
  if (blockers.length === 0 && !idempotencyRow) blockers.push("idempotency_row_count_invalid");
  if (
    idempotencyRow &&
    (idempotencyRow.entity_id !== input.entityId ||
      idempotencyRow.actor_profile_id !== input.actorId ||
      idempotencyRow.idempotency_key !== input.idempotencyKey ||
      idempotencyRow.request_hash !== input.requestHash ||
      idempotencyRow.expected_version !== input.expectedVersion ||
      (idempotencyRow.status !== "reserved" && idempotencyRow.status !== "in_progress"))
  ) {
    blockers.push("idempotency_identity_mismatch");
  }

  if (idempotencyRow) {
    const [rollbackRead, auditRead, entityRead] = await Promise.all([
      client.readRollbackRows({
        entityId: input.entityId,
        idempotencyRecordId: idempotencyRow.id,
        limit: MAX_ROWS_PER_READ,
      }),
      client.readAuditRows({
        entityId: input.entityId,
        idempotencyRecordId: idempotencyRow.id,
        eventType: "execution_started",
        limit: MAX_ROWS_PER_READ,
      }),
      client.readEntityFingerprint(input.entityId),
    ]);

    if (rollbackRead.error || !rollbackRead.data) blockers.push("rollback_read_failed");
    else rollbackRows = rollbackRead.data;

    if (auditRead.error || !auditRead.data) blockers.push("audit_read_failed");
    else auditRows = auditRead.data;

    if (entityRead.error || !entityRead.data) blockers.push("entity_read_failed");
    else entityRows = entityRead.data;
  }

  const rollbackRow = rollbackRows.length === 1 ? rollbackRows[0] : null;
  if (idempotencyRow && !rollbackRow && !blockers.includes("rollback_read_failed")) {
    blockers.push("rollback_row_count_invalid");
  }
  if (
    rollbackRow &&
    (rollbackRow.entity_id !== input.entityId ||
      rollbackRow.actor_profile_id !== input.actorId ||
      rollbackRow.idempotency_record_id !== idempotencyRow?.id ||
      rollbackRow.expected_version !== input.expectedVersion ||
      rollbackRow.snapshot_hash !== input.expectedSnapshotHash)
  ) {
    blockers.push("rollback_linkage_mismatch");
  }

  const auditRow = auditRows.length === 1 ? auditRows[0] : null;
  if (idempotencyRow && !auditRow && !blockers.includes("audit_read_failed")) {
    blockers.push("audit_row_count_invalid");
  }
  if (
    auditRow &&
    (auditRow.entity_id !== input.entityId ||
      auditRow.actor_profile_id !== input.actorId ||
      auditRow.idempotency_record_id !== idempotencyRow?.id ||
      auditRow.rollback_snapshot_id !== rollbackRow?.id ||
      auditRow.event_type !== "execution_started" ||
      auditRow.outcome !== "pending" ||
      auditRow.expected_version !== input.expectedVersion)
  ) {
    blockers.push("audit_linkage_mismatch");
  }

  const entityRow = entityRows.length === 1 ? entityRows[0] : null;
  if (idempotencyRow && !entityRow && !blockers.includes("entity_read_failed")) {
    blockers.push("entity_row_count_invalid");
  }
  if (entityRow && entityRow.fingerprint !== input.expectedEntityFingerprint) blockers.push("entity_changed");

  const uniqueBlockers = [...new Set(blockers)];
  return {
    verified: uniqueBlockers.length === 0,
    entityUnchanged: Boolean(entityRow && entityRow.fingerprint === input.expectedEntityFingerprint),
    counts: {
      idempotency: idempotencyRows.length,
      rollbackSnapshot: rollbackRows.length,
      executionStartedAudit: auditRows.length,
      entityFingerprint: entityRows.length,
    },
    recordIds: {
      idempotencyRecordId: idempotencyRow?.id ?? null,
      rollbackSnapshotId: rollbackRow?.id ?? null,
      auditEventId: auditRow?.id ?? null,
    },
    blockers: uniqueBlockers,
    rawPayloadExposed: false,
    writeAllowed: false,
    publicEndpointAllowed: false,
    adminEndpointAllowed: false,
  };
}
