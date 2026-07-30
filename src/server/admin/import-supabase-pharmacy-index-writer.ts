import "server-only";

export const PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION =
  "drkhaleej.import.pharmacyIndexPromotion.v1" as const;

export type PharmacyIndexPromotionRequest = Readonly<{
  actorId: string;
  entityId: string;
  idempotencyKey: string;
  requestHash: string;
}>;

export type PharmacyIndexRollbackRequest = Readonly<{
  actorId: string;
  entityId: string;
}>;

type PharmacyIndexPromotionConflictReason =
  | "index_idempotency_request_mismatch"
  | "index_actor_not_authorized"
  | "index_private_boundary_invalid"
  | "index_active_authority_exists"
  | "index_public_authority_not_available"
  | "index_public_authority_integrity_mismatch"
  | "index_candidate_state_invalid"
  | "index_candidate_content_ineligible"
  | "index_candidate_hash_mismatch"
  | "index_prerequisite_queue_integrity_mismatch"
  | "index_authorization_identity_mismatch"
  | "index_snapshot_hash_mismatch"
  | "index_authorization_not_active"
  | "index_authorization_expired"
  | "index_event_state_invalid"
  | "index_queue_missing";

type PharmacyIndexRollbackConflictReason =
  | "index_rollback_authority_not_available"
  | "index_rollback_snapshot_integrity_mismatch"
  | "index_rollback_readback_mismatch"
  | "index_rollback_event_state_invalid"
  | "index_rollback_private_boundary_invalid"
  | "index_rollback_public_authority_mismatch"
  | "index_rollback_candidate_state_invalid"
  | "index_rollback_candidate_hash_mismatch"
  | "index_promoted_queue_integrity_mismatch";

