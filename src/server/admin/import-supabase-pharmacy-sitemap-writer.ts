import "server-only";

export const PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION =
  "drkhaleej.import.pharmacySitemapPromotion.v1" as const;

export type PharmacySitemapPromotionRequest = Readonly<{
  actorId: string;
  entityId: string;
  idempotencyKey: string;
  requestHash: string;
}>;

export type PharmacySitemapRollbackRequest = Readonly<{
  actorId: string;
  entityId: string;
}>;

type PharmacySitemapPromotionConflictReason =
  | "sitemap_idempotency_request_mismatch"
  | "sitemap_actor_not_authorized"
  | "sitemap_private_boundary_invalid"
  | "sitemap_active_authority_exists"
  | "sitemap_index_authority_not_available"
  | "sitemap_index_authority_integrity_mismatch"
  | "sitemap_candidate_state_invalid"
  | "sitemap_candidate_content_ineligible"
  | "sitemap_candidate_hash_mismatch"
  | "sitemap_prerequisite_queue_integrity_mismatch"
  | "sitemap_authorization_identity_mismatch"
  | "sitemap_snapshot_hash_mismatch"
  | "sitemap_authorization_not_active"
  | "sitemap_authorization_expired"
  | "sitemap_event_state_invalid"
  | "sitemap_queue_missing";

type PharmacySitemapRollbackConflictReason =
  | "sitemap_rollback_authority_not_available"
  | "sitemap_rollback_snapshot_integrity_mismatch"
  | "sitemap_rollback_readback_mismatch"
  | "sitemap_rollback_event_state_invalid"
  | "sitemap_rollback_private_boundary_invalid"
  | "sitemap_rollback_index_authority_mismatch"
  | "sitemap_rollback_candidate_state_invalid"
  | "sitemap_rollback_candidate_hash_mismatch"
  | "sitemap_included_queue_integrity_mismatch";

export type PharmacySitemapPromotionResult =
  | Readonly<{
      kind: "included" | "replayed";
      indexEligible: true;
      sitemapEligible: true;
      rollbackAvailable: true;
      authorityConsumed: true;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "conflict";
      reason: PharmacySitemapPromotionConflictReason;
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "failed";
      authorityConsumed: false;
      rawReferenceExposed: false;
    }>;

export type PharmacySitemapRollbackResult =
  | Readonly<{
      kind: "rolled_back" | "replayed";
      indexEligible: true;
      sitemapEligible: false;
      exactLogicalRecovery: true;
      authorityConsumed: true;
      rawReferenceExposed: false;
    }>
  | Readonly<{
      kind: "conflict";
      reason: PharmacySitemapRollbackConflictReason;
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

type PharmacySitemapRpcName =
  | "import_authorize_pharmacy_sitemap_promotion"
  | "import_include_pharmacy_sitemap_by_authority"
  | "import_rollback_pharmacy_sitemap_by_authority";

export type PharmacySitemapRpcClient = {
  rpc(
    name: PharmacySitemapRpcName,
    args: Readonly<Record<string, unknown>>,
  ): Promise<{ data: unknown; error: { message?: string } | null }>;
};

const promotionConflictReasons = new Set<PharmacySitemapPromotionConflictReason>([
  "sitemap_idempotency_request_mismatch",
  "sitemap_actor_not_authorized",
  "sitemap_private_boundary_invalid",
  "sitemap_active_authority_exists",
  "sitemap_index_authority_not_available",
  "sitemap_index_authority_integrity_mismatch",
  "sitemap_candidate_state_invalid",
  "sitemap_candidate_content_ineligible",
  "sitemap_candidate_hash_mismatch",
  "sitemap_prerequisite_queue_integrity_mismatch",
  "sitemap_authorization_identity_mismatch",
  "sitemap_snapshot_hash_mismatch",
  "sitemap_authorization_not_active",
  "sitemap_authorization_expired",
  "sitemap_event_state_invalid",
  "sitemap_queue_missing",
]);

const rollbackConflictReasons = new Set<PharmacySitemapRollbackConflictReason>([
  "sitemap_rollback_authority_not_available",
  "sitemap_rollback_snapshot_integrity_mismatch",
  "sitemap_rollback_readback_mismatch",
  "sitemap_rollback_event_state_invalid",
  "sitemap_rollback_private_boundary_invalid",
  "sitemap_rollback_index_authority_mismatch",
  "sitemap_rollback_candidate_state_invalid",
  "sitemap_rollback_candidate_hash_mismatch",
  "sitemap_included_queue_integrity_mismatch",
]);

function failedPromotion(): PharmacySitemapPromotionResult {
  return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
}

function failedRollback(): PharmacySitemapRollbackResult {
  return { kind: "failed", authorityConsumed: false, rawReferenceExposed: false };
}

function payload(data: unknown): RpcPayload | null {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as RpcPayload)
    : null;
}

