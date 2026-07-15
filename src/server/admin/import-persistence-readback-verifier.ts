import "server-only";

const MAX_ROWS_PER_READ = 2;

export type ImportReservationAuditSignature = "execution_started" | "reservation_created";

type ReadbackResponse<T> = {
  data: readonly T[] | null;
  error: { message?: string } | null;
};

export type ImportPersistenceAuthorizationRow = {
  id: string;
  review_state_id: string;
  actor_profile_id: string;
  entity_id: string;
  review_snapshot_hash: string;
  entity_fingerprint: string;
  operation_attempt_id: string;
  idempotency_key: string;
  request_hash: string;
  patch_hash: string;
  expected_entity_version: string;
  entity_family: string;
  operation_scope: string;
  status: string;
  consumed_by_reservation_id: string | null;
};

export type ImportPersistenceIdempotencyRow = {
  id: string;
  entity_id: string;
  actor_profile_id: string;
  idempotency_key: string;
  expected_version: string;
  request_hash: string;
  status: string;
  pharmacy_authorization_id: string | null;
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
  event_type: ImportReservationAuditSignature;
  outcome: string;
  expected_version: string;
  phase: string | null;
  request_hash: string | null;
  authorization_id: string | null;
  review_snapshot_hash: string | null;
  entity_fingerprint: string | null;
  operation_attempt_id: string | null;
  patch_hash: string | null;
  entity_family: string | null;
  operation_scope: string | null;
};

export type ImportPersistenceReadbackClient = {
  readAuthorizationRows(input: {
    authorizationId: string;
    limit: 2;
  }): Promise<ReadbackResponse<ImportPersistenceAuthorizationRow>>;
  readIdempotencyRows(input: {
    reservationId: string;
    limit: 2;
  }): Promise<ReadbackResponse<ImportPersistenceIdempotencyRow>>;
  readRollbackRows(input: {
    reservationId: string;
    limit: 2;
  }): Promise<ReadbackResponse<ImportPersistenceRollbackRow>>;
  readAuditRows(input: {
    reservationId: string;
    eventTypes: readonly ["execution_started", "reservation_created"];
    limit: 2;
  }): Promise<ReadbackResponse<ImportPersistenceAuditRow>>;
  readEntityFingerprint(input: {
    entityId: string;
    limit: 2;
  }): Promise<ReadbackResponse<{ fingerprint: string; version: string }>>;
};

export type ImportPersistenceReadbackVerificationInput = {
  entityId: string;
  actorId: string;
  authorizationId: string;
  reviewStateId: string;
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  expectedVersion: string;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
  expectedReservationId: string;
  expectedRollbackSnapshotId: string;
  expectedAuditEventId: string;
  entityFamily: "pharmacy";
  operationScope: "reserve_private_publish";
};

export type ImportPersistenceReadbackBlocker =
  | "invalid_verification_input"
  | "authorization_read_failed"
  | "authorization_row_count_invalid"
  | "authorization_identity_mismatch"
  | "authorization_not_consumed"
  | "authorization_reservation_linkage_mismatch"
  | "idempotency_read_failed"
  | "idempotency_row_count_invalid"
  | "idempotency_identity_mismatch"
  | "rollback_read_failed"
  | "rollback_row_count_invalid"
  | "rollback_linkage_mismatch"
  | "audit_read_failed"
  | "audit_row_count_invalid"
  | "audit_linkage_mismatch"
  | "audit_identity_mismatch"
  | "entity_read_failed"
  | "entity_fingerprint_row_count_invalid"
  | "entity_changed";

