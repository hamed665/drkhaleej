import "server-only";

import { createClient } from "@supabase/supabase-js";

import { createPharmacyDurablePublishReferenceStore, type PharmacyDurablePublishReferenceClient } from "./import-pharmacy-durable-publish-reference";
import { createPharmacyPrivateAdminPublishExecutor } from "./import-pharmacy-private-admin-publish-executor";
import { createPharmacyPrivateAdminRealPorts } from "./import-pharmacy-private-admin-real-wiring";
import { createSupabasePharmacyPrivateMutationWriter, type ImportPharmacyMutationRpcClient } from "./import-supabase-pharmacy-private-mutation-writer";
import { createSupabasePharmacyPrivatePublishReadbackClient } from "./import-supabase-pharmacy-private-publish-readback";
import { createSupabasePharmacyVerifiedReservationLoaderDependencies } from "./import-supabase-pharmacy-verified-reservation-loader";
import { loadPharmacyVerifiedReservationForPublish, type PharmacyVerifiedReservationLoadResult } from "./import-pharmacy-verified-reservation-loader";
import type { ImportPharmacyRollbackRpcClient } from "./import-supabase-pharmacy-private-rollback-writer";
import type { PharmacyVerifiedReservationExecutorPort } from "./import-pharmacy-verified-reservation-handoff";

export type PharmacyPrivateAdminPublishOperationResult = {
  published: boolean;
  executionReference: string | null;
  blocker:
    | null
    | "publish_boundary_blocked"
    | "publish_dependencies_unavailable"
    | "verified_reservation_unavailable"
    | "publish_execution_failed";
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  rawIdentifiersExposed: false;
};

export type PharmacyPrivateAdminPublishOperationDependencies = {
  loadVerifiedReservation(input: {
    actorId: string;
    entityId: string;
    now: string;
  }): Promise<PharmacyVerifiedReservationLoadResult>;
  executor: PharmacyVerifiedReservationExecutorPort;
  rollbackRpcClient: ImportPharmacyRollbackRpcClient;
};

function result(input: Pick<
  PharmacyPrivateAdminPublishOperationResult,
  "published" | "executionReference" | "blocker"
>): PharmacyPrivateAdminPublishOperationResult {
  return {
    ...input,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawIdentifiersExposed: false,
  };
}

export async function runPharmacyPrivateAdminPublishOperation(input: {
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  confirmation: string;
  now: string;
  dependencies: PharmacyPrivateAdminPublishOperationDependencies;
}): Promise<PharmacyPrivateAdminPublishOperationResult> {
  if (
    input.environment !== "preview" ||
    !input.allowedActorIds.includes(input.actorId) ||
    !input.allowedEntityIds.includes(input.entityId) ||
    input.confirmation !== `EXECUTE PRIVATE PUBLISH ${input.entityId}`
  ) {
    return result({ published: false, executionReference: null, blocker: "publish_boundary_blocked" });
  }

  const loaded = await input.dependencies.loadVerifiedReservation({
    actorId: input.actorId,
    entityId: input.entityId,
    now: input.now,
  });
  if (!loaded.ok) {
    return result({ published: false, executionReference: null, blocker: "verified_reservation_unavailable" });
  }

  const ports = createPharmacyPrivateAdminRealPorts({
    rollbackRpcClient: input.dependencies.rollbackRpcClient,
    loadPublishContext: async ({ actorId, entityId }) =>
      actorId === loaded.review.actorId && entityId === loaded.review.entityId ? loaded.context : null,
    verifyPublishReview: async ({ actorId, entityId, expectedSnapshotHash, expectedEntityFingerprint }) =>
      actorId === loaded.review.actorId &&
      entityId === loaded.review.entityId &&
      expectedSnapshotHash === loaded.review.snapshotHash &&
      expectedEntityFingerprint === loaded.review.entityFingerprint,
    loadVerifiedReservationEvidence: async ({ actorId, entityId }) =>
      actorId === loaded.review.actorId && entityId === loaded.review.entityId ? loaded.evidence : null,
    verifiedReservationExecutor: input.dependencies.executor,
    dryRun: async () => ({ ok: false, reference: null }),
    review: async () => ({ ok: false, reference: null }),
    audit: async () => true,
    now: () => input.now,
  });

  const published = await ports.privatePublish({ actorId: input.actorId, entityId: input.entityId });
  return published.ok && published.reference
    ? result({ published: true, executionReference: published.reference, blocker: null })
    : result({ published: false, executionReference: null, blocker: "publish_execution_failed" });
}

export function createPharmacyPrivateAdminPublishOperationDependenciesFromEnvironment(input: {
  environment?: Record<string, string | undefined>;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
}): PharmacyPrivateAdminPublishOperationDependencies | null {
  const environment = input.environment ?? process.env;
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;

  const loaderDependencies = createSupabasePharmacyVerifiedReservationLoaderDependencies({
    environment,
    allowedActorIds: input.allowedActorIds,
    allowedEntityIds: input.allowedEntityIds,
  });
  if (!loaderDependencies) return null;

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const executor = createPharmacyPrivateAdminPublishExecutor({
    mutationWriter: createSupabasePharmacyPrivateMutationWriter(
      client as unknown as ImportPharmacyMutationRpcClient,
    ),
    publishReferenceStore: createPharmacyDurablePublishReferenceStore(
      client as unknown as PharmacyDurablePublishReferenceClient,
    ),
    readbackClient: createSupabasePharmacyPrivatePublishReadbackClient(client),
  });

  return {
    rollbackRpcClient: client as unknown as ImportPharmacyRollbackRpcClient,
    executor,
    loadVerifiedReservation({ actorId, entityId, now }) {
      return loadPharmacyVerifiedReservationForPublish({
        actorId,
        entityId,
        now,
        dependencies: loaderDependencies,
      });
    },
  };
}
