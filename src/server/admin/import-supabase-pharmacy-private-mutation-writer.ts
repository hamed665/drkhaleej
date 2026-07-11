import "server-only";

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

function buildPatch(payload: ImportPharmacyPrivateMutationPayload): Readonly<Record<string, unknown>> {
  return {
    name_en: payload.draft.name,
    legal_name: payload.draft.legalName,
    slug: payload.draft.slugCandidate,
    description_en: payload.draft.description,
    primary_phone: payload.draft.contact?.phone ?? null,
    whatsapp_phone: payload.draft.contact?.whatsapp ?? null,
    email: payload.draft.contact?.email ?? null,
    website_url: payload.draft.contact?.website ?? null,
    default_country: "om",
    default_locale: "en",
    metadata: {
      source: payload.draft.source,
      sourceEvidence: payload.draft.sourceEvidence,
      rawPayloadHash: payload.draft.rawPayloadHash,
      visibility: "private",
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  };
}

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
        p_patch: buildPatch(payload),
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
