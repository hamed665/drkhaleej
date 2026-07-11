import "server-only";

import type { ImportPublishFamily } from "./import-intake-convergence";
import type { ImportPublishPersistenceTransactionResult } from "./import-private-persistence-adapter";
import {
  getUnifiedDraftEntityBlockers,
  type ImportUnifiedDraftEntityInput,
} from "./import-unified-draft-entity";

export type ImportPharmacyPrivateMutationBlocker =
  | "execution_disabled"
  | "family_not_pharmacy"
  | "selected_family_not_pharmacy"
  | "reservation_not_reserved"
  | "draft_not_ready"
  | "actor_missing"
  | "idempotency_key_missing"
  | "expected_version_missing"
  | "rollback_state_missing"
  | "bulk_not_allowed";

export type ImportPharmacyPrivateMutationRequest = {
  family: ImportPublishFamily;
  selectedFamily: ImportPublishFamily | null;
  reservationResult: ImportPublishPersistenceTransactionResult;
  draft: ImportUnifiedDraftEntityInput;
  actorId: string;
  idempotencyKey: string;
  expectedVersion: string;
  rollbackState: Readonly<Record<string, unknown>>;
  executionEnabled: boolean;
  batchSize?: number;
};

export type ImportPharmacyPrivateMutationPayload = {
  family: "pharmacy";
  actorId: string;
  idempotencyKey: string;
  expectedVersion: string;
  reservationId: string;
  rollbackSnapshotId: string;
  auditEventId: string;
  draft: ImportUnifiedDraftEntityInput;
  visibility: "private";
  publicRouteEnabled: false;
  indexable: false;
  sitemapEligible: false;
  rollbackState: Readonly<Record<string, unknown>>;
};

export type ImportPharmacyPrivateMutationResult =
  | {
      kind: "mutated";
      entityId: string;
      actualVersion: string;
      visibility: "private";
    }
  | {
      kind: "replayed";
      entityId: string;
      actualVersion: string;
      visibility: "private";
    }
  | {
      kind: "conflict";
      reason: "expected_version_mismatch" | "idempotency_mismatch" | "reservation_identity_mismatch";
    }
  | {
      kind: "rolled_back";
      reason: "mutation_failed_after_write";
    }
  | {
      kind: "blocked";
      blockers: readonly ImportPharmacyPrivateMutationBlocker[];
    }
  | {
      kind: "failed";
      reason: "writer_failed" | "rollback_failed";
    };

export interface ImportPharmacyPrivateMutationWriter {
  mutateOne(payload: ImportPharmacyPrivateMutationPayload): Promise<
    | { kind: "mutated"; entityId: string; actualVersion: string }
    | { kind: "replayed"; entityId: string; actualVersion: string }
    | {
        kind: "conflict";
        reason: "expected_version_mismatch" | "idempotency_mismatch" | "reservation_identity_mismatch";
      }
    | { kind: "failed_after_write" }
    | { kind: "failed" }
  >;

  rollbackOne(payload: ImportPharmacyPrivateMutationPayload): Promise<boolean>;
}

export function getImportPharmacyPrivateMutationBlockers(
  request: ImportPharmacyPrivateMutationRequest,
): readonly ImportPharmacyPrivateMutationBlocker[] {
  const blockers: ImportPharmacyPrivateMutationBlocker[] = [];

  if (!request.executionEnabled) blockers.push("execution_disabled");
  if (request.family !== "pharmacy") blockers.push("family_not_pharmacy");
  if (request.selectedFamily !== "pharmacy") blockers.push("selected_family_not_pharmacy");
  if (request.reservationResult.kind !== "reserved") blockers.push("reservation_not_reserved");
  if (getUnifiedDraftEntityBlockers(request.draft).length > 0) blockers.push("draft_not_ready");
  if (request.actorId.trim().length === 0) blockers.push("actor_missing");
  if (request.idempotencyKey.trim().length === 0) blockers.push("idempotency_key_missing");
  if (request.expectedVersion.trim().length === 0) blockers.push("expected_version_missing");
  if (Object.keys(request.rollbackState).length === 0) blockers.push("rollback_state_missing");
  if ((request.batchSize ?? 1) !== 1) blockers.push("bulk_not_allowed");

  return [...new Set(blockers)];
}

function toPayload(request: ImportPharmacyPrivateMutationRequest): ImportPharmacyPrivateMutationPayload {
  if (request.reservationResult.kind !== "reserved") {
    throw new Error("pharmacy private mutation payload requires a reserved transaction");
  }

  return {
    family: "pharmacy",
    actorId: request.actorId,
    idempotencyKey: request.idempotencyKey,
    expectedVersion: request.expectedVersion,
    reservationId: request.reservationResult.reservationId,
    rollbackSnapshotId: request.reservationResult.rollbackSnapshotId,
    auditEventId: request.reservationResult.auditEventId,
    draft: request.draft,
    visibility: "private",
    publicRouteEnabled: false,
    indexable: false,
    sitemapEligible: false,
    rollbackState: request.rollbackState,
  };
}

export async function runImportPharmacyPrivateMutation(
  request: ImportPharmacyPrivateMutationRequest,
  writer: ImportPharmacyPrivateMutationWriter,
): Promise<ImportPharmacyPrivateMutationResult> {
  const blockers = getImportPharmacyPrivateMutationBlockers(request);
  if (blockers.length > 0) return { kind: "blocked", blockers };

  const payload = toPayload(request);
  const result = await writer.mutateOne(payload);

  if (result.kind === "mutated" || result.kind === "replayed") {
    return {
      kind: result.kind,
      entityId: result.entityId,
      actualVersion: result.actualVersion,
      visibility: "private",
    };
  }

  if (result.kind === "conflict") return result;
  if (result.kind === "failed") return { kind: "failed", reason: "writer_failed" };

  const rolledBack = await writer.rollbackOne(payload);
  return rolledBack
    ? { kind: "rolled_back", reason: "mutation_failed_after_write" }
    : { kind: "failed", reason: "rollback_failed" };
}
