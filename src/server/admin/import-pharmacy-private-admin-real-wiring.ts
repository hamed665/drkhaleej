import "server-only";

import type { PharmacyPrivateAdminWorkflowPorts } from "./import-pharmacy-private-admin-workflow";
import type { ImportPrivatePublishPersistenceAdapter } from "./import-private-persistence-adapter";
import type { ImportPersistenceReadbackClient } from "./import-persistence-readback-verifier";
import {
  runImportRealReservationCanary,
  type ImportRealReservationCanaryInput,
} from "./import-real-reservation-canary";
import {
  runImportPharmacyPrivateMutation,
  type ImportPharmacyPrivateMutationRequest,
  type ImportPharmacyPrivateMutationWriter,
} from "./import-pharmacy-private-mutation-adapter";
import {
  createSupabasePharmacyPrivateMutationWriter,
  type ImportPharmacyMutationRpcClient,
} from "./import-supabase-pharmacy-private-mutation-writer";
import {
  createSupabasePharmacyPrivateRollbackWriter,
  type ImportPharmacyPrivateRollbackRequest,
  type ImportPharmacyPrivateRollbackResult,
  type ImportPharmacyRollbackRpcClient,
} from "./import-supabase-pharmacy-private-rollback-writer";

export type PharmacyPrivateAdminPublishContext = {
  canaryInput: ImportRealReservationCanaryInput;
  mutationRequest: Omit<ImportPharmacyPrivateMutationRequest, "reservationResult">;
};

export type PharmacyPrivateAdminPublishReferenceInput = {
  actorId: string;
  entityId: string;
  reservationId: string;
  rollbackSnapshotId: string;
  actualVersion: string;
  expectedSnapshotHash: string;
};

export type PharmacyPrivateAdminRealWiringDependencies = {
  persistenceAdapter: ImportPrivatePublishPersistenceAdapter;
  readbackClient: ImportPersistenceReadbackClient;
  mutationRpcClient: ImportPharmacyMutationRpcClient;
  rollbackRpcClient: ImportPharmacyRollbackRpcClient;
  loadPublishContext(input: { actorId: string; entityId: string }): Promise<PharmacyPrivateAdminPublishContext | null>;
  verifyPublishReview(input: {
    actorId: string;
    entityId: string;
    expectedSnapshotHash: string;
    expectedEntityFingerprint: string;
  }): Promise<boolean>;
  createPublishReference(input: PharmacyPrivateAdminPublishReferenceInput): Promise<string | null>;
  resolveRollbackRequest(input: {
    actorId: string;
    entityId: string;
    publishReference: string;
  }): Promise<ImportPharmacyPrivateRollbackRequest | null>;
  dryRun(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  review(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  audit(input: Parameters<PharmacyPrivateAdminWorkflowPorts["audit"]>[0]): Promise<boolean>;
  reservationRunner?: typeof runImportRealReservationCanary;
  mutationRunner?: typeof runImportPharmacyPrivateMutation;
  mutationWriter?: ImportPharmacyPrivateMutationWriter;
  rollbackWriter?: (request: ImportPharmacyPrivateRollbackRequest) => Promise<ImportPharmacyPrivateRollbackResult>;
};

function identitiesMatch(context: PharmacyPrivateAdminPublishContext, actorId: string, entityId: string): boolean {
  return (
    context.canaryInput.actorId === actorId &&
    context.canaryInput.entityId === entityId &&
    context.mutationRequest.actorId === actorId &&
    context.mutationRequest.draft.draftId === entityId &&
    context.mutationRequest.family === "pharmacy" &&
    context.mutationRequest.selectedFamily === "pharmacy" &&
    context.mutationRequest.executionEnabled === true &&
    (context.mutationRequest.batchSize ?? 1) === 1
  );
}

export function createPharmacyPrivateAdminRealPorts(
  dependencies: PharmacyPrivateAdminRealWiringDependencies,
): PharmacyPrivateAdminWorkflowPorts {
  const reservationRunner = dependencies.reservationRunner ?? runImportRealReservationCanary;
  const mutationRunner = dependencies.mutationRunner ?? runImportPharmacyPrivateMutation;
  const mutationWriter =
    dependencies.mutationWriter ?? createSupabasePharmacyPrivateMutationWriter(dependencies.mutationRpcClient);
  const rollbackWriter =
    dependencies.rollbackWriter ?? createSupabasePharmacyPrivateRollbackWriter(dependencies.rollbackRpcClient);

  return {
    dryRun: dependencies.dryRun,
    review: dependencies.review,
    async reservePrivatePublish() {
      return { ok: false, reference: null };
    },

    async privatePublish({ actorId, entityId }) {
      const context = await dependencies.loadPublishContext({ actorId, entityId });
      if (!context || !identitiesMatch(context, actorId, entityId)) return { ok: false, reference: null };

      const reviewApproved = await dependencies.verifyPublishReview({
        actorId,
        entityId,
        expectedSnapshotHash: context.canaryInput.expectedSnapshotHash,
        expectedEntityFingerprint: context.canaryInput.expectedEntityFingerprint,
      });
      if (!reviewApproved) return { ok: false, reference: null };

      const canary = await reservationRunner(
        context.canaryInput,
        dependencies.persistenceAdapter,
        dependencies.readbackClient,
      );
      if (!canary.verified || canary.reservationResult?.kind !== "reserved") {
        return { ok: false, reference: null };
      }

      const mutation = await mutationRunner(
        { ...context.mutationRequest, reservationResult: canary.reservationResult },
        mutationWriter,
      );
      if (mutation.kind !== "mutated" && mutation.kind !== "replayed") {
        return { ok: false, reference: null };
      }

      const reference = await dependencies.createPublishReference({
        actorId,
        entityId,
        reservationId: canary.reservationResult.reservationId,
        rollbackSnapshotId: canary.reservationResult.rollbackSnapshotId,
        actualVersion: mutation.actualVersion,
        expectedSnapshotHash: context.canaryInput.expectedSnapshotHash,
      });
      return { ok: reference !== null, reference };
    },

    async rollback({ actorId, entityId, publishReference }) {
      const request = await dependencies.resolveRollbackRequest({ actorId, entityId, publishReference });
      if (!request || request.actorId !== actorId || request.entityId !== entityId) {
        return { ok: false, reference: null };
      }

      const result = await rollbackWriter(request);
      if (result.kind !== "rolled_back" && result.kind !== "replayed") {
        return { ok: false, reference: null };
      }
      return { ok: true, reference: publishReference };
    },

    audit: dependencies.audit,
  };
}
