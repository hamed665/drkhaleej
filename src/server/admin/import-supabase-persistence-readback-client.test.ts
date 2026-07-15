import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyPrivateAdminEntityFingerprint,
  type PharmacyPrivateAdminRuntimeCenter,
} from "./import-pharmacy-private-admin-runtime-context";
import {
  createImportSupabasePersistenceReadbackClient,
  type ImportSupabasePersistenceReadClient,
} from "./import-supabase-persistence-readback-client";
import { verifyImportPersistenceReadback } from "./import-persistence-readback-verifier";

const center: PharmacyPrivateAdminRuntimeCenter = {
  id: "entity-1",
  center_type: "pharmacy",
  slug: "pharmacy-1",
  name_en: "Pharmacy",
  name_ar: null,
  legal_name: null,
  status: "draft",
  verification_status: "unverified",
  primary_phone: null,
  secondary_phone: null,
  whatsapp_phone: null,
  email: null,
  website_url: null,
  logo_url: null,
  cover_image_url: null,
  short_description_en: null,
  short_description_ar: null,
  description_en: null,
  description_ar: null,
  default_locale: "en",
  default_country: "om",
  is_active: false,
  is_claimable: false,
  is_featured: false,
  sort_order: 0,
  metadata: {},
  deleted_at: null,
  updated_at: "2026-07-14T00:00:00.000Z",
};

describe("Supabase persistence readback client", () => {
  it("performs only bounded selects and strips the raw audit object", async () => {
    const calls: Array<{ table: string; columns: string; filters: unknown[]; limit: number }> = [];
    const rows: Record<string, Record<string, unknown>[]> = {
      import_pharmacy_publish_authorizations: [{ id: "authorization-1" }],
      import_publish_idempotency_records: [{ id: "reservation-1" }],
      import_publish_rollback_snapshots: [{ id: "snapshot-1" }],
      import_publish_audit_events: [{
        id: "audit-1",
        event_type: "execution_started",
        event_payload: {
          phase: "reservation",
          requestHash: "request-hash",
          authorizationId: "authorization-1",
          unexpectedSecret: "must-not-escape",
        },
      }],
      centers: [center as unknown as Record<string, unknown>],
    };
    const supabase: ImportSupabasePersistenceReadClient = {
      from(table) {
        return {
          select(columns) {
            const filters: unknown[] = [];
            const query = {
              eq(column: string, value: string) {
                filters.push(["eq", column, value]);
                return query;
              },
              in(column: string, values: readonly string[]) {
                filters.push(["in", column, [...values]]);
                return query;
              },
              async limit(limit: number) {
                calls.push({ table, columns, filters, limit });
                return { data: rows[table] ?? [], error: null };
              },
            };
            return query;
          },
        };
      },
    };
    const client = createImportSupabasePersistenceReadbackClient(supabase);

    await client.readAuthorizationRows({ authorizationId: "authorization-1", limit: 2 });
    await client.readIdempotencyRows({ reservationId: "reservation-1", limit: 2 });
    await client.readRollbackRows({ reservationId: "reservation-1", limit: 2 });
    const audit = await client.readAuditRows({
      reservationId: "reservation-1",
      eventTypes: ["execution_started", "reservation_created"],
      limit: 2,
    });
    const entity = await client.readEntityFingerprint({ entityId: "entity-1", limit: 2 });

    expect(calls).toHaveLength(5);
    expect(calls.every((call) => call.limit === 2)).toBe(true);
    expect(calls.map((call) => call.table)).toEqual([
      "import_pharmacy_publish_authorizations",
      "import_publish_idempotency_records",
      "import_publish_rollback_snapshots",
      "import_publish_audit_events",
      "centers",
    ]);
    expect(audit.data?.[0]).toMatchObject({
      id: "audit-1",
      phase: "reservation",
      request_hash: "request-hash",
      authorization_id: "authorization-1",
    });
    expect(audit.data?.[0]).not.toHaveProperty("event_payload");
    expect(audit.data?.[0]).not.toHaveProperty("unexpectedSecret");
    expect(entity.data).toEqual([{
      fingerprint: buildPharmacyPrivateAdminEntityFingerprint(center),
      version: center.updated_at,
    }]);
  });

  it("integrates bounded Supabase reads with the full authorization-linked verifier", async () => {
    const requestHash = "a".repeat(64);
    const snapshotHash = "b".repeat(64);
    const fingerprint = buildPharmacyPrivateAdminEntityFingerprint(center);
    const patchHash = "d".repeat(64);
    const rows: Record<string, Record<string, unknown>[]> = {
      import_pharmacy_publish_authorizations: [{
        id: "authorization-1", review_state_id: "review-1", actor_profile_id: "actor-1",
        entity_id: center.id, review_snapshot_hash: snapshotHash, entity_fingerprint: fingerprint,
        operation_attempt_id: "attempt-1", idempotency_key: "idempotency-1", request_hash: requestHash,
        patch_hash: patchHash, expected_entity_version: center.updated_at, entity_family: "pharmacy",
        operation_scope: "reserve_private_publish", status: "consumed",
        consumed_by_reservation_id: "reservation-1",
      }],
      import_publish_idempotency_records: [{
        id: "reservation-1", entity_id: center.id, actor_profile_id: "actor-1",
        idempotency_key: "idempotency-1", expected_version: center.updated_at,
        request_hash: requestHash, status: "reserved", pharmacy_authorization_id: "authorization-1",
      }],
      import_publish_rollback_snapshots: [{
        id: "snapshot-1", entity_id: center.id, actor_profile_id: "actor-1",
        idempotency_record_id: "reservation-1", expected_version: center.updated_at,
        snapshot_hash: snapshotHash,
      }],
      import_publish_audit_events: [{
        id: "audit-1", entity_id: center.id, actor_profile_id: "actor-1",
        idempotency_record_id: "reservation-1", rollback_snapshot_id: "snapshot-1",
        event_type: "execution_started", outcome: "pending", expected_version: center.updated_at,
        event_payload: {
          phase: "reservation", requestHash, authorizationId: "authorization-1",
          reviewSnapshotHash: snapshotHash, entityFingerprint: fingerprint,
          operationAttemptId: "attempt-1", patchHash, entityFamily: "pharmacy",
          operationScope: "reserve_private_publish",
        },
      }],
      centers: [center as unknown as Record<string, unknown>],
    };
    const supabase: ImportSupabasePersistenceReadClient = {
      from(table) {
        return {
          select() {
            const query = {
              eq() { return query; },
              in() { return query; },
              async limit() { return { data: rows[table] ?? [], error: null }; },
            };
            return query;
          },
        };
      },
    };

    const result = await verifyImportPersistenceReadback(
      createImportSupabasePersistenceReadbackClient(supabase),
      {
        entityId: center.id,
        actorId: "actor-1",
        authorizationId: "authorization-1",
        reviewStateId: "review-1",
        operationAttemptId: "attempt-1",
        idempotencyKey: "idempotency-1",
        requestHash,
        patchHash,
        expectedVersion: center.updated_at,
        expectedSnapshotHash: snapshotHash,
        expectedEntityFingerprint: fingerprint,
        expectedReservationId: "reservation-1",
        expectedRollbackSnapshotId: "snapshot-1",
        expectedAuditEventId: "audit-1",
        entityFamily: "pharmacy",
        operationScope: "reserve_private_publish",
      },
    );

    expect(result).toMatchObject({
      verified: true,
      entityUnchanged: true,
      findings: { duplicateCount: 0, orphanCount: 0, auditGapCount: 0 },
      auditSignature: "execution_started",
    });
  });
});
