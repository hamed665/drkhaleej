import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  createSupabasePharmacyPublicRollbackWriter,
  type PharmacyPublicRollbackRpcClient,
  type PharmacyPublicRollbackResult,
} from "./import-supabase-pharmacy-public-rollback-writer";

export type PharmacyPublicRollbackRuntimePolicy = Readonly<{
  executionEnabled: boolean;
  environment: string | undefined;
  previewProjectRef: string | undefined;
  productionProjectRef: string | undefined;
  supabaseUrl: string | undefined;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
}>;

export type PharmacyPublicRollbackOperationResult = Readonly<{
  rolledBack: boolean;
  replayed: boolean;
  blocker:
    | "rollback_boundary_blocked"
    | "rollback_execution_failed"
    | null;
  visibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  exactLogicalRecovery: boolean;
  rawReferenceExposed: false;
}>;

export type PharmacyPublicRollbackOperationDependencies = Readonly<{
  rollback(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacyPublicRollbackResult>;
}>;

function boundedResult(
  input: Pick<
    PharmacyPublicRollbackOperationResult,
    "rolledBack" | "replayed" | "blocker" | "exactLogicalRecovery"
  >,
): PharmacyPublicRollbackOperationResult {
  return {
    ...input,
    visibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
  };
}

function runtimeAllowed(
  policy: PharmacyPublicRollbackRuntimePolicy,
  actorId: string,
  entityId: string,
): boolean {
  const previewRef = policy.previewProjectRef?.trim();
  const productionRef = policy.productionProjectRef?.trim();
  const supabaseUrl = policy.supabaseUrl?.trim();
  return (
    policy.executionEnabled &&
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

export async function runPharmacyPublicRollbackOperation(input: {
  actorId: string;
  entityId: string;
  confirmation: string;
  policy: PharmacyPublicRollbackRuntimePolicy;
  dependencies: PharmacyPublicRollbackOperationDependencies;
}): Promise<PharmacyPublicRollbackOperationResult> {
  if (
    !runtimeAllowed(input.policy, input.actorId, input.entityId) ||
    input.confirmation !== `ROLLBACK PHARMACY PUBLIC ${input.entityId}`
  ) {
    return boundedResult({
      rolledBack: false,
      replayed: false,
      blocker: "rollback_boundary_blocked",
      exactLogicalRecovery: false,
    });
  }

  const rollback = await input.dependencies.rollback({
    actorId: input.actorId,
    entityId: input.entityId,
  });
  if (rollback.kind === "rolled_back" || rollback.kind === "replayed") {
    return boundedResult({
      rolledBack: true,
      replayed: rollback.kind === "replayed",
      blocker: null,
      exactLogicalRecovery: rollback.exactLogicalRecovery,
    });
  }
  return boundedResult({
    rolledBack: false,
    replayed: false,
    blocker: "rollback_execution_failed",
    exactLogicalRecovery: false,
  });
}

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function createPharmacyPublicRollbackRuntimeFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): {
  policy: PharmacyPublicRollbackRuntimePolicy;
  dependencies: PharmacyPublicRollbackOperationDependencies | null;
} {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const policy: PharmacyPublicRollbackRuntimePolicy = {
    executionEnabled:
      environment.IMPORT_PHARMACY_PUBLIC_ROLLBACK_ENABLED === "true",
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
  const rollback = createSupabasePharmacyPublicRollbackWriter(
    client as unknown as PharmacyPublicRollbackRpcClient,
  );
  return { policy, dependencies: { rollback } };
}