function promotionConflict(data: RpcPayload): PharmacySitemapPromotionResult | null {
  if (
    data.status === "conflict" &&
    typeof data.reason === "string" &&
    promotionConflictReasons.has(data.reason as PharmacySitemapPromotionConflictReason) &&
    data.authorityConsumed === false &&
    data.rawReferenceExposed === false
  ) {
    return {
      kind: "conflict",
      reason: data.reason as PharmacySitemapPromotionConflictReason,
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }
  return null;
}

function normalizePromotion(data: unknown): PharmacySitemapPromotionResult {
  const value = payload(data);
  if (!value) return failedPromotion();
  if (
    (value.status === "included" || value.status === "replayed") &&
    value.visibility === "public" &&
    value.indexPolicy === "index" &&
    value.robotsPolicy === "index" &&
    value.sitemapPolicy === "included" &&
    value.sitemapIncluded === true &&
    value.rollbackAvailable === true &&
    value.authorityConsumed === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      indexEligible: true,
      sitemapEligible: true,
      rollbackAvailable: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    };
  }
  return promotionConflict(value) ?? failedPromotion();
}

function normalizeRollback(data: unknown): PharmacySitemapRollbackResult {
  const value = payload(data);
  if (!value) return failedRollback();
  if (
    (value.status === "rolled_back" || value.status === "replayed") &&
    value.visibility === "public" &&
    value.indexPolicy === "index_eligible" &&
    value.robotsPolicy === "index" &&
    value.sitemapPolicy === "excluded" &&
    value.sitemapIncluded === false &&
    value.exactLogicalRecovery === true &&
    value.authorityConsumed === true &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: value.status,
      indexEligible: true,
      sitemapEligible: false,
      exactLogicalRecovery: true,
      authorityConsumed: true,
      rawReferenceExposed: false,
    };
  }
  if (
    value.status === "conflict" &&
    typeof value.reason === "string" &&
    rollbackConflictReasons.has(value.reason as PharmacySitemapRollbackConflictReason) &&
    value.authorityConsumed === false &&
    value.rawReferenceExposed === false
  ) {
    return {
      kind: "conflict",
      reason: value.reason as PharmacySitemapRollbackConflictReason,
      authorityConsumed: false,
      rawReferenceExposed: false,
    };
  }
  return failedRollback();
}

function validPromotionRequest(request: PharmacySitemapPromotionRequest): boolean {
  return (
    request.actorId.trim().length > 0 &&
    request.entityId.trim().length > 0 &&
    request.idempotencyKey.trim().length >= 8 &&
    /^[a-f0-9]{64}$/.test(request.requestHash)
  );
}

export function createSupabasePharmacySitemapWriter(client: PharmacySitemapRpcClient) {
  return {
    promote: async (
      request: PharmacySitemapPromotionRequest,
    ): Promise<PharmacySitemapPromotionResult> => {
      if (!validPromotionRequest(request)) return failedPromotion();

      const authorization = await client.rpc(
        "import_authorize_pharmacy_sitemap_promotion",
        {
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_idempotency_key: request.idempotencyKey,
          p_request_hash: request.requestHash,
          p_schema_version: PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION,
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
        "import_include_pharmacy_sitemap_by_authority",
        {
          p_authorization_id: authorized.authorizationId,
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_request_hash: request.requestHash,
          p_schema_version: PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION,
        },
      );
      return promoted.error ? failedPromotion() : normalizePromotion(promoted.data);
    },
    rollback: async (
      request: PharmacySitemapRollbackRequest,
    ): Promise<PharmacySitemapRollbackResult> => {
      if (!request.actorId.trim() || !request.entityId.trim()) return failedRollback();
      const result = await client.rpc(
        "import_rollback_pharmacy_sitemap_by_authority",
        {
          p_actor_profile_id: request.actorId,
          p_entity_id: request.entityId,
          p_schema_version: PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION,
        },
      );
      return result.error ? failedRollback() : normalizeRollback(result.data);
    },
  };
}
