import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { PharmacyPrivatePublishReadbackEvidence } from "./import-pharmacy-private-publish-readback";

export type PharmacyPrivatePublishReadbackClient = {
  read(input: {
    actorId: string;
    entityId: string;
    reservationId: string;
    rollbackSnapshotId: string;
    reservationAuditId: string;
    publishReference: string;
    canonicalPath: string;
  }): Promise<{ data: PharmacyPrivatePublishReadbackEvidence | null; error: { message?: string } | null }>;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function booleanValue(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function eventPhase(row: Record<string, unknown>): string | null {
  return isRecord(row.event_payload) ? stringValue(row.event_payload, "phase") : null;
}

function queueMatchesCanonicalPath(row: Record<string, unknown>, canonicalPath: string): boolean {
  return isRecord(row.metadata) && stringValue(row.metadata, "canonical_path") === canonicalPath;
}

export function createSupabasePharmacyPrivatePublishReadbackClient(
  client: SupabaseClient,
): PharmacyPrivatePublishReadbackClient {
  return {
    async read(input) {
      try {
        const [reservation, snapshot, audits, reference, entity, publicQueue] = await Promise.all([
          client
            .from("import_publish_idempotency_records")
            .select("id,actor_profile_id,entity_id,expected_version,status,terminal_result")
            .eq("id", input.reservationId)
            .eq("actor_profile_id", input.actorId)
            .eq("entity_id", input.entityId),
          client
            .from("import_publish_rollback_snapshots")
            .select("id,expected_version,snapshot_hash")
            .eq("id", input.rollbackSnapshotId)
            .eq("idempotency_record_id", input.reservationId)
            .eq("actor_profile_id", input.actorId)
            .eq("entity_id", input.entityId),
          client
            .from("import_publish_audit_events")
            .select("id,event_type,outcome,schema_version,actual_version,event_payload")
            .eq("idempotency_record_id", input.reservationId)
            .eq("actor_profile_id", input.actorId)
            .eq("entity_id", input.entityId),
          client
            .from("import_pharmacy_publish_references")
            .select("id", { count: "exact", head: true })
            .eq("token_hash", sha256(input.publishReference))
            .eq("idempotency_record_id", input.reservationId)
            .eq("rollback_snapshot_id", input.rollbackSnapshotId)
            .eq("actor_profile_id", input.actorId)
            .eq("entity_id", input.entityId),
          client
            .from("centers")
            .select("id,center_type,status,is_active,is_featured,deleted_at,updated_at,name_en,legal_name,slug,description_en,primary_phone,whatsapp_phone,email,website_url,default_locale,default_country,metadata")
            .eq("id", input.entityId)
            .maybeSingle(),
          client
            .from("import_publish_queue")
            .select("metadata")
            .eq("target_entity_type", "pharmacy")
            .eq("publish_status", "index_eligible")
            .eq("index_policy", "index")
            .eq("sitemap_policy", "included")
            .limit(1000),
        ]);

        const queryError = [
          reservation.error,
          snapshot.error,
          audits.error,
          reference.error,
          entity.error,
          publicQueue.error,
        ].find(Boolean);
        if (queryError) return { data: null, error: { message: queryError.message } };

        const reservationRows = (reservation.data ?? []) as Record<string, unknown>[];
        const snapshotRows = (snapshot.data ?? []) as Record<string, unknown>[];
        const auditRows = (audits.data ?? []) as Record<string, unknown>[];
        const reservationAuditRows = auditRows.filter((row) => row.id === input.reservationAuditId);
        const executionStartedRows = auditRows.filter(
          (row) => row.event_type === "execution_started" && eventPhase(row) === "mutation",
        );
        const executionSucceededRows = auditRows.filter(
          (row) => row.event_type === "execution_succeeded" && row.outcome === "succeeded",
        );
        const reservationRow = reservationRows[0] ?? {};
        const snapshotRow = snapshotRows[0] ?? {};
        const reservationAuditRow = reservationAuditRows[0] ?? {};
        const executionStartedRow = executionStartedRows[0] ?? {};
        const executionSucceededRow = executionSucceededRows[0] ?? {};
        const terminal = isRecord(reservationRow.terminal_result) ? reservationRow.terminal_result : {};
        const center = entity.data as Record<string, unknown> | null;
        const exposedRows = ((publicQueue.data ?? []) as Record<string, unknown>[])
          .filter((row) => queueMatchesCanonicalPath(row, input.canonicalPath));

        const data: PharmacyPrivatePublishReadbackEvidence = {
          reservation: {
            count: reservationRows.length,
            actorId: stringValue(reservationRow, "actor_profile_id"),
            entityId: stringValue(reservationRow, "entity_id"),
            expectedVersion: stringValue(reservationRow, "expected_version"),
            status: stringValue(reservationRow, "status"),
            terminalActualVersion: stringValue(terminal, "actualVersion"),
            terminalVisibility: stringValue(terminal, "visibility"),
            terminalPublicRouteEnabled: booleanValue(terminal, "publicRouteEnabled"),
            terminalIndexable: booleanValue(terminal, "indexable"),
            terminalSitemapEligible: booleanValue(terminal, "sitemapEligible"),
          },
          rollbackSnapshot: {
            count: snapshotRows.length,
            id: stringValue(snapshotRow, "id"),
            expectedVersion: stringValue(snapshotRow, "expected_version"),
            snapshotHash: stringValue(snapshotRow, "snapshot_hash"),
          },
          reservationAudit: {
            count: reservationAuditRows.length,
            id: stringValue(reservationAuditRow, "id"),
            eventType: stringValue(reservationAuditRow, "event_type"),
            phase: eventPhase(reservationAuditRow),
            schemaVersion: stringValue(reservationAuditRow, "schema_version"),
          },
          executionStarted: {
            count: executionStartedRows.length,
            phase: eventPhase(executionStartedRow),
            schemaVersion: stringValue(executionStartedRow, "schema_version"),
          },
          executionSucceeded: {
            count: executionSucceededRows.length,
            schemaVersion: stringValue(executionSucceededRow, "schema_version"),
            actualVersion: stringValue(executionSucceededRow, "actual_version"),
          },
          publishReferenceCount: reference.count ?? 0,
          duplicateExecutionCount: Math.max(0, executionStartedRows.length - 1),
          publicExposureCount: exposedRows.length,
          entity: center
            ? {
                id: stringValue(center, "id") ?? "",
                centerType: stringValue(center, "center_type") ?? "",
                status: stringValue(center, "status") ?? "",
                isActive: booleanValue(center, "is_active") ?? true,
                isFeatured: booleanValue(center, "is_featured") ?? true,
                deletedAt: center.deleted_at === null ? null : stringValue(center, "deleted_at"),
                updatedAt: stringValue(center, "updated_at") ?? "",
                nameEn: center.name_en === null ? null : stringValue(center, "name_en"),
                legalName: center.legal_name === null ? null : stringValue(center, "legal_name"),
                slug: center.slug === null ? null : stringValue(center, "slug"),
                descriptionEn: center.description_en === null ? null : stringValue(center, "description_en"),
                primaryPhone: center.primary_phone === null ? null : stringValue(center, "primary_phone"),
                whatsappPhone: center.whatsapp_phone === null ? null : stringValue(center, "whatsapp_phone"),
                email: center.email === null ? null : stringValue(center, "email"),
                websiteUrl: center.website_url === null ? null : stringValue(center, "website_url"),
                defaultLocale: stringValue(center, "default_locale") ?? "",
                defaultCountry: stringValue(center, "default_country") ?? "",
                metadata: isRecord(center.metadata) ? center.metadata : null,
              }
            : null,
        };

        return { data, error: null };
      } catch {
        return { data: null, error: { message: "pharmacy_private_publish_readback_exception" } };
      }
    },
  };
}
