import "server-only";

import {
  buildPharmacyPrivateAdminEntityFingerprint,
  PHARMACY_PRIVATE_ADMIN_CENTER_SELECT,
  type PharmacyPrivateAdminRuntimeCenter,
} from "./import-pharmacy-private-admin-runtime-context";
import type {
  ImportPersistenceAuditRow,
  ImportPersistenceAuthorizationRow,
  ImportPersistenceIdempotencyRow,
  ImportPersistenceReadbackClient,
  ImportPersistenceRollbackRow,
  ImportReservationAuditSignature,
} from "./import-persistence-readback-verifier";

type JsonRecord = Record<string, unknown>;
type ImportSupabaseReadResponse = {
  data: readonly JsonRecord[] | null;
  error: { message?: string } | null;
};

export type ImportSupabaseReadQuery = {
  eq(column: string, value: string): ImportSupabaseReadQuery;
  in(column: string, values: readonly string[]): ImportSupabaseReadQuery;
  limit(count: number): Promise<ImportSupabaseReadResponse>;
};

export type ImportSupabasePersistenceReadClient = {
  from(table: string): {
    select(columns: string): ImportSupabaseReadQuery;
  };
};

const AUTHORIZATION_SELECT = "id,review_state_id,actor_profile_id,entity_id,review_snapshot_hash,entity_fingerprint,operation_attempt_id,idempotency_key,request_hash,patch_hash,expected_entity_version,entity_family,operation_scope,status,consumed_by_reservation_id";
const IDEMPOTENCY_SELECT = "id,entity_id,actor_profile_id,idempotency_key,expected_version,request_hash,status,pharmacy_authorization_id";
const ROLLBACK_SELECT = "id,entity_id,actor_profile_id,idempotency_record_id,expected_version,snapshot_hash";
const AUDIT_SELECT = "id,entity_id,actor_profile_id,idempotency_record_id,rollback_snapshot_id,event_type,outcome,expected_version,event_payload";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readError(error: { message?: string } | null): { message?: string } | null {
  if (!error) return null;
  return error.message ? { message: error.message } : {};
}

function mapAuthorization(row: JsonRecord): ImportPersistenceAuthorizationRow {
  return {
    id: stringValue(row.id),
    review_state_id: stringValue(row.review_state_id),
    actor_profile_id: stringValue(row.actor_profile_id),
    entity_id: stringValue(row.entity_id),
    review_snapshot_hash: stringValue(row.review_snapshot_hash),
    entity_fingerprint: stringValue(row.entity_fingerprint),
    operation_attempt_id: stringValue(row.operation_attempt_id),
    idempotency_key: stringValue(row.idempotency_key),
    request_hash: stringValue(row.request_hash),
    patch_hash: stringValue(row.patch_hash),
    expected_entity_version: stringValue(row.expected_entity_version),
    entity_family: stringValue(row.entity_family),
    operation_scope: stringValue(row.operation_scope),
    status: stringValue(row.status),
    consumed_by_reservation_id: nullableString(row.consumed_by_reservation_id),
  };
}

function mapIdempotency(row: JsonRecord): ImportPersistenceIdempotencyRow {
  return {
    id: stringValue(row.id),
    entity_id: stringValue(row.entity_id),
    actor_profile_id: stringValue(row.actor_profile_id),
    idempotency_key: stringValue(row.idempotency_key),
    expected_version: stringValue(row.expected_version),
    request_hash: stringValue(row.request_hash),
    status: stringValue(row.status),
    pharmacy_authorization_id: nullableString(row.pharmacy_authorization_id),
  };
}

function mapRollback(row: JsonRecord): ImportPersistenceRollbackRow {
  return {
    id: stringValue(row.id),
    entity_id: stringValue(row.entity_id),
    actor_profile_id: stringValue(row.actor_profile_id),
    idempotency_record_id: stringValue(row.idempotency_record_id),
    expected_version: stringValue(row.expected_version),
    snapshot_hash: stringValue(row.snapshot_hash),
  };
}

function mapAudit(row: JsonRecord): ImportPersistenceAuditRow {
  const details = isRecord(row.event_payload) ? row.event_payload : {};
  return {
    id: stringValue(row.id),
    entity_id: stringValue(row.entity_id),
    actor_profile_id: stringValue(row.actor_profile_id),
    idempotency_record_id: stringValue(row.idempotency_record_id),
    rollback_snapshot_id: nullableString(row.rollback_snapshot_id),
    event_type: stringValue(row.event_type) as ImportReservationAuditSignature,
    outcome: stringValue(row.outcome),
    expected_version: stringValue(row.expected_version),
    phase: nullableString(details.phase),
    request_hash: nullableString(details.requestHash),
    authorization_id: nullableString(details.authorizationId),
    review_snapshot_hash: nullableString(details.reviewSnapshotHash),
    entity_fingerprint: nullableString(details.entityFingerprint),
    operation_attempt_id: nullableString(details.operationAttemptId),
    patch_hash: nullableString(details.patchHash),
    entity_family: nullableString(details.entityFamily),
    operation_scope: nullableString(details.operationScope),
  };
}

export function createImportSupabasePersistenceReadbackClient(
  client: ImportSupabasePersistenceReadClient,
): ImportPersistenceReadbackClient {
  return {
    async readAuthorizationRows(input) {
      const response = await client.from("import_pharmacy_publish_authorizations")
        .select(AUTHORIZATION_SELECT)
        .eq("id", input.authorizationId)
        .limit(input.limit);
      return { data: response.data?.map(mapAuthorization) ?? null, error: readError(response.error) };
    },
    async readIdempotencyRows(input) {
      const response = await client.from("import_publish_idempotency_records")
        .select(IDEMPOTENCY_SELECT)
        .eq("id", input.reservationId)
        .limit(input.limit);
      return { data: response.data?.map(mapIdempotency) ?? null, error: readError(response.error) };
    },
    async readRollbackRows(input) {
      const response = await client.from("import_publish_rollback_snapshots")
        .select(ROLLBACK_SELECT)
        .eq("idempotency_record_id", input.reservationId)
        .limit(input.limit);
      return { data: response.data?.map(mapRollback) ?? null, error: readError(response.error) };
    },
    async readAuditRows(input) {
      const response = await client.from("import_publish_audit_events")
        .select(AUDIT_SELECT)
        .eq("idempotency_record_id", input.reservationId)
        .in("event_type", input.eventTypes)
        .limit(input.limit);
      return { data: response.data?.map(mapAudit) ?? null, error: readError(response.error) };
    },
    async readEntityFingerprint(input) {
      const response = await client.from("centers")
        .select(PHARMACY_PRIVATE_ADMIN_CENTER_SELECT)
        .eq("id", input.entityId)
        .limit(input.limit);
      return {
        data: response.data?.map((row) => ({
          fingerprint: buildPharmacyPrivateAdminEntityFingerprint(row as unknown as PharmacyPrivateAdminRuntimeCenter),
          version: stringValue(row.updated_at),
        })) ?? null,
        error: readError(response.error),
      };
    },
  };
}
