import "server-only";

export type ImportPharmacyPrivateRollbackRequest = {
  reservationId: string;
  rollbackSnapshotId: string;
  entityId: string;
  actorId: string;
  expectedCurrentVersion: string;
  expectedSnapshotHash: string;
};

export type ImportPharmacyPrivateRollbackResult =
  | { kind: "rolled_back" | "replayed"; entityId: string; actualVersion: string }
  | {
      kind: "conflict";
      reason:
        | "rollback_identity_mismatch"
        | "rollback_snapshot_hash_mismatch"
        | "rollback_source_not_succeeded"
        | "rollback_terminal_version_mismatch"
        | "rollback_snapshot_not_private_pharmacy"
        | "entity_not_pharmacy"
        | "rollback_current_version_mismatch";
    }
  | { kind: "failed" };

export type ImportPharmacyRollbackRpcClient = {
  rpc(
    name: "import_rollback_pharmacy_private",
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

type RpcPayload = {
  status?: unknown;
  entityId?: unknown;
  actualVersion?: unknown;
  reason?: unknown;
};

const conflictReasons = new Set([
  "rollback_identity_mismatch",
  "rollback_snapshot_hash_mismatch",
  "rollback_source_not_succeeded",
  "rollback_terminal_version_mismatch",
  "rollback_snapshot_not_private_pharmacy",
  "entity_not_pharmacy",
  "rollback_current_version_mismatch",
]);

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function normalize(data: unknown): ImportPharmacyPrivateRollbackResult {
  if (!data || typeof data !== "object") return { kind: "failed" };
  const value = data as RpcPayload;

  if (
    (value.status === "rolled_back" || value.status === "replayed") &&
    typeof value.entityId === "string" &&
    typeof value.actualVersion === "string"
  ) {
    return { kind: value.status, entityId: value.entityId, actualVersion: value.actualVersion };
  }

  if (value.status === "conflict" && typeof value.reason === "string" && conflictReasons.has(value.reason)) {
    return {
      kind: "conflict",
      reason: value.reason as Extract<ImportPharmacyPrivateRollbackResult, { kind: "conflict" }>['reason'],
    };
  }

  return { kind: "failed" };
}

export function createSupabasePharmacyPrivateRollbackWriter(client: ImportPharmacyRollbackRpcClient) {
  return async function rollbackPharmacyPrivate(
    request: ImportPharmacyPrivateRollbackRequest,
  ): Promise<ImportPharmacyPrivateRollbackResult> {
    if (
      !request.reservationId ||
      !request.rollbackSnapshotId ||
      !request.entityId ||
      !request.actorId ||
      !request.expectedCurrentVersion ||
      !isSha256(request.expectedSnapshotHash)
    ) {
      return { kind: "failed" };
    }

    const { data, error } = await client.rpc("import_rollback_pharmacy_private", {
      p_idempotency_record_id: request.reservationId,
      p_rollback_snapshot_id: request.rollbackSnapshotId,
      p_entity_id: request.entityId,
      p_actor_profile_id: request.actorId,
      p_expected_current_version: request.expectedCurrentVersion,
      p_expected_snapshot_hash: request.expectedSnapshotHash,
      p_audit_schema_version: "1",
    });

    if (error) return { kind: "failed" };
    return normalize(data);
  };
}
