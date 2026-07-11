import "server-only";

export type ImportPublishReservationSnapshotBlocker =
  | "dry_run_plan_not_ready"
  | "persistence_schema_not_ready"
  | "transaction_coordinator_unavailable"
  | "entity_id_missing"
  | "actor_id_missing"
  | "idempotency_key_missing"
  | "request_hash_invalid"
  | "expected_version_missing"
  | "rollback_snapshot_incomplete"
  | "audit_schema_version_missing"
  | "reservation_ttl_invalid"
  | "rollback_retention_invalid"
  | "persistence_not_enabled";

export type ImportPublishReservationSnapshotTransactionInput = {
  dryRunPlanReady: boolean;
  persistenceSchemaReady: boolean;
  transactionCoordinatorAvailable: boolean;
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
  expectedVersion: string;
  rollbackSnapshotComplete: boolean;
  auditSchemaVersion: string;
  reservationTtlHours: number;
  rollbackRetentionDays: number;
  persistenceEnabled: false;
};

export type ImportPublishReservationSnapshotTransactionPlan = {
  mode: "transaction_contract_only";
  contractReady: boolean;
  persistenceReady: false;
  executionReady: false;
  mutationEnabled: false;
  bulkAllowed: false;
  blockers: readonly ImportPublishReservationSnapshotBlocker[];
  orderedOperations: readonly [
    "reserve_idempotency_key",
    "capture_rollback_snapshot",
    "append_execution_started_audit",
  ];
  atomicity: "single_transaction";
  conflictBehavior: "return_existing_terminal_result_or_fail_closed";
  databaseOperations: readonly [];
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export function getImportPublishReservationSnapshotTransactionPlan(
  input: ImportPublishReservationSnapshotTransactionInput,
): ImportPublishReservationSnapshotTransactionPlan {
  const blockers: ImportPublishReservationSnapshotBlocker[] = [];
  if (!input.dryRunPlanReady) blockers.push("dry_run_plan_not_ready");
  if (!input.persistenceSchemaReady) blockers.push("persistence_schema_not_ready");
  if (!input.transactionCoordinatorAvailable) blockers.push("transaction_coordinator_unavailable");
  if (!input.entityId.trim()) blockers.push("entity_id_missing");
  if (!input.actorId.trim()) blockers.push("actor_id_missing");
  if (!input.idempotencyKey.trim()) blockers.push("idempotency_key_missing");
  if (!SHA256_PATTERN.test(input.requestHash)) blockers.push("request_hash_invalid");
  if (!input.expectedVersion.trim()) blockers.push("expected_version_missing");
  if (!input.rollbackSnapshotComplete) blockers.push("rollback_snapshot_incomplete");
  if (!input.auditSchemaVersion.trim()) blockers.push("audit_schema_version_missing");
  if (input.reservationTtlHours < 24 || input.reservationTtlHours > 168) blockers.push("reservation_ttl_invalid");
  if (input.rollbackRetentionDays < 30 || input.rollbackRetentionDays > 365) blockers.push("rollback_retention_invalid");
  if (!input.persistenceEnabled) blockers.push("persistence_not_enabled");

  const uniqueBlockers = [...new Set(blockers)];
  const contractBlockers = uniqueBlockers.filter((blocker) => blocker !== "persistence_not_enabled");
  return {
    mode: "transaction_contract_only",
    contractReady: contractBlockers.length === 0,
    persistenceReady: false,
    executionReady: false,
    mutationEnabled: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
    orderedOperations: [
      "reserve_idempotency_key",
      "capture_rollback_snapshot",
      "append_execution_started_audit",
    ],
    atomicity: "single_transaction",
    conflictBehavior: "return_existing_terminal_result_or_fail_closed",
    databaseOperations: [],
  };
}

export function isImportPublishReservationSnapshotTransactionContractReady(
  input: ImportPublishReservationSnapshotTransactionInput,
): boolean {
  return getImportPublishReservationSnapshotTransactionPlan(input).contractReady;
}
