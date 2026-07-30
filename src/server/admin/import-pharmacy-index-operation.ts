import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  createSupabasePharmacyIndexWriter,
  type PharmacyIndexPromotionResult,
  type PharmacyIndexRollbackResult,
  type PharmacyIndexRpcClient,
} from "./import-supabase-pharmacy-index-writer";

export type PharmacyIndexRuntimePolicy = Readonly<{
  promotionEnabled: boolean;
  rollbackEnabled: boolean;
  environment: string | undefined;
  previewProjectRef: string | undefined;
  productionProjectRef: string | undefined;
  supabaseUrl: string | undefined;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
}>;

export type PharmacyIndexPromotionOperationResult = Readonly<{
  promoted: boolean;
  replayed: boolean;
  blocker: "index_boundary_blocked" | "index_execution_failed" | null;
  visibility: "public";
  indexEligible: boolean;
  sitemapEligible: false;
  routeEnabled: true;
  rollbackAvailable: boolean;
  rawReferenceExposed: false;
}>;

export type PharmacyIndexRollbackOperationResult = Readonly<{
  rolledBack: boolean;
  replayed: boolean;
  blocker: "index_rollback_boundary_blocked" | "index_rollback_execution_failed" | null;
  visibility: "public_noindex";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: true;
  exactLogicalRecovery: boolean;
  rawReferenceExposed: false;
}>;

export type PharmacyIndexOperationDependencies = Readonly<{
  promote(input: {
    actorId: string;
    entityId: string;
    idempotencyKey: string;
    requestHash: string;
  }): Promise<PharmacyIndexPromotionResult>;
  rollback(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacyIndexRollbackResult>;
}>;

function runtimeAllowed(
  policy: PharmacyIndexRuntimePolicy,
  actorId: string,
  entityId: string,
): boolean {
  const previewRef = policy.previewProjectRef?.trim();
  const productionRef = policy.productionProjectRef?.trim();
  const supabaseUrl = policy.supabaseUrl?.trim();
  return (
    policy.environment === "preview" &&
    Boolean(previewRef) &&
    Boolean(productionRef) &&
    previewRef !== productionRef &&
    Boolean(supabaseUrl) &&
    supabaseUrl!.includes(previewRef!) &&
    !supabaseUrl!.includes(productionRef!) &&
    policy.allowedActorIds.includes(actorId) &&
    policy.allowedEntityIds.includes(entityId)
  );
}

export async function runPharmacyIndexPromotionOperation(input: {
  actorId: string;
  entityId: string;
  idempotencyKey: string;
  requestHash: string;
  confirmation: string;
  policy: PharmacyIndexRuntimePolicy;
  dependencies: Pick<PharmacyIndexOperationDependencies, "promote">;
}): Promise<PharmacyIndexPromotionOperationResult> {
  if (
    !input.policy.promotionEnabled ||
    !runtimeAllowed(input.policy, input.actorId, input.entityId) ||
    input.confirmation !== `PROMOTE PHARMACY INDEX ${input.entityId}`
  ) {
    return {
      promoted: false,
      replayed: false,
      blocker: "index_boundary_blocked",
      visibility: "public",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: true,
      rollbackAvailable: false,
      rawReferenceExposed: false,
    };
  }

  const result = await input.dependencies.promote({
    actorId: input.actorId,
    entityId: input.entityId,
    idempotencyKey: input.idempotencyKey,
    requestHash: input.requestHash,
  });
  if (result.kind === "promoted" || result.kind === "replayed") {
    return {
      promoted: true,
      replayed: result.kind === "replayed",
      blocker: null,
      visibility: "public",
      indexEligible: true,
      sitemapEligible: false,
      routeEnabled: true,
      rollbackAvailable: true,
      rawReferenceExposed: false,
    };
  }
  return {
    promoted: false,
    replayed: false,
    blocker: "index_execution_failed",
    visibility: "public",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: true,
    rollbackAvailable: false,
    rawReferenceExposed: false,
  };
}

export async function runPharmacyIndexRollbackOperation(input: {
  actorId: string;
  entityId: string;
  confirmation: string;
  policy: PharmacyIndexRuntimePolicy;
  dependencies: Pick<PharmacyIndexOperationDependencies, "rollback">;
}): Promise<PharmacyIndexRollbackOperationResult> {
  if (
    !input.policy.rollbackEnabled ||
    !runtimeAllowed(input.policy, input.actorId, input.entityId) ||
    input.confirmation !== `ROLLBACK PHARMACY INDEX ${input.entityId}`
  ) {
    return {
      rolledBack: false,
      replayed: false,
      blocker: "index_rollback_boundary_blocked",
      visibility: "public_noindex",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: true,
      exactLogicalRecovery: false,
      rawReferenceExposed: false,
    };
  }

  const result = await input.dependencies.rollback({
    actorId: input.actorId,
    entityId: input.entityId,
  });
  if (result.kind === "rolled_back" || result.kind === "replayed") {
    return {
      rolledBack: true,
      replayed: result.kind === "replayed",
      blocker: null,
      visibility: "public_noindex",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: true,
      exactLogicalRecovery: result.exactLogicalRecovery,
      rawReferenceExposed: false,
    };
  }
  return {
    rolledBack: false,
    replayed: false,
    blocker: "index_rollback_execution_failed",
    visibility: "public_noindex",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: true,
    exactLogicalRecovery: false,
    rawReferenceExposed: false,
  };
}

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function createPharmacyIndexRuntimeFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): {
  policy: PharmacyIndexRuntimePolicy;
  dependencies: PharmacyIndexOperationDependencies | null;
} {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const policy: PharmacyIndexRuntimePolicy = {
    promotionEnabled:
      environment.IMPORT_PHARMACY_INDEX_PROMOTION_ENABLED === "true",
    rollbackEnabled:
      environment.IMPORT_PHARMACY_INDEX_ROLLBACK_ENABLED === "true",
    environment: environment.VERCEL_ENV,
    previewProjectRef: environment.PREVIEW_PROJECT_REF,
    productionProjectRef: environment.PRODUCTION_PROJECT_REF,
    supabaseUrl: url,
    allowedActorIds: parseAllowlist(
      environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS,
    ),
    allowedEntityIds: parseAllowlist(
      environment.IMPORT_PREVIEW_CANARY_ENTITY_IDS,
    ),
  };
  if (!url || !key) return { policy, dependencies: null };
  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const writer = createSupabasePharmacyIndexWriter(
    client as unknown as PharmacyIndexRpcClient,
  );
  return { policy, dependencies: writer };
}
