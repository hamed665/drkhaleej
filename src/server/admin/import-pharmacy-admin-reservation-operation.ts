import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedReadState,
} from "./import-pharmacy-admin-bounded-read-state";
import type { PharmacyPrivateAdminPublishContext } from "./import-pharmacy-private-admin-real-wiring";
import {
  createImportSupabasePublishPersistenceAdapter,
  type ImportSupabaseRpcClient,
} from "./import-supabase-publish-persistence-adapter";
import type { ImportPrivatePublishPersistenceAdapter } from "./import-private-persistence-adapter";
import type {
  PharmacyPublishAuthorizationEnvelopeRecord,
  PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";
import { createPharmacyPublishAuthorizationStore } from "./import-pharmacy-publish-authorization-store";

export type PharmacyAdminReservationResult = {
  reserved: boolean;
  replayed: boolean;
  entityMutated: false;
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  blocker:
    | null
    | "reservation_boundary_blocked"
    | "review_not_fresh"
    | "review_identity_mismatch"
    | "authorization_unavailable"
    | "authorization_identity_mismatch"
    | "reservation_conflict"
    | "reservation_failed";
};

export type PharmacyAdminReservationDependencies = {
  persistenceAdapter: ImportPrivatePublishPersistenceAdapter;
  authorizationStore: PharmacyPublishAuthorizationEnvelopeStore;
};

const blocked = (blocker: Exclude<PharmacyAdminReservationResult["blocker"], null>): PharmacyAdminReservationResult => ({
  reserved: false,
  replayed: false,
  entityMutated: false,
  publicVisibility: "private",
  indexEligible: false,
  sitemapEligible: false,
  routeEnabled: false,
  blocker,
});

function authorizationMatchesReview(
  authorization: PharmacyPublishAuthorizationEnvelopeRecord,
  review: PharmacyAdminBoundedReadState,
): boolean {
  return authorization.actorId === review.actorId &&
    authorization.entityId === review.entityId &&
    authorization.reviewSnapshotHash === review.snapshotHash &&
    authorization.entityFingerprint === review.entityFingerprint &&
    authorization.operationAttemptId === review.operationAttemptId &&
    authorization.idempotencyKey === review.idempotencyKey &&
    authorization.requestHash === review.requestHash &&
    authorization.patchHash === review.patchHash &&
    authorization.expectedEntityVersion === review.expectedEntityVersion &&
    authorization.entityFamily === "pharmacy" &&
    authorization.operationScope === "reserve_private_publish";
}

export async function runPharmacyAdminReservationOperation(input: {
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  confirmation: string;
  now: string;
  reviewState: PharmacyAdminBoundedReadState;
  context: PharmacyPrivateAdminPublishContext;
  dependencies: PharmacyAdminReservationDependencies;
}): Promise<PharmacyAdminReservationResult> {
  if (
    input.environment !== "preview" ||
    !input.allowedActorIds.includes(input.actorId) ||
    !input.allowedEntityIds.includes(input.entityId) ||
    input.confirmation !== `RESERVE PRIVATE PUBLISH ${input.entityId}`
  ) return blocked("reservation_boundary_blocked");

  const review = input.reviewState;
  if (review.operation !== "review" || !isPharmacyAdminBoundedReadStateFresh(review, input.now)) {
    return blocked("review_not_fresh");
  }
  if (
    review.actorId !== input.actorId ||
    review.entityId !== input.entityId ||
    review.snapshotHash !== input.context.canaryInput.expectedSnapshotHash ||
    review.entityFingerprint !== input.context.canaryInput.expectedEntityFingerprint ||
    review.expectedEntityVersion !== input.context.canaryInput.reservationRequest.expectedVersion
  ) return blocked("review_identity_mismatch");

  const authorization = await input.dependencies.authorizationStore.readByReviewStateId(
    await input.dependencies.authorizationStore.resolveReviewStateId(review.operationAttemptId) ?? "",
  );
  if (!authorization || authorization.status !== "issued" || Date.parse(authorization.expiresAt) <= Date.parse(input.now)) {
    return blocked("authorization_unavailable");
  }
  if (!authorizationMatchesReview(authorization, review)) {
    return blocked("authorization_identity_mismatch");
  }

  const reservation = await input.dependencies.persistenceAdapter.runReservationSnapshotAuditTransaction({
    ...input.context.canaryInput.reservationRequest,
    actorId: input.actorId,
    entityId: input.entityId,
    idempotencyKey: review.idempotencyKey,
    requestHash: review.requestHash,
    expectedVersion: review.expectedEntityVersion,
    authorization: {
      authorizationId: authorization.authorizationId,
      reviewSnapshotHash: review.snapshotHash,
      entityFingerprint: review.entityFingerprint,
      operationAttemptId: review.operationAttemptId,
      patchHash: review.patchHash,
      entityFamily: "pharmacy",
      operationScope: "reserve_private_publish",
    },
  });

  if (reservation.kind === "conflict") return blocked("reservation_conflict");
  if (reservation.kind !== "reserved") return blocked("reservation_failed");
  return {
    reserved: true,
    replayed: reservation.replayed === true,
    entityMutated: false,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    blocker: null,
  };
}

export function createPharmacyAdminReservationDependenciesFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): PharmacyAdminReservationDependencies | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return {
    persistenceAdapter: createImportSupabasePublishPersistenceAdapter(client as unknown as ImportSupabaseRpcClient),
    authorizationStore: createPharmacyPublishAuthorizationStore(client as never),
  };
}
