import "server-only";

import { isCompatibleReservationAudit } from "./import-reservation-audit-contract";
import type {
  ImportPersistenceReadbackVerificationInput,
  ImportPersistenceReadbackVerificationResult,
} from "./import-persistence-readback-verifier";
import type { ImportRealReservationCanaryInput } from "./import-real-reservation-canary";
import type {
  ImportPharmacyPrivateMutationRequest,
} from "./import-pharmacy-private-mutation-adapter";
import type { ImportPublishPersistenceTransactionResult } from "./import-private-persistence-adapter";

export type PharmacyVerifiedReservationPublishContext = {
  canaryInput: ImportRealReservationCanaryInput;
  mutationRequest: Omit<ImportPharmacyPrivateMutationRequest, "reservationResult">;
};

export type PharmacyVerifiedReservationReviewBinding = {
  actorId: string;
  entityId: string;
  reviewStateId: string;
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  expectedVersion: string;
  snapshotHash: string;
  entityFingerprint: string;
  entityFamily: "pharmacy";
  operationScope: "reserve_private_publish";
};

export type PharmacyVerifiedReservationEvidence = {
  reviewBinding: PharmacyVerifiedReservationReviewBinding;
  verificationInput: ImportPersistenceReadbackVerificationInput;
  verificationResult: ImportPersistenceReadbackVerificationResult;
  reservationExpiresAt: string;
};

export type PharmacyVerifiedReservationHandoffBlocker =
  | "reservation_incomplete"
  | "reservation_expired"
  | "foreign_reservation"
  | "stale_reservation"
  | "reservation_binding_mismatch"
  | "reservation_not_verified"
  | "reservation_integrity_failed"
  | "reservation_audit_incompatible"
  | "executor_rejected";

export type PharmacyVerifiedReservationExecutorPort = {
  acceptVerifiedReservation(
    request: ImportPharmacyPrivateMutationRequest,
  ): Promise<{ ok: boolean; reference: string | null }>;
};

export type PharmacyVerifiedReservationHandoffResult =
  | {
      kind: "handed_off";
      reference: string | null;
      blockers: readonly [];
      reservationRpcInvocations: 0;
      mutationActivated: false;
      rawIdentifiersExposed: false;
    }
  | {
      kind: "blocked";
      reference: null;
      blockers: readonly PharmacyVerifiedReservationHandoffBlocker[];
      reservationRpcInvocations: 0;
      mutationActivated: false;
      rawIdentifiersExposed: false;
    };

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function hasExactIntegrity(result: ImportPersistenceReadbackVerificationResult): boolean {
  return result.entityUnchanged === true &&
    result.counts.authorization === 1 &&
    result.counts.idempotency === 1 &&
    result.counts.rollbackSnapshot === 1 &&
    result.counts.reservationAudit === 1 &&
    result.counts.entityFingerprint === 1 &&
    result.counts.executionStartedAudit + result.counts.reservationCreatedAudit === 1 &&
    result.findings.duplicateCount === 0 &&
    result.findings.orphanCount === 0 &&
    result.findings.auditGapCount === 0;
}

function hasCompleteEvidence(evidence: PharmacyVerifiedReservationEvidence): boolean {
  const review = evidence.reviewBinding;
  const verification = evidence.verificationInput;
  const result = evidence.verificationResult;
  const required = [
    review.actorId,
    review.entityId,
    review.reviewStateId,
    review.operationAttemptId,
    review.idempotencyKey,
    review.expectedVersion,
    verification.authorizationId,
    verification.reviewStateId,
    verification.operationAttemptId,
    verification.idempotencyKey,
    verification.expectedVersion,
    verification.expectedReservationId,
    verification.expectedRollbackSnapshotId,
    verification.expectedAuditEventId,
    evidence.reservationExpiresAt,
    result.auditSchemaVersion ?? "",
  ];

  return required.every(isNonEmpty) &&
    [
      review.requestHash,
      review.patchHash,
      review.snapshotHash,
      review.entityFingerprint,
      verification.requestHash,
      verification.patchHash,
      verification.expectedSnapshotHash,
      verification.expectedEntityFingerprint,
    ].every(isSha256) &&
    result.auditSignature !== null;
}

