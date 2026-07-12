import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { ImportPharmacyPrivateRollbackRequest } from "./import-supabase-pharmacy-private-rollback-writer";
import type { PharmacyPrivateAdminPublishReferenceInput } from "./import-pharmacy-private-admin-real-wiring";

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type PharmacyDurablePublishReferenceClient = {
  from(table: "import_pharmacy_publish_references"): {
    insert(values: Readonly<Record<string, unknown>>): {
      select(columns: string): {
        maybeSingle(): Promise<{ data: { id?: unknown } | null; error: { message?: string } | null }>;
      };
    };
    select(columns: string): {
      eq(column: string, value: string): ReturnType<PharmacyDurablePublishReferenceClient["from"]>["select"] & {
        maybeSingle(): Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>;
      };
      maybeSingle(): Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>;
    };
  };
};

export type PharmacyDurablePublishReferenceStore = {
  create(input: PharmacyPrivateAdminPublishReferenceInput): Promise<string | null>;
  resolve(input: { actorId: string; entityId: string; publishReference: string }): Promise<ImportPharmacyPrivateRollbackRequest | null>;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function createPharmacyDurablePublishReferenceStore(
  client: PharmacyDurablePublishReferenceClient,
  options: { now?: () => Date; ttlMs?: number } = {},
): PharmacyDurablePublishReferenceStore {
  const now = options.now ?? (() => new Date());
  const ttlMs = Math.min(Math.max(options.ttlMs ?? DEFAULT_TTL_MS, 60_000), MAX_TTL_MS);

  return {
    async create(input) {
      if (
        !isNonEmpty(input.actorId) ||
        !isNonEmpty(input.entityId) ||
        !isNonEmpty(input.reservationId) ||
        !isNonEmpty(input.rollbackSnapshotId) ||
        !isNonEmpty(input.actualVersion) ||
        !isSha256(input.expectedSnapshotHash)
      ) return null;

      const token = randomBytes(32).toString("base64url");
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + ttlMs);
      const response = await client
        .from("import_pharmacy_publish_references")
        .insert({
          token_hash: sha256(token),
          actor_profile_id: input.actorId,
          entity_id: input.entityId,
          idempotency_record_id: input.reservationId,
          rollback_snapshot_id: input.rollbackSnapshotId,
          expected_current_version: input.actualVersion,
          expected_snapshot_hash: input.expectedSnapshotHash,
          created_at: createdAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select("id")
        .maybeSingle();

      if (response.error || !response.data || !isNonEmpty(response.data.id)) return null;
      return token;
    },

    async resolve(input) {
      if (!isNonEmpty(input.actorId) || !isNonEmpty(input.entityId) || !isNonEmpty(input.publishReference)) return null;

      const response = await client
        .from("import_pharmacy_publish_references")
        .select("actor_profile_id,entity_id,idempotency_record_id,rollback_snapshot_id,expected_current_version,expected_snapshot_hash,expires_at,consumed_at")
        .eq("token_hash", sha256(input.publishReference))
        .maybeSingle();

      if (response.error || !response.data) return null;
      const row = response.data;
      if (
        row.actor_profile_id !== input.actorId ||
        row.entity_id !== input.entityId ||
        !isNonEmpty(row.idempotency_record_id) ||
        !isNonEmpty(row.rollback_snapshot_id) ||
        !isNonEmpty(row.expected_current_version) ||
        !isNonEmpty(row.expected_snapshot_hash) ||
        !isSha256(row.expected_snapshot_hash) ||
        !isNonEmpty(row.expires_at) ||
        row.consumed_at !== null ||
        new Date(row.expires_at).getTime() <= now().getTime()
      ) return null;

      return {
        reservationId: row.idempotency_record_id,
        rollbackSnapshotId: row.rollback_snapshot_id,
        entityId: input.entityId,
        actorId: input.actorId,
        expectedCurrentVersion: row.expected_current_version,
        expectedSnapshotHash: row.expected_snapshot_hash,
      };
    },
  };
}
