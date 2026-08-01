import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  createSupabasePharmacySitemapWriter,
  type PharmacySitemapPromotionResult,
  type PharmacySitemapRollbackResult,
  type PharmacySitemapRpcClient,
} from "./import-supabase-pharmacy-sitemap-writer";

export type PharmacySitemapRuntimePolicy = Readonly<{
  promotionEnabled: boolean;
  rollbackEnabled: boolean;
  environment: string | undefined;
  previewProjectRef: string | undefined;
  productionProjectRef: string | undefined;
  supabaseUrl: string | undefined;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
}>;

export type PharmacySitemapPromotionOperationResult = Readonly<{
  included: boolean;
  replayed: boolean;
  blocker: "sitemap_boundary_blocked" | "sitemap_execution_failed" | null;
  visibility: "public";
  indexEligible: true;
  sitemapEligible: boolean;
  routeEnabled: true;
  rollbackAvailable: boolean;
  rawReferenceExposed: false;
}>;

export type PharmacySitemapRollbackOperationResult = Readonly<{
  rolledBack: boolean;
  replayed: boolean;
  blocker:
    | "sitemap_rollback_boundary_blocked"
    | "sitemap_rollback_execution_failed"
    | null;
  visibility: "public";
  indexEligible: true;
  sitemapEligible: false;
  routeEnabled: true;
  exactLogicalRecovery: boolean;
  rawReferenceExposed: false;
}>;

export type PharmacySitemapOperationDependencies = Readonly<{
  promote(input: {
    actorId: string;
    entityId: string;
    idempotencyKey: string;
    requestHash: string;
  }): Promise<PharmacySitemapPromotionResult>;
  rollback(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacySitemapRollbackResult>;
}>;

function runtimeAllowed(
  policy: PharmacySitemapRuntimePolicy,
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

export async function runPharmacySitemapPromotionOperation(input: {
  actorId: string;
  entityId: string;
  idempotencyKey: string;
  requestHash: string;
  confirmation: string;
  policy: PharmacySitemapRuntimePolicy;
  dependencies: Pick<PharmacySitemapOperationDependencies, "promote">;
}): Promise<PharmacySitemapPromotionOperationResult> {
  if (
    !input.policy.promotionEnabled ||
    !runtimeAllowed(input.policy, input.actorId, input.entityId) ||
    input.confirmation !== `INCLUDE PHARMACY SITEMAP ${input.entityId}`
  ) {
    return {
      included: false,
      replayed: false,
      blocker: "sitemap_boundary_blocked",
      visibility: "public",
      indexEligible: true,
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
  if (result.kind === "included" || result.kind === "replayed") {
    return {
      included: true,
      replayed: result.kind === "replayed",
      blocker: null,
      visibility: "public",
      indexEligible: true,
      sitemapEligible: true,
      routeEnabled: true,
      rollbackAvailable: true,
      rawReferenceExposed: false,
    };
  }
  return {
    included: false,
    replayed: false,
    blocker: "sitemap_execution_failed",
    visibility: "public",
    indexEligible: true,
    sitemapEligible: false,
    routeEnabled: true,
    rollbackAvailable: false,
    rawReferenceExposed: false,
  };
}

export async function runPharmacySitemapRollbackOperation(input: {
  actorId: string;
  entityId: string;
  confirmation: string;
  policy: PharmacySitemapRuntimePolicy;
  dependencies: Pick<PharmacySitemapOperationDependencies, "rollback">;
}): Promise<PharmacySitemapRollbackOperationResult> {
  if (
    !input.policy.rollbackEnabled ||
    !runtimeAllowed(input.policy, input.actorId, input.entityId) ||
    input.confirmation !== `ROLLBACK PHARMACY SITEMAP ${input.entityId}`
  ) {
    return {
      rolledBack: false,
      replayed: false,
      blocker: "sitemap_rollback_boundary_blocked",
      visibility: "public",
      indexEligible: true,
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
      visibility: "public",
      indexEligible: true,
      sitemapEligible: false,
      routeEnabled: true,
      exactLogicalRecovery: result.exactLogicalRecovery,
      rawReferenceExposed: false,
    };
  }
  return {
    rolledBack: false,
    replayed: false,
    blocker: "sitemap_rollback_execution_failed",
    visibility: "public",
    indexEligible: true,
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

export function createPharmacySitemapRuntimeFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): {
  policy: PharmacySitemapRuntimePolicy;
  dependencies: PharmacySitemapOperationDependencies | null;
} {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const policy: PharmacySitemapRuntimePolicy = {
    promotionEnabled:
      environment.IMPORT_PHARMACY_SITEMAP_PROMOTION_ENABLED === "true",
    rollbackEnabled:
      environment.IMPORT_PHARMACY_SITEMAP_ROLLBACK_ENABLED === "true",
    environment: environment.VERCEL_ENV,
    previewProjectRef: environment.PREVIEW_PROJECT_REF,
    productionProjectRef: environment.PRODUCTION_PROJECT_REF,
    supabaseUrl: url,
    allowedActorIds: parseAllowlist(environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS),
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
  const writer = createSupabasePharmacySitemapWriter(
    client as unknown as PharmacySitemapRpcClient,
  );
  return { policy, dependencies: writer };
}
