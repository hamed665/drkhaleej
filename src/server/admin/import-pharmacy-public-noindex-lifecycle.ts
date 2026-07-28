import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { resolvePublicProviderCanonicalRoute } from "@/lib/catalog/public-provider-route-resolver";

export const PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION =
  "drkhaleej.import.pharmacyPublicNoindex.v1" as const;

export type PharmacyPublicNoindexLifecycleResult =
  | {
      ok: true;
      status: "published" | "replayed" | "rolled_back";
      visibility: "public" | "private";
      indexPolicy: "noindex";
      sitemapPolicy: "excluded";
      productionConnected: false;
    }
  | {
      ok: false;
      reason:
        | "runtime_disabled"
        | "environment_not_preview"
        | "preview_identity_invalid"
        | "actor_not_allowed"
        | "entity_not_allowed"
        | "route_invalid"
        | "authorization_failed"
        | "publish_failed"
        | "rollback_failed";
    };

type RpcResult = {
  data: unknown;
  error: { message?: string } | null;
};

export type PharmacyPublicNoindexRpcPort = {
  rpc(name: string, parameters: Record<string, unknown>): PromiseLike<RpcResult>;
};

export type PharmacyPublicNoindexRuntimePolicy = {
  executionEnabled: boolean;
  environment: string | undefined;
  previewProjectRef: string | undefined;
  productionProjectRef: string | undefined;
  supabaseUrl: string | undefined;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
};

export type PublishPharmacyPublicNoindexInput = {
  actorId: string;
  entityId: string;
  candidateId: string;
  expectedEntityVersion: string;
  slug: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;
  const next = value[key];
  return typeof next === "string" && next.trim().length > 0 ? next : null;
}

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function resolveBilingualPaths(slug: string): { en: string; ar: string } | null {
  const english = resolvePublicProviderCanonicalRoute({
    family: "pharmacy",
    slug,
    locale: "en",
    country: "om",
  });
  const arabic = resolvePublicProviderCanonicalRoute({
    family: "pharmacy",
    slug,
    locale: "ar",
    country: "om",
  });
  if (
    !english.publicRouteEnabled ||
    !arabic.publicRouteEnabled ||
    english.canonicalPath === null ||
    arabic.canonicalPath === null
  ) {
    return null;
  }
  return { en: english.canonicalPath, ar: arabic.canonicalPath };
}

function validateRuntime(
  policy: PharmacyPublicNoindexRuntimePolicy,
  actorId: string,
  entityId: string,
): PharmacyPublicNoindexLifecycleResult | null {
  if (!policy.executionEnabled) return { ok: false, reason: "runtime_disabled" };
  if (policy.environment !== "preview") return { ok: false, reason: "environment_not_preview" };

  const previewRef = policy.previewProjectRef?.trim();
  const productionRef = policy.productionProjectRef?.trim();
  const url = policy.supabaseUrl?.trim();
  if (
    !previewRef ||
    !productionRef ||
    previewRef === productionRef ||
    !url ||
    !url.includes(previewRef) ||
    url.includes(productionRef)
  ) {
    return { ok: false, reason: "preview_identity_invalid" };
  }
  if (!policy.allowedActorIds.includes(actorId)) return { ok: false, reason: "actor_not_allowed" };
  if (!policy.allowedEntityIds.includes(entityId)) return { ok: false, reason: "entity_not_allowed" };
  return null;
}

