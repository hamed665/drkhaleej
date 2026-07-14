import "server-only";

import { createClient } from "@supabase/supabase-js";

import type {
  PharmacyPublishAuthorizationEnvelopeRecord,
  PharmacyPublishAuthorizationEnvelopeStore,
  PharmacyPublishAuthorizationStatus,
} from "./import-pharmacy-publish-authorization-envelope";

type QueryResponse<T> = Promise<{ data: T | null; error: { message?: string } | null }>;

type SelectQuery = {
  eq(column: string, value: string): SelectQuery;
  maybeSingle(): QueryResponse<Record<string, unknown>>;
};

type TableQuery = {
  insert(values: Readonly<Record<string, unknown>>): {
    select(columns: string): { maybeSingle(): QueryResponse<Record<string, unknown>> };
  };
  select(columns: string): SelectQuery;
};

export type PharmacyPublishAuthorizationClient = {
  from(table: "import_pharmacy_publish_authorizations" | "import_pharmacy_admin_read_states"): TableQuery;
  rpc(
    name: "import_pharmacy_consume_publish_authorization",
    args: Readonly<Record<string, unknown>>,
  ): QueryResponse<boolean>;
};

const AUTHORIZATION_COLUMNS = [
  "id",
  "token_hash",
  "nonce_hash",
  "actor_profile_id",
  "entity_id",
  "review_state_id",
  "review_snapshot_hash",
  "entity_fingerprint",
  "operation_attempt_id",
  "idempotency_key",
  "request_hash",
  "patch_hash",
  "expected_entity_version",
  "entity_family",
  "operation_scope",
  "status",
  "issued_at",
  "expires_at",
  "consumed_at",
  "invalidated_at",
  "invalidation_reason",
  "consumed_by_reservation_id",
].join(",");

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readNullableString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  return record[key] === null ? null : readString(record, key);
}

function readStatus(value: unknown): PharmacyPublishAuthorizationStatus | null {
  return value === "issued" || value === "consumed" || value === "invalidated" || value === "expired"
    ? value
    : null;
}

function mapRecord(row: Readonly<Record<string, unknown>>): PharmacyPublishAuthorizationEnvelopeRecord | null {
  const authorizationId = readString(row, "id");
  const tokenHash = readString(row, "token_hash");
  const nonceHash = readString(row, "nonce_hash");
  const actorId = readString(row, "actor_profile_id");
  const entityId = readString(row, "entity_id");
  const reviewStateId = readString(row, "review_state_id");
  const reviewSnapshotHash = readString(row, "review_snapshot_hash");
  const entityFingerprint = readString(row, "entity_fingerprint");
  const operationAttemptId = readString(row, "operation_attempt_id");
  const idempotencyKey = readString(row, "idempotency_key");
  const requestHash = readString(row, "request_hash");
  const patchHash = readString(row, "patch_hash");
  const expectedEntityVersion = readString(row, "expected_entity_version");
  const entityFamily = readString(row, "entity_family");
  const operationScope = readString(row, "operation_scope");
  const status = readStatus(row.status);
  const issuedAt = readString(row, "issued_at");
  const expiresAt = readString(row, "expires_at");
  const consumedAt = readNullableString(row, "consumed_at");
  const invalidatedAt = readNullableString(row, "invalidated_at");
  const invalidationReason = readNullableString(row, "invalidation_reason");
  const consumedByReservationId = readNullableString(row, "consumed_by_reservation_id");

  if (
    !authorizationId ||
    !tokenHash ||
    !nonceHash ||
    !actorId ||
    !entityId ||
    !reviewStateId ||
    !reviewSnapshotHash ||
    !entityFingerprint ||
    !operationAttemptId ||
    !idempotencyKey ||
    !requestHash ||
    !patchHash ||
    !expectedEntityVersion ||
    entityFamily !== "pharmacy" ||
    operationScope !== "reserve_private_publish" ||
    !status ||
    !issuedAt ||
    !expiresAt
  ) return null;

  return {
    authorizationId,
    tokenHash,
    nonceHash,
    actorId,
    entityId,
    reviewStateId,
    reviewSnapshotHash,
    entityFingerprint,
    operationAttemptId,
    idempotencyKey,
    requestHash,
    patchHash,
    expectedEntityVersion,
    entityFamily: "pharmacy",
    operationScope: "reserve_private_publish",
    status,
    issuedAt,
    expiresAt,
    consumedAt,
    invalidatedAt,
    invalidationReason,
    consumedByReservationId,
  };
}

export function createPharmacyPublishAuthorizationStore(
  client: PharmacyPublishAuthorizationClient,
): PharmacyPublishAuthorizationEnvelopeStore {
  async function readOne(column: "id" | "token_hash", value: string) {
    const response = await client
      .from("import_pharmacy_publish_authorizations")
      .select(AUTHORIZATION_COLUMNS)
      .eq(column, value)
      .maybeSingle();

    if (response.error || !response.data) return null;
    return mapRecord(response.data);
  }

  return {
    async resolveReviewStateId(operationAttemptId) {
      const response = await client
        .from("import_pharmacy_admin_read_states")
        .select("id")
        .eq("operation_attempt_id", operationAttemptId)
        .eq("operation", "review")
        .maybeSingle();

      if (response.error || !response.data) return null;
      return readString(response.data, "id");
    },

    async create(record) {
      const response = await client
        .from("import_pharmacy_publish_authorizations")
        .insert({
          token_hash: record.tokenHash,
          nonce_hash: record.nonceHash,
          actor_profile_id: record.actorId,
          entity_id: record.entityId,
          review_state_id: record.reviewStateId,
          review_snapshot_hash: record.reviewSnapshotHash,
          entity_fingerprint: record.entityFingerprint,
          operation_attempt_id: record.operationAttemptId,
          idempotency_key: record.idempotencyKey,
          request_hash: record.requestHash,
          patch_hash: record.patchHash,
          expected_entity_version: record.expectedEntityVersion,
          entity_family: record.entityFamily,
          operation_scope: record.operationScope,
          status: record.status,
          issued_at: record.issuedAt,
          expires_at: record.expiresAt,
          consumed_at: null,
          invalidated_at: null,
          invalidation_reason: null,
          consumed_by_reservation_id: null,
        })
        .select("id")
        .maybeSingle();

      return !response.error && response.data ? readString(response.data, "id") : null;
    },

    async readByAuthorizationId(authorizationId) {
      return readOne("id", authorizationId);
    },

    async readByTokenHash(tokenHash) {
      return readOne("token_hash", tokenHash);
    },

    async consume(input) {
      const existing = await readOne("token_hash", input.tokenHash);
      if (!existing || existing.nonceHash !== input.nonceHash || existing.status !== "issued") return false;

      const response = await client.rpc("import_pharmacy_consume_publish_authorization", {
        p_token_hash: input.tokenHash,
        p_nonce_hash: input.nonceHash,
        p_actor_profile_id: existing.actorId,
        p_entity_id: existing.entityId,
        p_review_snapshot_hash: existing.reviewSnapshotHash,
        p_entity_fingerprint: existing.entityFingerprint,
        p_consumed_at: input.consumedAt,
      });

      return !response.error && response.data === true;
    },
  };
}

export function createPharmacyPublishAuthorizationStoreFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): PharmacyPublishAuthorizationEnvelopeStore | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;

  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return createPharmacyPublishAuthorizationStore(client as unknown as PharmacyPublishAuthorizationClient);
}
