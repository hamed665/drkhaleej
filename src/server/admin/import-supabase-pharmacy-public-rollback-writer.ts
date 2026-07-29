import "server-only";

export const PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION =
  "drkhaleej.import.pharmacyPublicNoindex.v1" as const;

export type PharmacyPublicRollbackRequest = Readonly<{
  actorId: string;
  entityId: string;
}>;

export type PharmacyPublicRollbackResult =
  | Readonly<{
      kind: "rolled_back" | "replayed";
      restoredQueuePresent: boolean;
      exactLogicalRecovery: true;
      authorityConsumed: true;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "conflict";
      reason:
        | "rollback_authority_not_available"
        | "rollback_snapshot_hash_mismatch"
        | "rollback_snapshot_shape_invalid"
        | "rollback_event_state_invalid"
        | "rollback_private_boundary_invalid"
        | "rollback_candidate_state_invalid"
        | "rollback_candidate_hash_mismatch"
        | "rollback_published_result_missing"
        | "rollback_published_result_hash_mismatch"
        | "published_queue_integrity_mismatch";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "failed";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>;

type RollbackRpcPayload = {
  status?: unknown;
  reason?: unknown;
  visibility?: unknown;
  indexPolicy?: unknown;
  sitemapPolicy?: unknown;
  restoredQueuePresent?: unknown;
  exactLogicalRecovery?: unknown;
  authorityConsumed?: unknown;
  rawReferenceExposed?: unknown;
};

export type PharmacyPublicRollbackRpcClient = {
  rpc(
    name: "import_rollback_pharmacy_public_noindex_by_authority",
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

const conflictReasons = new Set([
  "rollback_authority_not_available",
  "rollback_snapshot_hash_mismatch",
  "rollback_snapshot_shape_invalid",
  "rollback_event_state_invalid",
  "rollback_private_boundary_invalid",
  "rollback_candidate_state_invalid",
  "rollback_candidate_hash_mismatch",
  "rollback_published_result_missing",
  "rollback_published_result_hash_mismatch",
  "published_queue_integrity_mismatch",
]);

function failed(): PharmacyPublicRollbackResult {
  return {
    kind: "failed",
    authorityConsumed: false,
    rawReferenceExposed: false,
  };
}

function normalize(data: unknown): PharmacyPublicRollbackResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) return failed();
  const value = data as RollbackRpcPayload;

  if (
    (value.status === "rolled_back" || value.status === "replayed") &&
    value.visibility === "private" &&
    value.indexPolicy === "noindex" &&
    value.sitemapPolicy === "excluded" &&
    typeof value.restoredQueuePresent === "boolean" &&
    value.exactLogicalRecovery === true &&
    value.authorityConsumed === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      restoredQueuePresent: value.restoredQueuePresent,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    };
  }

  if (
    value.status === "conflict" &&
    typeof value.reason === "string" &&
    conflictReasons.has(value.reason) &&
    value.authorityConsumed === false &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: "conflict",
      reason: value.reason as Extract<
        PharmacyPublicRollbackResult,
        { kind: "conflict" }
      >["reason"],
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }

  return failed();
}

export function createSupabasePharmacyPublicRollbackWriter(
  client: PharmacyPublicRollbackRpcClient,
) {
  return async function rollbackPharmacyPublicNoindex(
    request: PharmacyPublicRollbackRequest,
  ): Promise<PharmacyPublicRollbackResult> {
    if (!request.actorId.trim() || !request.entityId.trim()) return failed();

    const { data, error } = await client.rpc(
      "import_rollback_pharmacy_public_noindex_by_authority",
      {
        p_actor_profile_id: request.actorId,
        p_entity_id: request.entityId,
        p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
      },
    );
    if (error) return failed();
    return normalize(data);
  };
}
