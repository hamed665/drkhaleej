"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import {
  buildPharmacyAdminBoundedReadState,
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "@/server/admin/import-pharmacy-admin-bounded-read-state";
import { createPharmacyAdminReadStateStoreFromEnvironment } from "@/server/admin/import-pharmacy-admin-read-state-store";
import { createPharmacyAdminStateMachineReaderFromEnvironment } from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "@/server/admin/import-pharmacy-admin-state-machine";
import {
  buildPharmacyCanonicalMutationPatch,
  projectPharmacyCanonicalMutationPatchForReview,
  projectPharmacyRollbackSnapshotForMutationReview,
} from "@/server/admin/import-pharmacy-canonical-mutation-patch";
import { createPharmacyPublishAuthorizationStoreFromEnvironment } from "@/server/admin/import-pharmacy-publish-authorization-store";
import { issuePharmacyPreviewPublishAuthorization } from "@/server/admin/import-pharmacy-preview-publish-authorization-issue";
import { resolvePharmacyPreviewPublishCapability } from "@/server/admin/import-pharmacy-preview-publish-capability";
import {
  createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment,
  loadPharmacyPrivateAdminRuntimeContext,
} from "@/server/admin/import-pharmacy-private-admin-runtime-context";
import type { PharmacyPrivateAdminWorkflowResult } from "@/server/admin/import-pharmacy-private-admin-workflow";
import {
  runPharmacyPrivateAdminActionState,
  type PharmacyPrivateAdminActionStateResult,
} from "./actions";

