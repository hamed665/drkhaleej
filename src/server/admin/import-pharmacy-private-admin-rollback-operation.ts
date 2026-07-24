import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  createSupabasePharmacyPrivateRollbackWriter,
  type ImportPharmacyRollbackRpcClient,
} from "./import-supabase-pharmacy-private-rollback-writer";

export type PharmacyPrivateAdminRollbackOperationResult = Readonly<{
  rolledBack: boolean;
  replayed: boolean;
  blocker: "rollback_boundary_blocked" | "rollback_dependencies_unavailable" | "rollback_execution_failed" | null;
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  rawReferenceExposed: false;
}>;

export type PharmacyPrivateAdminRollbackOperationDependencies = Readonly<{
  rollback(input: { actorId: string; entityId: string }): Promise<
    | { kind: "rolled_back" | "replayed"; authorityConsumed: true; rawReferenceExposed: false }
    | { kind: "conflict" | "failed"; authorityConsumed: false; rawReferenceExposed: false }
  >;
}>;

function result(input: Pick<PharmacyPrivateAdminRollbackOperationResult, "rolledBack" | "replayed" | "blocker">): PharmacyPrivateAdminRollbackOperationResult {
  return {
    ...input,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
  };
}

export async function runPharmacyPrivateAdminRollbackOperation(input: {
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  confirmation: string;
  dependencies: PharmacyPrivateAdminRollbackOperationDependencies;
}): Promise<PharmacyPrivateAdminRollbackOperationResult> {
  if (
    input.environment !== "preview" ||
    !input.allowedActorIds.includes(input.actorId) ||
    !input.allowedEntityIds.includes(input.entityId) ||
    input.confirmation !== `ROLLBACK PRIVATE PUBLISH ${input.entityId}`
  ) {
    return result({ rolledBack: false, replayed: false, blocker: "rollback_boundary_blocked" });
  }

  const rollback = await input.dependencies.rollback({ actorId: input.actorId, entityId: input.entityId });
  if (rollback.kind === "rolled_back") {
    return result({ rolledBack: true, replayed: false, blocker: null });
  }
  if (rollback.kind === "replayed") {
    return result({ rolledBack: true, replayed: true, blocker: null });
  }
  return result({ rolledBack: false, replayed: false, blocker: "rollback_execution_failed" });
}

export function createPharmacyPrivateAdminRollbackOperationDependenciesFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): PharmacyPrivateAdminRollbackOperationDependencies | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const writer = createSupabasePharmacyPrivateRollbackWriter(
    client as unknown as ImportPharmacyRollbackRpcClient,
  );
  return { rollback: writer };
}