export type ImportPersistenceReadbackVerificationResult = {
  verified: boolean;
  entityUnchanged: boolean;
  counts: {
    authorization: number;
    idempotency: number;
    rollbackSnapshot: number;
    reservationAudit: number;
    executionStartedAudit: number;
    reservationCreatedAudit: number;
    entityFingerprint: number;
  };
  findings: {
    duplicateCount: number;
    orphanCount: number;
    auditGapCount: number;
  };
  auditSignature: ImportReservationAuditSignature | null;
  blockers: readonly ImportPersistenceReadbackBlocker[];
  rawPayloadExposed: false;
  writeAllowed: false;
  publicEndpointAllowed: false;
  adminEndpointAllowed: false;
};

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function rowCount<T>(response: ReadbackResponse<T>): number {
  return response.data?.length ?? 0;
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

export async function verifyImportPersistenceReadback(
  client: ImportPersistenceReadbackClient,
  input: ImportPersistenceReadbackVerificationInput,
): Promise<ImportPersistenceReadbackVerificationResult> {
  if (
    [
      input.entityId,
      input.actorId,
      input.authorizationId,
      input.reviewStateId,
      input.operationAttemptId,
      input.idempotencyKey,
      input.expectedVersion,
      input.expectedReservationId,
      input.expectedRollbackSnapshotId,
      input.expectedAuditEventId,
    ].some((value) => !isNonEmpty(value)) ||
    !isSha256(input.requestHash) ||
    !isSha256(input.patchHash) ||
    !isSha256(input.expectedSnapshotHash) ||
    !isSha256(input.expectedEntityFingerprint)
  ) {
    return {
      verified: false,
      entityUnchanged: false,
      counts: {
        authorization: 0,
        idempotency: 0,
        rollbackSnapshot: 0,
        reservationAudit: 0,
        executionStartedAudit: 0,
        reservationCreatedAudit: 0,
        entityFingerprint: 0,
      },
      findings: { duplicateCount: 0, orphanCount: 0, auditGapCount: 0 },
      auditSignature: null,
      blockers: ["invalid_verification_input"],
      rawPayloadExposed: false,
      writeAllowed: false,
      publicEndpointAllowed: false,
      adminEndpointAllowed: false,
    };
  }

  const [authorizationRead, idempotencyRead, rollbackRead, auditRead, entityRead] = await Promise.all([
    client.readAuthorizationRows({ authorizationId: input.authorizationId, limit: MAX_ROWS_PER_READ }),
    client.readIdempotencyRows({ reservationId: input.expectedReservationId, limit: MAX_ROWS_PER_READ }),
    client.readRollbackRows({ reservationId: input.expectedReservationId, limit: MAX_ROWS_PER_READ }),
    client.readAuditRows({
      reservationId: input.expectedReservationId,
      eventTypes: ["execution_started", "reservation_created"],
      limit: MAX_ROWS_PER_READ,
    }),
    client.readEntityFingerprint({ entityId: input.entityId, limit: MAX_ROWS_PER_READ }),
  ]);

  const blockers: ImportPersistenceReadbackBlocker[] = [];
  const authorizationCount = rowCount(authorizationRead);
  const idempotencyCount = rowCount(idempotencyRead);
  const rollbackCount = rowCount(rollbackRead);
  const auditCount = rowCount(auditRead);
  const entityCount = rowCount(entityRead);

  if (authorizationRead.error) blockers.push("authorization_read_failed");
  if (authorizationCount !== 1) blockers.push("authorization_row_count_invalid");
  if (idempotencyRead.error) blockers.push("idempotency_read_failed");
  if (idempotencyCount !== 1) blockers.push("idempotency_row_count_invalid");
  if (rollbackRead.error) blockers.push("rollback_read_failed");
  if (rollbackCount !== 1) blockers.push("rollback_row_count_invalid");
  if (auditRead.error) blockers.push("audit_read_failed");
  if (auditCount !== 1) blockers.push("audit_row_count_invalid");
  if (entityRead.error) blockers.push("entity_read_failed");
  if (entityCount !== 1) blockers.push("entity_fingerprint_row_count_invalid");

  const authorization = authorizationRead.data?.[0];
  const idempotency = idempotencyRead.data?.[0];
  const rollback = rollbackRead.data?.[0];
  const audit = auditRead.data?.[0];
  const entity = entityRead.data?.[0];

  if (authorization && (
    authorization.id !== input.authorizationId ||
    authorization.review_state_id !== input.reviewStateId ||
    authorization.actor_profile_id !== input.actorId ||
    authorization.entity_id !== input.entityId ||
    authorization.review_snapshot_hash !== input.expectedSnapshotHash ||
    authorization.entity_fingerprint !== input.expectedEntityFingerprint ||
    authorization.operation_attempt_id !== input.operationAttemptId ||
    authorization.idempotency_key !== input.idempotencyKey ||
    authorization.request_hash !== input.requestHash ||
    authorization.patch_hash !== input.patchHash ||
    authorization.expected_entity_version !== input.expectedVersion ||
    authorization.entity_family !== input.entityFamily ||
    authorization.operation_scope !== input.operationScope
  )) blockers.push("authorization_identity_mismatch");
  if (authorization && authorization.status !== "consumed") blockers.push("authorization_not_consumed");
  if (authorization && authorization.consumed_by_reservation_id !== input.expectedReservationId) {
    blockers.push("authorization_reservation_linkage_mismatch");
  }

  if (idempotency && (
    idempotency.id !== input.expectedReservationId ||
    idempotency.entity_id !== input.entityId ||
    idempotency.actor_profile_id !== input.actorId ||
    idempotency.idempotency_key !== input.idempotencyKey ||
    idempotency.expected_version !== input.expectedVersion ||
    idempotency.request_hash !== input.requestHash ||
    idempotency.status !== "reserved"
  )) blockers.push("idempotency_identity_mismatch");
  if (idempotency && idempotency.pharmacy_authorization_id !== input.authorizationId) {
    blockers.push("authorization_reservation_linkage_mismatch");
  }

  if (rollback && (
    rollback.id !== input.expectedRollbackSnapshotId ||
    rollback.entity_id !== input.entityId ||
    rollback.actor_profile_id !== input.actorId ||
    rollback.idempotency_record_id !== input.expectedReservationId ||
    rollback.expected_version !== input.expectedVersion ||
    rollback.snapshot_hash !== input.expectedSnapshotHash
  )) blockers.push("rollback_linkage_mismatch");

  if (audit && (
    audit.id !== input.expectedAuditEventId ||
    audit.entity_id !== input.entityId ||
    audit.actor_profile_id !== input.actorId ||
    audit.idempotency_record_id !== input.expectedReservationId ||
    audit.rollback_snapshot_id !== input.expectedRollbackSnapshotId
  )) blockers.push("audit_linkage_mismatch");
  if (audit && (
    audit.outcome !== "pending" ||
    audit.expected_version !== input.expectedVersion ||
    audit.phase !== "reservation" ||
    audit.request_hash !== input.requestHash ||
    audit.authorization_id !== input.authorizationId ||
    audit.review_snapshot_hash !== input.expectedSnapshotHash ||
    audit.entity_fingerprint !== input.expectedEntityFingerprint ||
    audit.operation_attempt_id !== input.operationAttemptId ||
    audit.patch_hash !== input.patchHash ||
    audit.entity_family !== input.entityFamily ||
    audit.operation_scope !== input.operationScope
  )) blockers.push("audit_identity_mismatch");

  const entityUnchanged = entityCount === 1 &&
    entity?.fingerprint === input.expectedEntityFingerprint &&
    entity.version === input.expectedVersion;
  if (!entityUnchanged) blockers.push("entity_changed");

  const executionStartedAudit = auditRead.data?.filter((row) => row.event_type === "execution_started").length ?? 0;
  const reservationCreatedAudit = auditRead.data?.filter((row) => row.event_type === "reservation_created").length ?? 0;
  const orphanCount = Number(Boolean(idempotency && !authorization)) +
    Number(Boolean(authorization && !idempotency)) +
    Number(Boolean(idempotency && !rollback)) +
    Number(Boolean(authorization && authorization.consumed_by_reservation_id !== input.expectedReservationId)) +
    Number(Boolean(idempotency && idempotency.pharmacy_authorization_id !== input.authorizationId)) +
    Number(Boolean(rollback && rollback.idempotency_record_id !== input.expectedReservationId)) +
    Number(Boolean(audit && (
      audit.idempotency_record_id !== input.expectedReservationId ||
      audit.rollback_snapshot_id !== input.expectedRollbackSnapshotId
    )));

  const resultBlockers = unique(blockers);
  return {
    verified: resultBlockers.length === 0,
    entityUnchanged,
    counts: {
      authorization: authorizationCount,
      idempotency: idempotencyCount,
      rollbackSnapshot: rollbackCount,
      reservationAudit: auditCount,
      executionStartedAudit,
      reservationCreatedAudit,
      entityFingerprint: entityCount,
    },
    findings: {
      duplicateCount: [authorizationCount, idempotencyCount, rollbackCount, auditCount, entityCount]
        .reduce((total, count) => total + Math.max(0, count - 1), 0),
      orphanCount,
      auditGapCount: auditCount === 1 ? 0 : 1,
    },
    auditSignature: auditCount === 1 ? audit?.event_type ?? null : null,
    blockers: resultBlockers,
    rawPayloadExposed: false,
    writeAllowed: false,
    publicEndpointAllowed: false,
    adminEndpointAllowed: false,
  };
}