const READ_STATE_TTL_MS = 15 * 60 * 1000;

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function normalizeExactConfirmation(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s\u00a0\u2007\u202f]+/gu, " ")
    .trim();
}

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function readBoolean(record: Readonly<Record<string, unknown>>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function stageStatus(
  state: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
): PharmacyAdminStateMachineStageStatus | null {
  return state.stages.find((stage) => stage.id === stageId)?.status ?? null;
}

function recoveryBoundaryAvailable(state: PharmacyAdminStateMachineSnapshot): boolean {
  return stageStatus(state, "reservation") === "expired" &&
    stageStatus(state, "publish_verified") === "blocked" &&
    stageStatus(state, "exact_recovery_verified") === "blocked";
}

function lockedResult(input: {
  blocker: string;
  stateMachine: PharmacyAdminStateMachineSnapshot | null;
}): PharmacyPrivateAdminActionStateResult {
  return {
    ok: false,
    blockers: [input.blocker],
    workflow: null,
    readState: null,
    publishCapability: null,
    authorizationState: null,
    reservationState: null,
    stateMachine: input.stateMachine,
    receipt: {
      operation: "review",
      outcome: "blocked",
      recordedAt: input.stateMachine?.generatedAt ?? new Date().toISOString(),
    },
  };
}

function buildWorkflow(input: {
  entityId: string;
  completed: boolean;
  executionReference: string | null;
}): PharmacyPrivateAdminWorkflowResult {
  return {
    operation: "review",
    status: input.completed ? "completed" : "failed",
    entityId: input.entityId,
    blockers: input.completed ? [] : ["readiness_blocked"],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    executionReference: input.executionReference,
  };
}

function buildBoundedRecords(
  rollbackSnapshot: Readonly<Record<string, unknown>>,
  draft: Parameters<typeof buildPharmacyCanonicalMutationPatch>[0],
): {
  current: Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
  proposed: Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
} | null {
  const center = rollbackSnapshot.center;
  if (typeof center !== "object" || center === null || Array.isArray(center)) return null;
  const centerRecord = center as Readonly<Record<string, unknown>>;
  const status = readString(centerRecord, "status");
  const isActive = readBoolean(centerRecord, "isActive");
  const isFeatured = readBoolean(centerRecord, "isFeatured");
  const visibility = readString(rollbackSnapshot, "visibility");
  const indexPolicy = readString(rollbackSnapshot, "indexPolicy");
  const sitemapPolicy = readString(rollbackSnapshot, "sitemapPolicy");
  const projectionVersion = readString(rollbackSnapshot, "projectionVersion");
  const canonicalPath = readString(rollbackSnapshot, "canonicalRoute");
  const currentMutation = projectPharmacyRollbackSnapshotForMutationReview(rollbackSnapshot);
  const proposedMutation = projectPharmacyCanonicalMutationPatchForReview(
    buildPharmacyCanonicalMutationPatch(draft),
  );
  if (
    status === null ||
    isActive === null ||
    isFeatured === null ||
    visibility === null ||
    indexPolicy === null ||
    sitemapPolicy === null ||
    projectionVersion === null ||
    canonicalPath === null ||
    currentMutation === null
  ) return null;

  const current = {
    status,
    is_active: isActive,
    is_featured: isFeatured,
    visibility,
    index_policy: indexPolicy,
    sitemap_policy: sitemapPolicy,
    projection_version: projectionVersion,
    canonical_path: canonicalPath,
    ...currentMutation,
  } satisfies Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;

  return {
    current,
    proposed: {
      ...current,
      ...proposedMutation,
      is_active: false,
      is_featured: false,
      visibility: "private",
      index_policy: "noindex",
      sitemap_policy: "excluded",
    },
  };
}

async function runExpiredReservationRecoveryReview(
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const admin = await requirePlatformAdmin();
  const entityId = String(formData.get("entityId") ?? "").trim();
  const submittedRevision = String(formData.get("stateRevision") ?? "").trim();
  const publishConfirmation = normalizeExactConfirmation(
    String(formData.get("publishConfirmation") ?? ""),
  );
  const allowedActorIds = parseAllowlist(process.env.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const allowedEntityIds = parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const stateReader = createPharmacyAdminStateMachineReaderFromEnvironment();
  const beforeState = stateReader && entityId
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;

  if (!beforeState) return lockedResult({ blocker: "state_readback_unavailable", stateMachine: null });
  if (!submittedRevision || submittedRevision !== beforeState.revision) {
    return lockedResult({ blocker: "state_revision_mismatch", stateMachine: beforeState });
  }
  if (
    process.env.VERCEL_ENV !== "preview" ||
    allowedActorIds.length !== 1 ||
    allowedEntityIds.length !== 1 ||
    allowedActorIds[0] !== admin.id ||
    allowedEntityIds[0] !== entityId
  ) {
    return lockedResult({ blocker: "recovery_boundary_blocked", stateMachine: beforeState });
  }
  if (!recoveryBoundaryAvailable(beforeState)) {
    return lockedResult({ blocker: "expired_reservation_recovery_unavailable", stateMachine: beforeState });
  }

  const reader = createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment();
  const store = createPharmacyAdminReadStateStoreFromEnvironment();
  const context = reader
    ? await loadPharmacyPrivateAdminRuntimeContext(
        {
          executionEnabled: true,
          environment: process.env.VERCEL_ENV,
          actorId: admin.id,
          entityId,
          allowedActorIds,
          allowedEntityIds,
          approvalToken: process.env.IMPORT_PREVIEW_APPROVAL_TOKEN ?? "",
          expectedApprovalToken: process.env.IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN ?? "",
        },
        reader,
      )
    : null;
  if (!context?.ok || !store) {
    return lockedResult({ blocker: "recovery_runtime_context_unavailable", stateMachine: beforeState });
  }

  const rollbackSnapshot = context.context.canaryInput.reservationRequest.rollbackSnapshot;
  const records = buildBoundedRecords(
    rollbackSnapshot as Readonly<Record<string, unknown>>,
    context.context.mutationRequest.draft,
  );
  if (!records) {
    return lockedResult({ blocker: "recovery_bounded_review_unavailable", stateMachine: beforeState });
  }

  const now = new Date();
  const createdAt = now.toISOString();
  const reviewedAt = new Date(now.getTime() + 1).toISOString();
  const reviewState = buildPharmacyAdminBoundedReadState({
    operation: "review",
    actorId: admin.id,
    entityId,
    snapshotHash: context.snapshotHash,
    entityFingerprint: context.context.canaryInput.expectedEntityFingerprint,
    expectedEntityVersion: context.context.canaryInput.reservationRequest.expectedVersion,
    createdAt,
    expiresAt: new Date(now.getTime() + READ_STATE_TTL_MS).toISOString(),
    reviewedAt,
    current: records.current,
    proposed: records.proposed,
  });
  const persisted = await store.persist({
    state: reviewState,
    current: records.current,
    proposed: records.proposed,
  });
  if (!persisted) {
    return lockedResult({ blocker: "recovery_review_persist_failed", stateMachine: beforeState });
  }

  const readback = await store.readByOperationAttemptId({
    actorId: admin.id,
    entityId,
    operation: "review",
    operationAttemptId: reviewState.operationAttemptId,
  });
  if (!readback) {
    return lockedResult({ blocker: "recovery_review_exact_readback_failed", stateMachine: beforeState });
  }
  if (
    readback.operationAttemptId !== reviewState.operationAttemptId ||
    readback.idempotencyKey !== reviewState.idempotencyKey ||
    readback.requestHash !== reviewState.requestHash ||
    !isPharmacyAdminBoundedReadStateFresh(readback, createdAt)
  ) {
    return lockedResult({ blocker: "recovery_review_identity_mismatch", stateMachine: beforeState });
  }

  const capability = resolvePharmacyPreviewPublishCapability({
    environment: process.env.VERCEL_ENV,
    actorId: admin.id,
    entityId,
    allowedActorIds,
    allowedEntityIds,
    confirmation: publishConfirmation,
    reviewState: readback,
    expectedSnapshotHash: context.snapshotHash,
    expectedEntityFingerprint: context.context.canaryInput.expectedEntityFingerprint,
    now: createdAt,
  });
  const issuance = await issuePharmacyPreviewPublishAuthorization({
    capability,
    actorId: admin.id,
    entityId,
    reviewState: readback,
    store: createPharmacyPublishAuthorizationStoreFromEnvironment(),
  });
  const afterState = stateReader
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;
  const authorizationVerified = Boolean(
    afterState &&
      issuance.authorizationState.authorizationReady &&
      stageStatus(afterState, "authorization_ready") === "complete",
  );
  const workflow = buildWorkflow({
    entityId,
    completed: authorizationVerified,
    executionReference: readback.snapshotHash,
  });

  return {
    ok: authorizationVerified,
    blockers: authorizationVerified
      ? []
      : [
          ...issuance.capability.blockers,
          issuance.authorizationState.authorizationStatus === "ready"
            ? "recovery_authorization_readback_failed"
            : `recovery_authorization_${issuance.authorizationState.authorizationStatus}`,
        ],
    workflow,
    readState: readback,
    publishCapability: issuance.capability,
    authorizationState: issuance.authorizationState,
    reservationState: null,
    stateMachine: afterState ?? beforeState,
    receipt: {
      operation: "review",
      outcome: authorizationVerified ? "fresh" : "blocked",
      recordedAt: afterState?.generatedAt ?? new Date().toISOString(),
    },
  };
}

export async function runExpiredReservationRecoveryActionState(
  previousState: PharmacyPrivateAdminActionStateResult,
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const operation = String(formData.get("operation") ?? "").trim();
  if (operation !== "review") {
    return runPharmacyPrivateAdminActionState(previousState, formData);
  }
  const result = await runExpiredReservationRecoveryReview(formData);
  return result.stateMachine ? result : { ...result, stateMachine: previousState.stateMachine };
}