export function getPharmacyVerifiedReservationHandoffBlockers(input: {
  actorId: string;
  entityId: string;
  now: string;
  context: PharmacyVerifiedReservationPublishContext;
  evidence: PharmacyVerifiedReservationEvidence;
}): readonly PharmacyVerifiedReservationHandoffBlocker[] {
  const blockers: PharmacyVerifiedReservationHandoffBlocker[] = [];
  const { context, evidence } = input;
  const review = evidence.reviewBinding;
  const verification = evidence.verificationInput;
  const result = evidence.verificationResult;

  if (!hasCompleteEvidence(evidence)) blockers.push("reservation_incomplete");

  const nowMs = Date.parse(input.now);
  const expiresAtMs = Date.parse(evidence.reservationExpiresAt);
  if (!Number.isFinite(nowMs) || !Number.isFinite(expiresAtMs)) {
    blockers.push("reservation_incomplete");
  } else if (expiresAtMs <= nowMs) {
    blockers.push("reservation_expired");
  }

  if (
    input.actorId !== context.canaryInput.actorId ||
    input.actorId !== context.mutationRequest.actorId ||
    input.actorId !== review.actorId ||
    input.actorId !== verification.actorId ||
    input.entityId !== context.canaryInput.entityId ||
    input.entityId !== context.mutationRequest.draft.draftId ||
    input.entityId !== review.entityId ||
    input.entityId !== verification.entityId
  ) blockers.push("foreign_reservation");

  if (
    context.canaryInput.reservationRequest.expectedVersion !== review.expectedVersion ||
    context.canaryInput.reservationRequest.expectedVersion !== verification.expectedVersion ||
    context.mutationRequest.expectedVersion !== verification.expectedVersion ||
    context.canaryInput.expectedSnapshotHash !== review.snapshotHash ||
    context.canaryInput.expectedSnapshotHash !== verification.expectedSnapshotHash ||
    context.canaryInput.expectedEntityFingerprint !== review.entityFingerprint ||
    context.canaryInput.expectedEntityFingerprint !== verification.expectedEntityFingerprint
  ) blockers.push("stale_reservation");

  if (
    context.canaryInput.reservationRequest.idempotencyKey !== review.idempotencyKey ||
    context.canaryInput.reservationRequest.idempotencyKey !== verification.idempotencyKey ||
    context.mutationRequest.idempotencyKey !== verification.idempotencyKey ||
    context.canaryInput.reservationRequest.requestHash !== review.requestHash ||
    context.canaryInput.reservationRequest.requestHash !== verification.requestHash ||
    review.patchHash !== verification.patchHash ||
    review.reviewStateId !== verification.reviewStateId ||
    review.operationAttemptId !== verification.operationAttemptId ||
    review.entityFamily !== "pharmacy" ||
    verification.entityFamily !== "pharmacy" ||
    review.operationScope !== "reserve_private_publish" ||
    verification.operationScope !== "reserve_private_publish" ||
    context.mutationRequest.family !== "pharmacy" ||
    context.mutationRequest.selectedFamily !== "pharmacy" ||
    (context.mutationRequest.batchSize ?? 1) !== 1
  ) blockers.push("reservation_binding_mismatch");

  if (!result.verified || result.blockers.length > 0) blockers.push("reservation_not_verified");
  if (!hasExactIntegrity(result)) blockers.push("reservation_integrity_failed");
  if (
    result.auditSignature === null ||
    result.auditSchemaVersion === null ||
    !isCompatibleReservationAudit({
      eventType: result.auditSignature,
      schemaVersion: result.auditSchemaVersion,
      phase: "reservation",
    })
  ) blockers.push("reservation_audit_incompatible");

  return unique(blockers);
}

function buildReservedResult(
  verification: ImportPersistenceReadbackVerificationInput,
): Extract<ImportPublishPersistenceTransactionResult, { kind: "reserved" }> {
  return {
    kind: "reserved",
    reservationId: verification.expectedReservationId,
    rollbackSnapshotId: verification.expectedRollbackSnapshotId,
    auditEventId: verification.expectedAuditEventId,
  };
}

export async function runPharmacyVerifiedReservationHandoff(
  input: {
    actorId: string;
    entityId: string;
    now: string;
    context: PharmacyVerifiedReservationPublishContext;
    evidence: PharmacyVerifiedReservationEvidence;
  },
  executor: PharmacyVerifiedReservationExecutorPort,
): Promise<PharmacyVerifiedReservationHandoffResult> {
  const blockers = getPharmacyVerifiedReservationHandoffBlockers(input);
  if (blockers.length > 0) {
    return {
      kind: "blocked",
      reference: null,
      blockers,
      reservationRpcInvocations: 0,
      mutationActivated: false,
      rawIdentifiersExposed: false,
    };
  }

  const result = await executor.acceptVerifiedReservation({
    ...input.context.mutationRequest,
    reservationResult: buildReservedResult(input.evidence.verificationInput),
  });
  if (!result.ok) {
    return {
      kind: "blocked",
      reference: null,
      blockers: ["executor_rejected"],
      reservationRpcInvocations: 0,
      mutationActivated: false,
      rawIdentifiersExposed: false,
    };
  }

  return {
    kind: "handed_off",
    reference: result.reference,
    blockers: [],
    reservationRpcInvocations: 0,
    mutationActivated: false,
    rawIdentifiersExposed: false,
  };
}
