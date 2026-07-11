import "server-only";

import type {
  ImportPrivatePublishPersistenceAdapter,
  ImportPublishPersistenceTransactionRequest,
  ImportPublishPersistenceTransactionResult,
} from "./import-private-persistence-adapter";
import {
  verifyImportPersistenceReadback,
  type ImportPersistenceReadbackClient,
  type ImportPersistenceReadbackVerificationResult,
} from "./import-persistence-readback-verifier";

export type ImportRealReservationCanaryBlocker =
  | "canary_execution_disabled"
  | "environment_not_preview"
  | "actor_not_allowed"
  | "entity_not_allowed"
  | "approval_token_invalid"
  | "request_identity_mismatch"
  | "reservation_not_created"
  | "readback_verification_failed";

export type ImportRealReservationCanaryInput = {
  executionEnabled: boolean;
  environment: "development" | "preview" | "production";
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  approvalToken: string;
  expectedApprovalToken: string;
  reservationRequest: ImportPublishPersistenceTransactionRequest;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
};

export type ImportRealReservationCanaryResult = {
  mode: "preview_reservation_canary";
  attempted: boolean;
  reserved: boolean;
  verified: boolean;
  reservationResult: ImportPublishPersistenceTransactionResult | null;
  readbackResult: ImportPersistenceReadbackVerificationResult | null;
  blockers: readonly ImportRealReservationCanaryBlocker[];
  terminalPersistenceAllowed: false;
  entityMutationAllowed: false;
  routeMutationAllowed: false;
  sitemapMutationAllowed: false;
  bulkAllowed: false;
};

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export async function runImportRealReservationCanary(
  input: ImportRealReservationCanaryInput,
  adapter: ImportPrivatePublishPersistenceAdapter,
  readbackClient: ImportPersistenceReadbackClient,
): Promise<ImportRealReservationCanaryResult> {
  const blockers: ImportRealReservationCanaryBlocker[] = [];
  const request = input.reservationRequest;

  if (!input.executionEnabled) blockers.push("canary_execution_disabled");
  if (input.environment !== "preview") blockers.push("environment_not_preview");
  if (!input.allowedActorIds.includes(input.actorId)) blockers.push("actor_not_allowed");
  if (!input.allowedEntityIds.includes(input.entityId)) blockers.push("entity_not_allowed");
  if (!input.approvalToken || input.approvalToken !== input.expectedApprovalToken) {
    blockers.push("approval_token_invalid");
  }
  if (request.actorId !== input.actorId || request.entityId !== input.entityId) {
    blockers.push("request_identity_mismatch");
  }

  const guardBlockers = unique(blockers);
  if (guardBlockers.length > 0) {
    return {
      mode: "preview_reservation_canary",
      attempted: false,
      reserved: false,
      verified: false,
      reservationResult: null,
      readbackResult: null,
      blockers: guardBlockers,
      terminalPersistenceAllowed: false,
      entityMutationAllowed: false,
      routeMutationAllowed: false,
      sitemapMutationAllowed: false,
      bulkAllowed: false,
    };
  }

  const reservationResult = await adapter.runReservationSnapshotAuditTransaction(request);
  if (reservationResult.kind !== "reserved") {
    return {
      mode: "preview_reservation_canary",
      attempted: true,
      reserved: false,
      verified: false,
      reservationResult,
      readbackResult: null,
      blockers: ["reservation_not_created"],
      terminalPersistenceAllowed: false,
      entityMutationAllowed: false,
      routeMutationAllowed: false,
      sitemapMutationAllowed: false,
      bulkAllowed: false,
    };
  }

  const readbackResult = await verifyImportPersistenceReadback(readbackClient, {
    entityId: input.entityId,
    actorId: input.actorId,
    idempotencyKey: request.idempotencyKey,
    requestHash: request.requestHash,
    expectedVersion: request.expectedVersion,
    expectedSnapshotHash: input.expectedSnapshotHash,
    expectedEntityFingerprint: input.expectedEntityFingerprint,
  });

  const verified = readbackResult.verified;
  return {
    mode: "preview_reservation_canary",
    attempted: true,
    reserved: true,
    verified,
    reservationResult,
    readbackResult,
    blockers: verified ? [] : ["readback_verification_failed"],
    terminalPersistenceAllowed: false,
    entityMutationAllowed: false,
    routeMutationAllowed: false,
    sitemapMutationAllowed: false,
    bulkAllowed: false,
  };
}
