import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { createPharmacyAdminReadStateStore } from "./import-pharmacy-admin-read-state-store";
import { createPharmacyPublishAuthorizationStore } from "./import-pharmacy-publish-authorization-store";
import {
  createSupabasePharmacyPrivateAdminContextReader,
  loadPharmacyPrivateAdminRuntimeContext,
} from "./import-pharmacy-private-admin-runtime-context";
import { isCompatibleReservationAudit, type ImportReservationAuditEvent } from "./import-reservation-audit-contract";
import {
  verifyImportPersistenceReadback,
  type ImportPersistenceReadbackVerificationInput,
} from "./import-persistence-readback-verifier";
import { createImportSupabasePersistenceReadbackClient } from "./import-supabase-persistence-readback-client";
import type { PharmacyVerifiedReservationLoaderDependencies } from "./import-pharmacy-verified-reservation-loader";
import type { PharmacyAdminReadStateClient } from "./import-pharmacy-admin-read-state-store";
import type { PharmacyPublishAuthorizationClient } from "./import-pharmacy-publish-authorization-store";
import type { ImportSupabasePersistenceReadClient } from "./import-supabase-persistence-readback-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function phase(record: Record<string, unknown>): string | null {
  return isRecord(record.event_payload) ? readString(record.event_payload, "phase") : null;
}

async function loadReservationPersistence(input: {
  client: SupabaseClient;
  actorId: string;
  entityId: string;
  reservationId: string;
  authorizationId: string;
  reviewStateId: string;
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  expectedVersion: string;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
}): Promise<{
  verificationInput: ImportPersistenceReadbackVerificationInput;
  reservationExpiresAt: string;
} | null> {
  const [reservation, snapshots, audits] = await Promise.all([
    input.client
      .from("import_publish_idempotency_records")
      .select("id,actor_profile_id,entity_id,idempotency_key,request_hash,expected_version,status,expires_at,pharmacy_authorization_id")
      .eq("id", input.reservationId)
      .eq("actor_profile_id", input.actorId)
      .eq("entity_id", input.entityId),
    input.client
      .from("import_publish_rollback_snapshots")
      .select("id,idempotency_record_id,actor_profile_id,entity_id,expected_version,snapshot_hash")
      .eq("idempotency_record_id", input.reservationId)
      .eq("actor_profile_id", input.actorId)
      .eq("entity_id", input.entityId),
    input.client
      .from("import_publish_audit_events")
      .select("id,idempotency_record_id,rollback_snapshot_id,actor_profile_id,entity_id,event_type,outcome,schema_version,event_payload")
      .eq("idempotency_record_id", input.reservationId)
      .eq("actor_profile_id", input.actorId)
      .eq("entity_id", input.entityId),
  ]);

  if (reservation.error || snapshots.error || audits.error) return null;
  const reservationRows = (reservation.data ?? []) as Record<string, unknown>[];
  const snapshotRows = (snapshots.data ?? []) as Record<string, unknown>[];
  const auditRows = (audits.data ?? []) as Record<string, unknown>[];
  if (reservationRows.length !== 1 || snapshotRows.length !== 1) return null;

  const reservationRow = reservationRows[0]!;
  const snapshotRow = snapshotRows[0]!;
  if (
    readString(reservationRow, "idempotency_key") !== input.idempotencyKey ||
    readString(reservationRow, "request_hash") !== input.requestHash ||
    readString(reservationRow, "expected_version") !== input.expectedVersion ||
    readString(reservationRow, "pharmacy_authorization_id") !== input.authorizationId ||
    readString(reservationRow, "status") !== "reserved" ||
    readString(snapshotRow, "expected_version") !== input.expectedVersion ||
    readString(snapshotRow, "snapshot_hash") !== input.expectedSnapshotHash
  ) return null;

  const rollbackSnapshotId = readString(snapshotRow, "id");
  const reservationExpiresAt = readString(reservationRow, "expires_at");
  if (!rollbackSnapshotId || !reservationExpiresAt) return null;

  const compatibleAudits = auditRows.filter((row) => {
    const eventType = readString(row, "event_type");
    const schemaVersion = readString(row, "schema_version");
    return eventType !== null && schemaVersion !== null &&
      (eventType === "reservation_created" || eventType === "execution_started") &&
      readString(row, "rollback_snapshot_id") === rollbackSnapshotId &&
      row.outcome === "pending" &&
      isCompatibleReservationAudit({
        eventType: eventType as ImportReservationAuditEvent,
        schemaVersion,
        phase: phase(row),
      });
  });
  if (compatibleAudits.length !== 1) return null;
  const reservationAuditId = readString(compatibleAudits[0]!, "id");
  if (!reservationAuditId) return null;

  return {
    reservationExpiresAt,
    verificationInput: {
      actorId: input.actorId,
      entityId: input.entityId,
      authorizationId: input.authorizationId,
      reviewStateId: input.reviewStateId,
      operationAttemptId: input.operationAttemptId,
      idempotencyKey: input.idempotencyKey,
      requestHash: input.requestHash,
      patchHash: input.patchHash,
      expectedVersion: input.expectedVersion,
      expectedSnapshotHash: input.expectedSnapshotHash,
      expectedEntityFingerprint: input.expectedEntityFingerprint,
      expectedReservationId: input.reservationId,
      expectedRollbackSnapshotId: rollbackSnapshotId,
      expectedAuditEventId: reservationAuditId,
      entityFamily: "pharmacy",
      operationScope: "reserve_private_publish",
    },
  };
}

