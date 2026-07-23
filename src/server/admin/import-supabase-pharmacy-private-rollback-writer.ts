import "server-only";

export type ImportPharmacyPrivateRollbackRequest = {
  entityId: string;
  actorId: string;
};

export type ImportPharmacyPrivateRollbackResult =
  | {
      kind: "rolled_back" | "replayed";
      entityId: string;
      actualVersion: string;
      authorityConsumed: true;
      privateBoundaryVerified: true;
      rawReferenceExposed: false;
    }
  | {
      kind: "conflict";
      reason:
        | "rollback_authority_not_available"
        | "rollback_authority_ambiguous"
        | "rollback_private_boundary_invalid"
        | "rollback_identity_mismatch"
        | "rollback_snapshot_hash_mismatch"
        | "rollback_source_not_succeeded"
        | "rollback_terminal_version_mismatch"
        | "rollback_snapshot_not_private_pharmacy"
        | "entity_not_pharmacy"
        | "rollback_current_version_mismatch";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }
  | { kind: "failed"; authorityConsumed: false; rawReferenceExposed: false };

export type ImportPharmacyRollbackRpcClient = {
  rpc(
    name: "import_rollback_pharmacy_private_by_authority",
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

type RpcPayload = {
  status?: unknown;
  entityId?: unknown;
  actualVersion?: unknown;
  reason?: unknown;
  authorityConsumed?: unknown;
  privateBoundaryVerified?: unknown;
  rawReferenceExposed?: unknown;
};

const conflictReasons = new Set([
  "rollback_authority_not_available",
  "rollback_authority_ambiguous",
  "rollback_private_boundary_invalid",
  "rollback_identity_mismatch",
  "rollback_snapshot_hash_mismatch",
  "rollback_source_not_succeeded",
  "rollback_terminal_version_mismatch",
  "rollback_snapshot_not_private_pharmacy",
  "entity_not_pharmacy",
  "rollback_current_version_mismatch",
]);

function normalize(data: unknown): ImportPharmacyPrivateRollbackResult {
  if (!data || typeof data !== "object") {
    return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
  }
  const value = data as RpcPayload;

  if (
    (value.status === "rolled_back" || value.status === "replayed") &&
    typeof value.entityId === "string" &&
    typeof value.actualVersion === "string" &&
    value.authorityConsumed === true &&
    value.privateBoundaryVerified === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      entityId: value.entityId,
      actualVersion: value.actualVersion,
      authorityConsumed: true,
      privateBoundaryVerified: true,
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
      reason: value.reason as Extract<ImportPharmacyPrivateRollbackResult, { kind: "conflict" }>["reason"],
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }

  return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
}

export function createSupabasePharmacyPrivateRollbackWriter(client: ImportPharmacyRollbackRpcClient) {
  return async function rollbackPharmacyPrivate(
    request: ImportPharmacyPrivateRollbackRequest,
  ): Promise<ImportPharmacyPrivateRollbackResult> {
    if (!request.entityId.trim() || !request.actorId.trim()) {
      return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
    }

    const { data, error } = await client.rpc("import_rollback_pharmacy_private_by_authority", {
      p_entity_id: request.entityId,
      p_actor_profile_id: request.actorId,
      p_audit_schema_version: "drkhaleej.import.publishAudit.v4",
    });

    if (error) return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
    return normalize(data);
  };
}