export type PharmacyIndexPromotionResult =
  | Readonly<{
      kind: "promoted" | "replayed";
      indexEligible: true;
      sitemapEligible: false;
      rollbackAvailable: true;
      authorityConsumed: true;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "conflict";
      reason: PharmacyIndexPromotionConflictReason;
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "failed";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>;

export type PharmacyIndexRollbackResult =
  | Readonly<{
      kind: "rolled_back" | "replayed";
      indexEligible: false;
      sitemapEligible: false;
      exactLogicalRecovery: true;
      authorityConsumed: true;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "conflict";
      reason: PharmacyIndexRollbackConflictReason;
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "failed";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>;

type RpcPayload = {
  status?: unknown;
  reason?: unknown;
  authorizationId?: unknown;
  lifecycleStatus?: unknown;
  visibility?: unknown;
  indexPolicy?: unknown;
  robotsPolicy?: unknown;
  sitemapPolicy?: unknown;
  sitemapIncluded?: unknown;
  rollbackAvailable?: unknown;
  exactLogicalRecovery?: unknown;
  authorityConsumed?: unknown;
  rawReferenceExposed?: unknown;
};

type PharmacyIndexRpcName =
  | "import_authorize_pharmacy_index_promotion"
  | "import_promote_pharmacy_index_by_authority"
  | "import_rollback_pharmacy_index_by_authority";

export type PharmacyIndexRpcClient = {
  rpc(
    name: PharmacyIndexRpcName,
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

const promotionConflictReasons = new Set<PharmacyIndexPromotionConflictReason>([
  "index_idempotency_request_mismatch",
  "index_actor_not_authorized",
  "index_private_boundary_invalid",
  "index_active_authority_exists",
  "index_public_authority_not_available",
  "index_public_authority_integrity_mismatch",
  "index_candidate_state_invalid",
  "index_candidate_content_ineligible",
  "index_candidate_hash_mismatch",
  "index_prerequisite_queue_integrity_mismatch",
  "index_authorization_identity_mismatch",
  "index_snapshot_hash_mismatch",
  "index_authorization_not_active",
  "index_authorization_expired",
  "index_event_state_invalid",
  "index_queue_missing",
]);

const rollbackConflictReasons = new Set<PharmacyIndexRollbackConflictReason>([
  "index_rollback_authority_not_available",
  "index_rollback_snapshot_integrity_mismatch",
  "index_rollback_readback_mismatch",
  "index_rollback_event_state_invalid",
  "index_rollback_private_boundary_invalid",
  "index_rollback_public_authority_mismatch",
  "index_rollback_candidate_state_invalid",
  "index_rollback_candidate_hash_mismatch",
  "index_promoted_queue_integrity_mismatch",
]);

function failedPromotion(): PharmacyIndexPromotionResult {
  return {
    kind: "failed",
    authorityConsumed: false,
    rawReferenceExposed: false,
  };
}

function failedRollback(): PharmacyIndexRollbackResult {
  return {
    kind: "failed",
    authorityConsumed: false,
    rawReferenceExposed: false,
  };
}

function payload(data: unknown): RpcPayload | null {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as RpcPayload)
    : null;
}

function promotionConflict(data: RpcPayload): PharmacyIndexPromotionResult | null {
  if (
    data.status === "conflict" &&
    typeof data.reason === "string" &&
    promotionConflictReasons.has(data.reason as PharmacyIndexPromotionConflictReason) &&
    data.authorityConsumed === false &&
    data.rawReferenceExposed === false
  ) {
    return {
      kind: "conflict",
      reason: data.reason as PharmacyIndexPromotionConflictReason,
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }
  return null;
}

function normalizePromotion(data: unknown): PharmacyIndexPromotionResult {
  const value = payload(data);
  if (!value) return failedPromotion();
  if (
    (value.status === "promoted" || value.status === "replayed") &&
    value.visibility === "public" &&
    value.indexPolicy === "index_eligible" &&
    value.robotsPolicy === "index" &&
    value.sitemapPolicy === "excluded" &&
    value.sitemapIncluded === false &&
    value.rollbackAvailable === true &&
    value.authorityConsumed === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      indexEligible: true,
      sitemapEligible: false,
      rollbackAvailable: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    };
  }
  return promotionConflict(value) ?? failedPromotion();
}

function normalizeRollback(data: unknown): PharmacyIndexRollbackResult {
  const value = payload(data);
  if (!value) return failedRollback();
  if (
    (value.status === "rolled_back" || value.status === "replayed") &&
    value.visibility === "public_noindex" &&
    value.indexPolicy === "noindex" &&
    value.robotsPolicy === "noindex" &&
    value.sitemapPolicy === "excluded" &&
    value.sitemapIncluded === false &&
    value.exactLogicalRecovery === true &&
    value.authorityConsumed === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      indexEligible: false,
      sitemapEligible: false,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    };
  }
  if (
    value.status === "conflict" &&
    typeof value.reason === "string" &&
    rollbackConflictReasons.has(value.reason as PharmacyIndexRollbackConflictReason) &&
    value.authorityConsumed === false &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: "conflict",
      reason: value.reason as PharmacyIndexRollbackConflictReason,
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }
  return failedRollback();
}

function validPromotionRequest(request: PharmacyIndexPromotionRequest): boolean {
  return (
    request.actorId.trim().length > 0 &&
    request.entityId.trim().length > 0 &&
    request.idempotencyKey.trim().length >= 8 &&
    /^[a-f0-9]{64}$/.test(request.requestHash)
  );
}

export function createSupabasePharmacyIndexWriter(client: PharmacyIndexRpcClient) {
  return {
    promote: async (
      request: PharmacyIndexPromotionRequest,
    ): Promise<PharmacyIndexPromotionResult> => {
      if (!validPromotionRequest(request)) return failedPromotion();

      const authorization = await client.rpc(
        "import_authorize_pharmacy_index_promotion",
        {
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_idempotency_key: request.idempotencyKey,
          p_request_hash: request.requestHash,
          p_schema_version: PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
          p_ttl_hours: 24,
        },
      );
      if (authorization.error) return failedPromotion();
      const authorized = payload(authorization.data);
      if (!authorized) return failedPromotion();
      const conflict = promotionConflict(authorized);
      if (conflict) return conflict;
      if (
        (authorized.status !== "issued" && authorized.status !== "replayed") ||
        typeof authorized.authorizationId !== "string" ||
        authorized.authorizationId.trim().length === 0 ||
        authorized.rawReferenceExposed !== false
      ) {
        return failedPromotion();
      }

      const promoted = await client.rpc(
        "import_promote_pharmacy_index_by_authority",
        {
          p_authorization_id: authorized.authorizationId,
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_request_hash: request.requestHash,
          p_schema_version: PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
        },
      );
      return promoted.error ? failedPromotion() : normalizePromotion(promoted.data);
    },
    rollback: async (
      request: PharmacyIndexRollbackRequest,
    ): Promise<PharmacyIndexRollbackResult> => {
      if (!request.actorId.trim() || !request.entityId.trim()) {
        return failedRollback();
      }
      const result = await client.rpc(
        "import_rollback_pharmacy_index_by_authority",
        {
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_schema_version: PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION,
        },
      );
      return result.error ? failedRollback() : normalizeRollback(result.data);
    },
  };
}
