import "server-only";

import {
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedReadState,
} from "./import-pharmacy-admin-bounded-read-state";
import type { PharmacyPublishAuthorizationEnvelopeRecord } from "./import-pharmacy-publish-authorization-envelope";
import type { PharmacyPrivateAdminPublishContext } from "./import-pharmacy-private-admin-real-wiring";
import type {
  ImportPersistenceReadbackVerificationInput,
  ImportPersistenceReadbackVerificationResult,
} from "./import-persistence-readback-verifier";
import type { PharmacyVerifiedReservationEvidence } from "./import-pharmacy-verified-reservation-handoff";

export type PharmacyVerifiedReservationPersistence = {
  authorization: PharmacyPublishAuthorizationEnvelopeRecord;
  verificationInput: ImportPersistenceReadbackVerificationInput;
  reservationExpiresAt: string;
};

export type PharmacyVerifiedReservationLoaderDependencies = {
  loadBaseContext(input: { actorId: string; entityId: string }): Promise<PharmacyPrivateAdminPublishContext | null>;
  readLatestReview(input: { actorId: string; entityId: string; now: string }): Promise<PharmacyAdminBoundedReadState | null>;
  loadPersistence(input: {
    actorId: string;
    entityId: string;
    review: PharmacyAdminBoundedReadState;
  }): Promise<PharmacyVerifiedReservationPersistence | null>;
  verifyReadback(input: ImportPersistenceReadbackVerificationInput): Promise<ImportPersistenceReadbackVerificationResult>;
};

export type PharmacyVerifiedReservationLoadResult =
  | {
      ok: true;
      context: PharmacyPrivateAdminPublishContext;
      evidence: PharmacyVerifiedReservationEvidence;
      review: PharmacyAdminBoundedReadState;
    }
  | {
      ok: false;
      blocker:
        | "review_unavailable"
        | "context_unavailable"
        | "context_stale"
        | "reservation_unavailable"
        | "authorization_mismatch"
        | "readback_failed";
    };

function authorizationMatchesReview(
  authorization: PharmacyPublishAuthorizationEnvelopeRecord,
  review: PharmacyAdminBoundedReadState,
  verification: ImportPersistenceReadbackVerificationInput,
): boolean {
  return authorization.status === "consumed" &&
    authorization.consumedByReservationId === verification.expectedReservationId &&
    authorization.authorizationId === verification.authorizationId &&
    authorization.reviewStateId === verification.reviewStateId &&
    authorization.actorId === review.actorId &&
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

function contextMatchesReview(
  context: PharmacyPrivateAdminPublishContext,
  review: PharmacyAdminBoundedReadState,
): boolean {
  return context.canaryInput.actorId === review.actorId &&
    context.canaryInput.entityId === review.entityId &&
    context.mutationRequest.actorId === review.actorId &&
    context.mutationRequest.draft.draftId === review.entityId &&
    context.canaryInput.expectedSnapshotHash === review.snapshotHash &&
    context.canaryInput.expectedEntityFingerprint === review.entityFingerprint &&
    context.canaryInput.reservationRequest.expectedVersion === review.expectedEntityVersion &&
    context.mutationRequest.expectedVersion === review.expectedEntityVersion &&
    context.mutationRequest.family === "pharmacy" &&
    context.mutationRequest.selectedFamily === "pharmacy" &&
    context.mutationRequest.executionEnabled === true &&
    (context.mutationRequest.batchSize ?? 1) === 1;
}

function bindContextToReview(
  context: PharmacyPrivateAdminPublishContext,
  review: PharmacyAdminBoundedReadState,
): PharmacyPrivateAdminPublishContext {
  return {
    canaryInput: {
      ...context.canaryInput,
      expectedSnapshotHash: review.snapshotHash,
      expectedEntityFingerprint: review.entityFingerprint,
      reservationRequest: {
        ...context.canaryInput.reservationRequest,
        actorId: review.actorId,
        entityId: review.entityId,
        idempotencyKey: review.idempotencyKey,
        requestHash: review.requestHash,
        expectedVersion: review.expectedEntityVersion,
      },
    },
    mutationRequest: {
      ...context.mutationRequest,
      actorId: review.actorId,
      idempotencyKey: review.idempotencyKey,
      expectedVersion: review.expectedEntityVersion,
    },
  };
}

export async function loadPharmacyVerifiedReservationForPublish(input: {
  actorId: string;
  entityId: string;
  now: string;
  dependencies: PharmacyVerifiedReservationLoaderDependencies;
}): Promise<PharmacyVerifiedReservationLoadResult> {
  const review = await input.dependencies.readLatestReview({
    actorId: input.actorId,
    entityId: input.entityId,
    now: input.now,
  });
  if (
    !review ||
    review.operation !== "review" ||
    review.actorId !== input.actorId ||
    review.entityId !== input.entityId ||
    !isPharmacyAdminBoundedReadStateFresh(review, input.now)
  ) return { ok: false, blocker: "review_unavailable" };

  const baseContext = await input.dependencies.loadBaseContext({ actorId: input.actorId, entityId: input.entityId });
  if (!baseContext) return { ok: false, blocker: "context_unavailable" };
  if (!contextMatchesReview(baseContext, review)) return { ok: false, blocker: "context_stale" };

  const persistence = await input.dependencies.loadPersistence({
    actorId: input.actorId,
    entityId: input.entityId,
    review,
  });
  if (!persistence) return { ok: false, blocker: "reservation_unavailable" };
  if (!authorizationMatchesReview(persistence.authorization, review, persistence.verificationInput)) {
    return { ok: false, blocker: "authorization_mismatch" };
  }

  let verificationResult: ImportPersistenceReadbackVerificationResult;
  try {
    verificationResult = await input.dependencies.verifyReadback(persistence.verificationInput);
  } catch {
    return { ok: false, blocker: "readback_failed" };
  }
  if (!verificationResult.verified) return { ok: false, blocker: "readback_failed" };

  const context = bindContextToReview(baseContext, review);
  return {
    ok: true,
    context,
    review,
    evidence: {
      reviewBinding: {
        actorId: review.actorId,
        entityId: review.entityId,
        reviewStateId: persistence.authorization.reviewStateId,
        operationAttemptId: review.operationAttemptId,
        idempotencyKey: review.idempotencyKey,
        requestHash: review.requestHash,
        patchHash: review.patchHash,
        expectedVersion: review.expectedEntityVersion,
        snapshotHash: review.snapshotHash,
        entityFingerprint: review.entityFingerprint,
        entityFamily: "pharmacy",
        operationScope: "reserve_private_publish",
      },
      verificationInput: persistence.verificationInput,
      verificationResult,
      reservationExpiresAt: persistence.reservationExpiresAt,
    },
  };
}
