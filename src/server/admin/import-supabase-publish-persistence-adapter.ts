import "server-only";

import { createHash } from "node:crypto";

import type {
  ImportPrivatePublishPersistenceAdapter,
  ImportPublishPersistenceTerminalResult,
  ImportPublishPersistenceTerminalWriteRequest,
  ImportPublishPersistenceTerminalWriteResult,
  ImportPublishPersistenceTransactionRequest,
  ImportPublishPersistenceTransactionResult,
} from "./import-private-persistence-adapter";

const RESERVE_RPC = "import_publish_reserve_snapshot_audit";
const TERMINAL_RPC = "import_publish_persist_terminal_result";

export type ImportSupabaseRpcError = {
  code?: string;
  message?: string;
};

export type ImportSupabaseRpcResponse = {
  data: unknown;
  error: ImportSupabaseRpcError | null;
};

export interface ImportSupabaseRpcClient {
  rpc(name: string, params: Record<string, unknown>): Promise<ImportSupabaseRpcResponse>;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function sha256Json(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function durationUnits(expiresAt: string, unitMs: number, min: number, max: number): number | null {
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return null;

  const units = Math.ceil((expiresAtMs - Date.now()) / unitMs);
  if (!Number.isInteger(units) || units < min || units > max) return null;
  return units;
}

function normalizeTerminalResult(value: unknown): ImportPublishPersistenceTerminalResult | null {
  if (!isRecord(value)) return null;

  const status = value.status;
  if (status !== "succeeded" && status !== "failed" && status !== "rolled_back") return null;

  const requiredStrings = [
    value.entityId,
    value.idempotencyKey,
    value.requestHash,
    value.auditEventId,
    value.rollbackSnapshotId,
  ];
  if (requiredStrings.some((item) => typeof item !== "string" || item.length === 0)) return null;
  if (value.committedAt !== null && typeof value.committedAt !== "string") return null;

  return {
    status,
    entityId: value.entityId as string,
    idempotencyKey: value.idempotencyKey as string,
    requestHash: value.requestHash as string,
    auditEventId: value.auditEventId as string,
    rollbackSnapshotId: value.rollbackSnapshotId as string,
    committedAt: value.committedAt as string | null,
  };
}

function normalizeReservationResponse(data: unknown): ImportPublishPersistenceTransactionResult {
  if (!isRecord(data) || typeof data.status !== "string") {
    return { kind: "failed", reason: "rpc_failed" };
  }

  if (data.status === "reserved") {
    if (
      typeof data.idempotencyRecordId !== "string" ||
      typeof data.rollbackSnapshotId !== "string" ||
      typeof data.auditEventId !== "string"
    ) {
      return { kind: "failed", reason: "rpc_failed" };
    }
    return {
      kind: "reserved",
      reservationId: data.idempotencyRecordId,
      rollbackSnapshotId: data.rollbackSnapshotId,
      auditEventId: data.auditEventId,
    };
  }

  if (data.status === "replayed") {
    const terminalResult = normalizeTerminalResult(data.terminalResult);
    return terminalResult
      ? { kind: "replayed", terminalResult }
      : { kind: "failed", reason: "rpc_failed" };
  }

  if (data.status === "conflict") {
    const reason = data.reason;
    if (reason === "request_already_in_progress" || reason === "concurrent_idempotency_conflict") {
      return { kind: "conflict", reason };
    }
    if (reason === "idempotency_request_mismatch") {
      return { kind: "conflict", reason: "idempotency_key_request_hash_mismatch" };
    }
  }

  return { kind: "failed", reason: "rpc_failed" };
}

function normalizeTerminalResponse(
  data: unknown,
  request: ImportPublishPersistenceTerminalWriteRequest,
): ImportPublishPersistenceTerminalWriteResult {
  if (!isRecord(data) || typeof data.status !== "string") {
    return { kind: "failed", reason: "rpc_failed" };
  }

  if (data.status === "replayed") {
    const terminalResult = normalizeTerminalResult(data.terminalResult);
    return terminalResult
      ? { kind: "replayed", terminalResult }
      : { kind: "failed", reason: "rpc_failed" };
  }

  if (data.status === "conflict" && data.reason === "terminal_identity_mismatch") {
    return { kind: "conflict", reason: "terminal_identity_mismatch" };
  }

  if (data.status === "failed") {
    if (data.reason === "idempotency_record_not_found" || data.reason === "rollback_snapshot_not_found") {
      return { kind: "failed", reason: data.reason };
    }
    return { kind: "failed", reason: "rpc_failed" };
  }

  if (
    (data.status === "succeeded" || data.status === "failed" || data.status === "rolled_back") &&
    typeof data.idempotencyRecordId === "string" &&
    typeof data.auditEventId === "string"
  ) {
    return {
      kind: "persisted",
      reservationId: data.idempotencyRecordId,
      auditEventId: data.auditEventId,
      outcome: request.outcome,
    };
  }

  return { kind: "failed", reason: "rpc_failed" };
}

export function createImportSupabasePublishPersistenceAdapter(
  client: ImportSupabaseRpcClient,
): ImportPrivatePublishPersistenceAdapter {
  return {
    async runReservationSnapshotAuditTransaction(
      request: ImportPublishPersistenceTransactionRequest,
    ): Promise<ImportPublishPersistenceTransactionResult> {
      const reservationTtlHours = durationUnits(request.reservationExpiresAt, 60 * 60 * 1000, 24, 168);
      const rollbackRetentionDays = durationUnits(request.rollbackExpiresAt, 24 * 60 * 60 * 1000, 30, 365);

      if (reservationTtlHours === null || rollbackRetentionDays === null) {
        return { kind: "failed", reason: "transaction_aborted" };
      }

      const response = await client.rpc(RESERVE_RPC, {
        p_entity_id: request.entityId,
        p_actor_profile_id: request.actorId,
        p_idempotency_key: request.idempotencyKey,
        p_request_hash: request.requestHash,
        p_expected_version: request.expectedVersion,
        p_snapshot_payload: request.rollbackSnapshot,
        p_snapshot_hash: sha256Json(request.rollbackSnapshot),
        p_audit_schema_version: request.auditSchemaVersion,
        p_reservation_ttl_hours: reservationTtlHours,
        p_rollback_retention_days: rollbackRetentionDays,
      });

      if (response.error) return { kind: "failed", reason: "rpc_failed" };
      return normalizeReservationResponse(response.data);
    },

    async persistTerminalResult(
      request: ImportPublishPersistenceTerminalWriteRequest,
    ): Promise<ImportPublishPersistenceTerminalWriteResult> {
      const response = await client.rpc(TERMINAL_RPC, {
        p_idempotency_record_id: request.reservationId,
        p_entity_id: request.entityId,
        p_actor_profile_id: request.actorId,
        p_outcome: request.outcome,
        p_actual_version: request.actualVersion,
        p_terminal_result: request.terminalResult,
        p_audit_schema_version: request.auditSchemaVersion,
      });

      if (response.error) return { kind: "failed", reason: "rpc_failed" };
      return normalizeTerminalResponse(response.data, request);
    },
  };
}