export async function publishPharmacyPublicNoindex(
  input: PublishPharmacyPublicNoindexInput,
  dependencies: {
    port: PharmacyPublicNoindexRpcPort;
    policy: PharmacyPublicNoindexRuntimePolicy;
    idempotencyKey?: string;
  },
): Promise<PharmacyPublicNoindexLifecycleResult> {
  const runtimeFailure = validateRuntime(dependencies.policy, input.actorId, input.entityId);
  if (runtimeFailure) return runtimeFailure;

  const paths = resolveBilingualPaths(input.slug);
  if (paths === null) return { ok: false, reason: "route_invalid" };

  const idempotencyKey = dependencies.idempotencyKey ?? randomUUID();
  const requestHash = sha256({
    operation: "pharmacy_public_noindex",
    actorId: input.actorId,
    entityId: input.entityId,
    candidateId: input.candidateId,
    expectedEntityVersion: input.expectedEntityVersion,
    paths,
    schemaVersion: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
  });

  const authorizationResponse = await dependencies.port.rpc(
    "import_authorize_pharmacy_public_noindex",
    {
      p_actor_profile_id: input.actorId,
      p_entity_id: input.entityId,
      p_candidate_id: input.candidateId,
      p_idempotency_key: idempotencyKey,
      p_request_hash: requestHash,
      p_expected_entity_version: input.expectedEntityVersion,
      p_canonical_path_en: paths.en,
      p_canonical_path_ar: paths.ar,
      p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
      p_ttl_hours: 24,
    },
  );
  const authorizationStatus = readString(authorizationResponse.data, "status");
  const authorizationId = readString(authorizationResponse.data, "authorizationId");
  if (
    authorizationResponse.error ||
    !authorizationId ||
    (authorizationStatus !== "issued" && authorizationStatus !== "replayed")
  ) {
    return { ok: false, reason: "authorization_failed" };
  }

  const publishResponse = await dependencies.port.rpc(
    "import_publish_pharmacy_public_noindex",
    {
      p_authorization_id: authorizationId,
      p_actor_profile_id: input.actorId,
      p_entity_id: input.entityId,
      p_request_hash: requestHash,
      p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
    },
  );
  const publishStatus = readString(publishResponse.data, "status");
  if (
    publishResponse.error ||
    (publishStatus !== "published" && publishStatus !== "replayed")
  ) {
    return { ok: false, reason: "publish_failed" };
  }

  return {
    ok: true,
    status: publishStatus,
    visibility: "public",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    productionConnected: false,
  };
}

export async function rollbackPharmacyPublicNoindex(
  input: { actorId: string; entityId: string },
  dependencies: {
    port: PharmacyPublicNoindexRpcPort;
    policy: PharmacyPublicNoindexRuntimePolicy;
  },
): Promise<PharmacyPublicNoindexLifecycleResult> {
  const runtimeFailure = validateRuntime(dependencies.policy, input.actorId, input.entityId);
  if (runtimeFailure) return runtimeFailure;

  const response = await dependencies.port.rpc(
    "import_rollback_pharmacy_public_noindex_by_authority",
    {
      p_actor_profile_id: input.actorId,
      p_entity_id: input.entityId,
      p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
    },
  );
  const status = readString(response.data, "status");
  if (response.error || (status !== "rolled_back" && status !== "replayed")) {
    return { ok: false, reason: "rollback_failed" };
  }

  return {
    ok: true,
    status: status === "rolled_back" ? "rolled_back" : "replayed",
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    productionConnected: false,
  };
}

export function createPharmacyPublicNoindexRuntimeFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): {
  port: PharmacyPublicNoindexRpcPort;
  policy: PharmacyPublicNoindexRuntimePolicy;
} {
  return {
    port: createSupabaseServiceRoleClient() as unknown as PharmacyPublicNoindexRpcPort,
    policy: {
      executionEnabled: environment.IMPORT_PHARMACY_PUBLIC_NOINDEX_ENABLED === "true",
      environment: environment.VERCEL_ENV,
      previewProjectRef: environment.PREVIEW_PROJECT_REF,
      productionProjectRef: environment.PRODUCTION_PROJECT_REF,
      supabaseUrl: environment.NEXT_PUBLIC_SUPABASE_URL,
      allowedActorIds: parseAllowlist(environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS),
      allowedEntityIds: parseAllowlist(environment.IMPORT_PREVIEW_CANARY_ENTITY_IDS),
    },
  };
}
