import "server-only";

import type { PharmacyPrivateAdminWorkflowPorts } from "./import-pharmacy-private-admin-workflow";
import {
  runPharmacyVerifiedReservationHandoff,
  type PharmacyVerifiedReservationEvidence,
  type PharmacyVerifiedReservationExecutorPort,
  type PharmacyVerifiedReservationPublishContext,
} from "./import-pharmacy-verified-reservation-handoff";
import {
  createSupabasePharmacyPrivateRollbackWriter,
  type ImportPharmacyPrivateRollbackRequest,
  type ImportPharmacyPrivateRollbackResult,
  type ImportPharmacyRollbackRpcClient,
} from "./import-supabase-pharmacy-private-rollback-writer";

export type PharmacyPrivateAdminPublishContext = PharmacyVerifiedReservationPublishContext;

export type PharmacyPrivateAdminPublishReferenceInput = {
  actorId: string;
  entityId: string;
  reservationId: string;
  rollbackSnapshotId: string;
  actualVersion: string;
  expectedSnapshotHash: string;
};

export type PharmacyPrivateAdminRealWiringDependencies = {
  rollbackRpcClient: ImportPharmacyRollbackRpcClient;
  loadPublishContext(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacyPrivateAdminPublishContext | null>;
  verifyPublishReview(input: {
    actorId: string;
    entityId: string;
    expectedSnapshotHash: string;
    expectedEntityFingerprint: string;
  }): Promise<boolean>;
  loadVerifiedReservationEvidence(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacyVerifiedReservationEvidence | null>;
  verifiedReservationExecutor?: PharmacyVerifiedReservationExecutorPort;
  resolveRollbackRequest(input: {
    actorId: string;
    entityId: string;
    publishReference: string;
  }): Promise<ImportPharmacyPrivateRollbackRequest | null>;
  dryRun(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  review(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  audit(input: Parameters<PharmacyPrivateAdminWorkflowPorts["audit"]>[0]): Promise<boolean>;
  rollbackWriter?: (
    request: ImportPharmacyPrivateRollbackRequest,
  ) => Promise<ImportPharmacyPrivateRollbackResult>;
  now?: () => string;
};

function identitiesMatch(
  context: PharmacyPrivateAdminPublishContext,
  actorId: string,
  entityId: string,
): boolean {
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
  const rollbackWriter =
    dependencies.rollbackWriter ?? createSupabasePharmacyPrivateRollbackWriter(dependencies.rollbackRpcClient);

  return {
    dryRun: dependencies.dryRun,
    review: dependencies.review,
    async reservePrivatePublish() {
      return { ok: false, reference: null };
    },

    async privatePublish({ actorId, entityId }) {
      const executor = dependencies.verifiedReservationExecutor;
      if (!executor) return { ok: false, reference: null };

      const context = await dependencies.loadPublishContext({ actorId, entityId });
      if (!context || !identitiesMatch(context, actorId, entityId)) {
        return { ok: false, reference: null };
      }

      const reviewApproved = await dependencies.verifyPublishReview({
        actorId,
        entityId,
        expectedSnapshotHash: context.canaryInput.expectedSnapshotHash,
        expectedEntityFingerprint: context.canaryInput.expectedEntityFingerprint,
      });
      if (!reviewApproved) return { ok: false, reference: null };

      const evidence = await dependencies.loadVerifiedReservationEvidence({ actorId, entityId });
      if (!evidence) return { ok: false, reference: null };

      const handoff = await runPharmacyVerifiedReservationHandoff(
        {
          actorId,
          entityId,
          now: dependencies.now?.() ?? new Date().toISOString(),
          context,
          evidence,
        },
        executor,
      );

      return handoff.kind === "handed_off"
        ? { ok: true, reference: handoff.reference }
        : { ok: false, reference: null };
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
