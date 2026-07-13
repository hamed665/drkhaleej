import "server-only";

import { buildPharmacyCanonicalMutationPatch } from "./import-pharmacy-canonical-mutation-patch";
import type {
  ImportPharmacyPrivateMutationPayload,
  ImportPharmacyPrivateMutationWriter,
} from "./import-pharmacy-private-mutation-adapter";

export type ImportPharmacyMutationRpcClient = {
  rpc(
    name: "import_publish_pharmacy_private",
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

type RpcPayload = {
  status?: unknown;
  entityId?: unknown;
  actualVersion?: unknown;
  reason?: unknown;
};

function normalizeRpcResult(data: unknown): Awaited<ReturnType<ImportPharmacyPrivateMutationWriter["mutateOne"]>> {
  if (!data || typeof data !== "object") return { kind: "failed" };
  const value = data as RpcPayload;

  if (
    (value.status === "mutated" || value.status === "replayed") &&
    typeof value.entityId === "string" &&
    typeof value.actualVersion === "string"
  ) {
    return {
      kind: value.status,
      entityId: value.entityId,
      actualVersion: value.actualVersion,
    };
  }

  if (
    value.status === "conflict" &&
    (value.reason === "expected_version_mismatch" ||
      value.reason === "reservation_identity_mismatch" ||
      value.reason === "idempotency_mismatch")
  ) {
    return { kind: "conflict", reason: value.reason };
  }

  return { kind: "failed" };
}

export function createSupabasePharmacyPrivateMutationWriter(
  client: ImportPharmacyMutationRpcClient,
): ImportPharmacyPrivateMutationWriter {
  return {
    async mutateOne(payload) {
      const { data, error } = await client.rpc("import_publish_pharmacy_private", {
        p_idempotency_record_id: payload.reservationId,
        p_rollback_snapshot_id: payload.rollbackSnapshotId,
        p_execution_started_audit_id: payload.auditEventId,
        p_entity_id: payload.draft.draftId,
        p_actor_profile_id: payload.actorId,
        p_expected_version: payload.expectedVersion,
        p_patch: buildPharmacyCanonicalMutationPatch(payload.draft),
        p_audit_schema_version: "1",
      });

      if (error) return { kind: "failed" };
      return normalizeRpcResult(data);
    },

    async rollbackOne() {
      return false;
    },
  };
}
