import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PharmacyRealPreviewCanaryReadbackClient,
  PharmacyRealPreviewCanaryReadback,
} from "./import-pharmacy-real-preview-canary";

export function createSupabasePharmacyRealPreviewCanaryReadbackClient(
  client: SupabaseClient,
): PharmacyRealPreviewCanaryReadbackClient {
  return {
    async read({ actorId, entityId }) {
      try {
        const references = await client
          .from("import_pharmacy_publish_references")
          .select("id,actor_profile_id,entity_id,idempotency_record_id,rollback_snapshot_id")
          .eq("actor_profile_id", actorId)
          .eq("entity_id", entityId)
          .is("consumed_at", null)
          .limit(2);
        if (references.error || !references.data || references.data.length !== 1) {
          return { data: null, error: { message: "publish_reference_identity_read_failed" } };
        }
        const reference = references.data[0]!;

        const idempotency = await client
          .from("import_publish_idempotency_records")
          .select("id,idempotency_key,request_hash,status")
          .eq("id", reference.idempotency_record_id)
          .eq("entity_id", entityId)
          .eq("actor_profile_id", actorId);
        if (idempotency.error || !idempotency.data || idempotency.data.length !== 1) {
          return { data: null, error: { message: "reservation_read_failed" } };
        }
        const reservation = idempotency.data[0]!;

        const [snapshots, startedAudits, terminalAudits, referenceCount, duplicates, entity] = await Promise.all([
          client
            .from("import_publish_rollback_snapshots")
            .select("id")
            .eq("id", reference.rollback_snapshot_id)
            .eq("idempotency_record_id", reservation.id)
            .eq("entity_id", entityId)
            .eq("actor_profile_id", actorId),
          client
            .from("import_publish_audit_events")
            .select("id")
            .eq("idempotency_record_id", reservation.id)
            .eq("event_type", "execution_started"),
          client
            .from("import_publish_audit_events")
            .select("id")
            .eq("idempotency_record_id", reservation.id)
            .eq("event_type", "execution_succeeded")
            .eq("outcome", "succeeded"),
          client
            .from("import_pharmacy_publish_references")
            .select("id", { count: "exact", head: true })
            .eq("id", reference.id),
          client
            .from("import_publish_idempotency_records")
            .select("id", { count: "exact", head: true })
            .eq("entity_id", entityId)
            .eq("idempotency_key", reservation.idempotency_key)
            .eq("request_hash", reservation.request_hash),
          client
            .from("centers")
            .select("id,center_type,status,is_active,is_featured")
            .eq("id", entityId)
            .maybeSingle(),
        ]);

        const queryError = [snapshots.error, startedAudits.error, terminalAudits.error, referenceCount.error, duplicates.error, entity.error].find(Boolean);
        if (queryError) return { data: null, error: { message: queryError.message } };

        const data: PharmacyRealPreviewCanaryReadback = {
          reservationCount: idempotency.data.length,
          rollbackSnapshotCount: snapshots.data?.length ?? 0,
          executionStartedAuditCount: startedAudits.data?.length ?? 0,
          terminalSuccessAuditCount: terminalAudits.data?.length ?? 0,
          publishReferenceCount: referenceCount.count ?? 0,
          duplicateExecutionCount: Math.max(0, (duplicates.count ?? 0) - 1),
          entity: entity.data
            ? {
                id: entity.data.id,
                centerType: entity.data.center_type,
                status: entity.data.status,
                isActive: entity.data.is_active,
                isFeatured: entity.data.is_featured,
              }
            : null,
        };
        return { data, error: null };
      } catch {
        return { data: null, error: { message: "preview_canary_readback_exception" } };
      }
    },
  };
}
