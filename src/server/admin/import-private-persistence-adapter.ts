import "server-only";

import type { ImportControlledPublishState } from "./import-controlled-publish-dry-run-executor";

export type ImportPublishPersistenceAdapterBlocker =
  | "transaction_contract_not_ready"
  | "private_server_boundary_missing"
  | "atomic_transaction_missing"
  | "idempotency_reservation_missing"
  | "rollback_snapshot_write_missing"
  | "audit_event_write_missing"
  | "replay_lookup_missing"
  | "conflict_detection_missing"
  | "terminal_result_write_missing"
  | "adapter_not_enabled";

export type ImportPublishPersistenceTransactionRequest = {
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
  expectedVersion: string;
  rollbackSnapshot: ImportControlledPublishState;
  auditSchemaVersion: string;
  reservationExpiresAt: string;
  rollbackExpiresAt: string;
};

export type ImportPublishPersistenceTerminalResult = {
  status: "succeeded" | "failed" | "rolled_back";
  entityId: string;
  idempotencyKey: string;
  requestHash: string;
  auditEventId: string;
  rollbackSnapshotId: string;
  committedAt: string | null;
};

export type ImportPublishPersistenceTransactionResult =
  | {
      kind: "reserved";
      reservationId: string;
      rollbackSnapshotId: string;
      auditEventId: string;
    }
  | {
      kind: "replayed";
      terminalResult: ImportPublishPersistenceTerminalResult;
    }
  | {
      kind: "conflict";
      reason: "idempotency_key_request_hash_mismatch" | "expected_version_mismatch";
    }
  | {
      kind: "failed";
      reason: "transaction_aborted";
    };

export interface ImportPrivatePublishPersistenceAdapter {
  runReservationSnapshotAuditTransaction(
    request: ImportPublishPersistenceTransactionRequest,
  ): Promise<ImportPublishPersistenceTransactionResult>;

  persistTerminalResult(
    result: ImportPublishPersistenceTerminalResult,
  ): Promise<void>;
}

export type ImportPublishPersistenceAdapterReadinessInput = {
  transactionContractReady: boolean;
  privateServerBoundaryPresent: boolean;
  atomicTransactionSupported: boolean;
  idempotencyReservationSupported: boolean;
  rollbackSnapshotWriteSupported: boolean;
  auditEventWriteSupported: boolean;
  replayLookupSupported: boolean;
  conflictDetectionSupported: boolean;
  terminalResultWriteSupported: boolean;
  adapterEnabled: false;
};

export type ImportPublishPersistenceAdapterReadiness = {
  mode: "private_adapter_contract_only";
  contractReady: boolean;
  adapterReady: false;
  executionReady: false;
  mutationEnabled: false;
  bulkAllowed: false;
  blockers: readonly ImportPublishPersistenceAdapterBlocker[];
  allowedResultKinds: readonly ["reserved", "replayed", "conflict", "failed"];
  databaseOperations: readonly [];
};

export function getImportPublishPersistenceAdapterReadiness(
  input: ImportPublishPersistenceAdapterReadinessInput,
): ImportPublishPersistenceAdapterReadiness {
  const blockers: ImportPublishPersistenceAdapterBlocker[] = [];

  if (!input.transactionContractReady) blockers.push("transaction_contract_not_ready");
  if (!input.privateServerBoundaryPresent) blockers.push("private_server_boundary_missing");
  if (!input.atomicTransactionSupported) blockers.push("atomic_transaction_missing");
  if (!input.idempotencyReservationSupported) blockers.push("idempotency_reservation_missing");
  if (!input.rollbackSnapshotWriteSupported) blockers.push("rollback_snapshot_write_missing");
  if (!input.auditEventWriteSupported) blockers.push("audit_event_write_missing");
  if (!input.replayLookupSupported) blockers.push("replay_lookup_missing");
  if (!input.conflictDetectionSupported) blockers.push("conflict_detection_missing");
  if (!input.terminalResultWriteSupported) blockers.push("terminal_result_write_missing");
  if (!input.adapterEnabled) blockers.push("adapter_not_enabled");

  const uniqueBlockers = [...new Set(blockers)];
  const contractBlockers = uniqueBlockers.filter((blocker) => blocker !== "adapter_not_enabled");

  return {
    mode: "private_adapter_contract_only",
    contractReady: contractBlockers.length === 0,
    adapterReady: false,
    executionReady: false,
    mutationEnabled: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
    allowedResultKinds: ["reserved", "replayed", "conflict", "failed"],
    databaseOperations: [],
  };
}

export function isImportPublishPersistenceAdapterContractReady(
  input: ImportPublishPersistenceAdapterReadinessInput,
): boolean {
  return getImportPublishPersistenceAdapterReadiness(input).contractReady;
}