export function createSupabasePharmacyVerifiedReservationLoaderDependencies(input: {
  environment?: Record<string, string | undefined>;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
}): PharmacyVerifiedReservationLoaderDependencies | null {
  const environment = input.environment ?? process.env;
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const contextReader = createSupabasePharmacyPrivateAdminContextReader(client);
  const readStateStore = createPharmacyAdminReadStateStore(client as unknown as PharmacyAdminReadStateClient);
  const authorizationStore = createPharmacyPublishAuthorizationStore(
    client as unknown as PharmacyPublishAuthorizationClient,
  );
  const readbackClient = createImportSupabasePersistenceReadbackClient(
    client as unknown as ImportSupabasePersistenceReadClient,
  );

  return {
    async loadBaseContext({ actorId, entityId }) {
      const result = await loadPharmacyPrivateAdminRuntimeContext(
        {
          executionEnabled: true,
          environment: environment.VERCEL_ENV,
          actorId,
          entityId,
          allowedActorIds: input.allowedActorIds,
          allowedEntityIds: input.allowedEntityIds,
          approvalToken: environment.IMPORT_PREVIEW_APPROVAL_TOKEN ?? "",
          expectedApprovalToken: environment.IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN ?? "",
        },
        contextReader,
      );
      return result.ok ? result.context : null;
    },

    readLatestReview({ actorId, entityId, now }) {
      return readStateStore.readLatestFresh({ actorId, entityId, operation: "review", now });
    },

    async loadPersistence({ actorId, entityId, review }) {
      const reviewStateId = await authorizationStore.resolveReviewStateId(review.operationAttemptId);
      if (!reviewStateId) return null;
      const authorization = await authorizationStore.readByReviewStateId(reviewStateId);
      if (!authorization || authorization.status !== "consumed" || !authorization.consumedByReservationId) {
        return null;
      }

      const persistence = await loadReservationPersistence({
        client,
        actorId,
        entityId,
        reservationId: authorization.consumedByReservationId,
        authorizationId: authorization.authorizationId,
        reviewStateId,
        operationAttemptId: review.operationAttemptId,
        idempotencyKey: review.idempotencyKey,
        requestHash: review.requestHash,
        patchHash: review.patchHash,
        expectedVersion: review.expectedEntityVersion,
        expectedSnapshotHash: review.snapshotHash,
        expectedEntityFingerprint: review.entityFingerprint,
      });
      return persistence ? { authorization, ...persistence } : null;
    },

    verifyReadback(verificationInput) {
      return verifyImportPersistenceReadback(readbackClient, verificationInput);
    },
  };
}
