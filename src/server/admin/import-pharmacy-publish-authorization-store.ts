import "server-only";

import type {
  PharmacyPublishAuthorizationEnvelopeRecord,
  PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";

type QueryResponse<T> = Promise<{ data: T | null; error: { message?: string } | null }>;

export type PharmacyPublishAuthorizationClient = {
  from(table: "import_pharmacy_publish_authorizations"): {
    insert(values: Readonly<Record<string, unknown>>): {
      select(columns: string): { maybeSingle(): QueryResponse<Record<string, unknown>> };
    };
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): QueryResponse<Record<string, unknown>>;
      };
    };
  };
  rpc(
    name: "import_pharmacy_consume_publish_authorization",
    args: Readonly<Record<string, unknown>>,
  ): QueryResponse<boolean>;
};

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function mapRecord(row: Readonly<Record<string, unknown>>): PharmacyPublishAuthorizationEnvelopeRecord | null {
  const tokenHash = readString(row, "token_hash");
  const nonceHash = readString(row, "nonce_hash");
  const actorId = readString(row, "actor_profile_id");
  const entityId = readString(row, "entity_id");
  const reviewSnapshotHash = readString(row, "review_snapshot_hash");
  const entityFingerprint = readString(row, "entity_fingerprint");
  const issuedAt = readString(row, "issued_at");
  const expiresAt = readString(row, "expires_at");
  const consumedAt = row.consumed_at === null ? null : readString(row, "consumed_at");

  if (!tokenHash || !nonceHash || !actorId || !entityId || !reviewSnapshotHash || !entityFingerprint || !issuedAt || !expiresAt) {
    return null;
  }

  return {
    tokenHash,
    nonceHash,
    actorId,
    entityId,
    reviewSnapshotHash,
    entityFingerprint,
    issuedAt,
    expiresAt,
    consumedAt,
  };
}

export function createPharmacyPublishAuthorizationStore(
  client: PharmacyPublishAuthorizationClient,
): PharmacyPublishAuthorizationEnvelopeStore {
  return {
    async create(record) {
      const response = await client
        .from("import_pharmacy_publish_authorizations")
        .insert({
          token_hash: record.tokenHash,
          nonce_hash: record.nonceHash,
          actor_profile_id: record.actorId,
          entity_id: record.entityId,
          review_snapshot_hash: record.reviewSnapshotHash,
          entity_fingerprint: record.entityFingerprint,
          issued_at: record.issuedAt,
          expires_at: record.expiresAt,
          consumed_at: null,
        })
        .select("id")
        .maybeSingle();

      return !response.error && response.data !== null;
    },

    async readByTokenHash(tokenHash) {
      const response = await client
        .from("import_pharmacy_publish_authorizations")
        .select(
          "token_hash,nonce_hash,actor_profile_id,entity_id,review_snapshot_hash,entity_fingerprint,issued_at,expires_at,consumed_at",
        )
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (response.error || !response.data) return null;
      return mapRecord(response.data);
    },

    async consume(input) {
      const existing = await this.readByTokenHash(input.tokenHash);
      if (!existing || existing.nonceHash !== input.nonceHash) return false;

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
