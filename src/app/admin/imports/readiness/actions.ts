"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import {
  buildPharmacyAdminBoundedReadState,
  type PharmacyAdminBoundedReadState,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "@/server/admin/import-pharmacy-admin-bounded-read-state";
import { createPharmacyAdminReadStateStoreFromEnvironment } from "@/server/admin/import-pharmacy-admin-read-state-store";
import {
  createPharmacyAdminReservationDependenciesFromEnvironment,
  runPharmacyAdminReservationOperation,
  type PharmacyAdminReservationResult,
} from "@/server/admin/import-pharmacy-admin-reservation-operation";
import {
  createPharmacyAdminStateMachineReaderFromEnvironment,
} from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
} from "@/server/admin/import-pharmacy-admin-state-machine";
import {
  buildPharmacyCanonicalMutationPatch,
  projectPharmacyCanonicalMutationPatchForReview,
  projectPharmacyRollbackSnapshotForMutationReview,
} from "@/server/admin/import-pharmacy-canonical-mutation-patch";
import { createPharmacyPublishAuthorizationStoreFromEnvironment } from "@/server/admin/import-pharmacy-publish-authorization-store";
import { issuePharmacyPreviewPublishAuthorization } from "@/server/admin/import-pharmacy-preview-publish-authorization-issue";
import {
  buildPharmacyPreviewPublishConfirmation,
  resolvePharmacyPreviewPublishCapability,
  type PharmacyPreviewPublishCapability,
} from "@/server/admin/import-pharmacy-preview-publish-capability";
import {
  createPharmacyPrivateAdminPublishOperationDependenciesFromEnvironment,
  runPharmacyPrivateAdminPublishOperation,
} from "@/server/admin/import-pharmacy-private-admin-publish-operation";
import {
  createPharmacyPrivateAdminRollbackOperationDependenciesFromEnvironment,
  runPharmacyPrivateAdminRollbackOperation,
} from "@/server/admin/import-pharmacy-private-admin-rollback-operation";
import {
  createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment,
  loadPharmacyPrivateAdminRuntimeContext,
} from "@/server/admin/import-pharmacy-private-admin-runtime-context";
import {
  createPharmacyPrivateAdminServerAction,
} from "@/server/admin/import-pharmacy-private-admin-server-action";
import type {
  PharmacyPrivateAdminOperation,
  PharmacyPrivateAdminWorkflowResult,
} from "@/server/admin/import-pharmacy-private-admin-workflow";

const IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = [
  "dry_run",
  "review",
  "reserve_private_publish",
  "private_publish",
  "rollback",
] as const;
const READ_STATE_TTL_MS = 15 * 60 * 1000;

export type PharmacyPublishAuthorizationUiState = {
  authorizationReady: boolean;
  expiresAt: string | null;
  authorizationStatus: "unavailable" | "ready" | "expired" | "invalidated" | "consumed";
};

export type PharmacyAdminOperationReceipt = Readonly<{
  operation: PharmacyPrivateAdminOperation | "refresh_state";
  outcome: "fresh" | "replayed" | "readback_only" | "blocked";
  recordedAt: string;
}>;

export type PharmacyPrivateAdminActionStateResult = {
  ok: boolean;
  blockers: readonly string[];
  workflow: PharmacyPrivateAdminWorkflowResult | null;
  readState: PharmacyAdminBoundedReadState | null;
  publishCapability: PharmacyPreviewPublishCapability | null;
  authorizationState: PharmacyPublishAuthorizationUiState | null;
  reservationState: PharmacyAdminReservationResult | null;
  stateMachine: PharmacyAdminStateMachineSnapshot | null;
  receipt: PharmacyAdminOperationReceipt | null;
};

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function readBoolean(record: Readonly<Record<string, unknown>>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
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

function stageComplete(
  state: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
): boolean {
  return state.stages.some((stage) => stage.id === stageId && stage.status === "complete");
}

function expectedReadbackStage(operation: PharmacyPrivateAdminOperation): PharmacyAdminStateMachineStageId {
  if (operation === "dry_run") return "dry_run";
  if (operation === "review") return "authorization_ready";
  if (operation === "reserve_private_publish") return "reservation_verified";
  if (operation === "private_publish") return "publish_verified";
  return "exact_recovery_verified";
}

function lockedResult(input: {
  blocker: string;
  stateMachine: PharmacyAdminStateMachineSnapshot | null;
  operation: PharmacyPrivateAdminOperation | "refresh_state";
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
      operation: input.operation,
      outcome: "blocked",
      recordedAt: input.stateMachine?.generatedAt ?? new Date().toISOString(),
    },
  };
}

export async function runPharmacyPrivateAdminAction(
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const admin = await requirePlatformAdmin();
  const allowedActorIds = parseAllowlist(process.env.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const allowedEntityIds = parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const operationValue = String(formData.get("operation") ?? "").trim();
  const entityId = String(formData.get("entityId") ?? "").trim();
  const submittedRevision = String(formData.get("stateRevision") ?? "").trim();
  const stateReader = createPharmacyAdminStateMachineReaderFromEnvironment();
  const beforeState = stateReader && entityId
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;

  if (operationValue === "refresh_state") {
    return beforeState
      ? {
          ok: true,
          blockers: [],
          workflow: null,
          readState: null,
          publishCapability: null,
          authorizationState: null,
          reservationState: null,
          stateMachine: beforeState,
          receipt: {
            operation: "refresh_state",
            outcome: "readback_only",
            recordedAt: beforeState.generatedAt,
          },
        }
      : lockedResult({ blocker: "state_readback_unavailable", stateMachine: null, operation: "refresh_state" });
  }

  if (!IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS.includes(operationValue as PharmacyPrivateAdminOperation)) {
    return lockedResult({ blocker: "invalid_operation", stateMachine: beforeState, operation: "refresh_state" });
  }
  const requestedOperation = operationValue as PharmacyPrivateAdminOperation;
  if (!beforeState) {
    return lockedResult({ blocker: "state_readback_unavailable", stateMachine: null, operation: requestedOperation });
  }
  if (!submittedRevision || submittedRevision !== beforeState.revision) {
    return lockedResult({ blocker: "state_revision_mismatch", stateMachine: beforeState, operation: requestedOperation });
  }

  const publishConfirmation = String(formData.get("publishConfirmation") ?? "");
  let persistedReadState: PharmacyAdminBoundedReadState | null = null;
  let publishCapability: PharmacyPreviewPublishCapability | null = null;
  let authorizationUiState: PharmacyPublishAuthorizationUiState | null = null;
  let reservationState: PharmacyAdminReservationResult | null = null;
  let rollbackReplayed = false;

  const action = createPharmacyPrivateAdminServerAction({
    executionEnabled: process.env.VERCEL_ENV === "preview",
    enabledOperations: IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS,
    environment: process.env.VERCEL_ENV,
    allowedEntityIds,
    execute: async ({ operation, actorId, entityId: actionEntityId, confirmation }) => {
      if (operation === "rollback") {
        const dependencies = createPharmacyPrivateAdminRollbackOperationDependenciesFromEnvironment();
        const rolledBack = dependencies
          ? await runPharmacyPrivateAdminRollbackOperation({
              environment: process.env.VERCEL_ENV,
              actorId,
              entityId: actionEntityId,
              allowedActorIds,
              allowedEntityIds,
              confirmation: confirmation ?? "",
              dependencies,
            })
          : null;
        rollbackReplayed = rolledBack?.replayed === true;
        return {
          operation,
          status: rolledBack?.rolledBack ? "completed" : "failed",
          entityId: actionEntityId,
          blockers: rolledBack?.blocker ? ["readiness_blocked"] : [],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: rolledBack?.rolledBack
            ? rolledBack.replayed ? "rollback-authority-replayed" : "rollback-authority-consumed"
            : null,
        };
      }

      const reader = createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment();
      const store = createPharmacyAdminReadStateStoreFromEnvironment();
      const context = reader
        ? await loadPharmacyPrivateAdminRuntimeContext(
            {
              executionEnabled: true,
              environment: process.env.VERCEL_ENV,
              actorId,
              entityId: actionEntityId,
              allowedActorIds,
              allowedEntityIds,
              approvalToken: process.env.IMPORT_PREVIEW_APPROVAL_TOKEN ?? "",
              expectedApprovalToken: process.env.IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN ?? "",
            },
            reader,
          )
        : null;

      if (!context?.ok || !store) {
        return {
          operation,
          status: "failed",
          entityId: actionEntityId,
          blockers: ["readiness_blocked"],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
        };
      }

      if (operation === "private_publish") {
        const dependencies = createPharmacyPrivateAdminPublishOperationDependenciesFromEnvironment({
          allowedActorIds,
          allowedEntityIds,
        });
        const published = dependencies
          ? await runPharmacyPrivateAdminPublishOperation({
              environment: process.env.VERCEL_ENV,
              actorId,
              entityId: actionEntityId,
              allowedActorIds,
              allowedEntityIds,
              confirmation: confirmation ?? "",
              now: new Date().toISOString(),
              dependencies,
            })
          : null;
        return {
          operation,
          status: published?.published ? "completed" : "failed",
          entityId: actionEntityId,
          blockers: published?.blocker ? ["readiness_blocked"] : [],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: published?.executionReference ?? null,
        };
      }

      if (operation === "reserve_private_publish") {
        const now = new Date().toISOString();
        const reviewState = await store.readLatestFresh({ actorId, entityId: actionEntityId, operation: "review", now });
        const dependencies = createPharmacyAdminReservationDependenciesFromEnvironment();
        reservationState = reviewState && dependencies
          ? await runPharmacyAdminReservationOperation({
              environment: process.env.VERCEL_ENV,
              actorId,
              entityId: actionEntityId,
              allowedActorIds,
              allowedEntityIds,
              confirmation: confirmation ?? "",
              now,
              reviewState,
              context: context.context,
              dependencies,
            })
          : null;
        return {
          operation,
          status: reservationState?.reserved && reservationState.integrityVerified ? "completed" : "failed",
          entityId: actionEntityId,
          blockers: [],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: reservationState?.reserved && reservationState.integrityVerified
            ? reviewState?.operationAttemptId ?? null
            : null,
        };
      }

      const rollbackSnapshot = context.context.canaryInput.reservationRequest.rollbackSnapshot;
      const records = buildBoundedRecords(
        rollbackSnapshot as Readonly<Record<string, unknown>>,
        context.context.mutationRequest.draft,
      );
      if (!records) {
        return {
          operation,
          status: "failed",
          entityId: actionEntityId,
          blockers: ["readiness_blocked"],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
        };
      }

      const now = new Date();
      const createdAt = now.toISOString();
      const state = buildPharmacyAdminBoundedReadState({
        operation,
        actorId,
        entityId: actionEntityId,
        snapshotHash: context.snapshotHash,
        entityFingerprint: context.context.canaryInput.expectedEntityFingerprint,
        expectedEntityVersion: context.context.canaryInput.reservationRequest.expectedVersion,
        createdAt,
        expiresAt: new Date(now.getTime() + READ_STATE_TTL_MS).toISOString(),
        reviewedAt: operation === "review" ? createdAt : null,
        current: records.current,
        proposed: records.proposed,
      });
      const persisted = await store.persist({ state, current: records.current, proposed: records.proposed });
      const readback = persisted
        ? await store.readLatestFresh({ actorId, entityId: actionEntityId, operation, now: createdAt })
        : null;
      if (!persisted || !readback || readback.snapshotHash !== context.snapshotHash) {
        return {
          operation,
          status: "failed",
          entityId: actionEntityId,
          blockers: ["readiness_blocked"],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
        };
      }

      persistedReadState = readback;
      if (operation === "review") {
        publishCapability = resolvePharmacyPreviewPublishCapability({
          environment: process.env.VERCEL_ENV,
          actorId,
          entityId: actionEntityId,
          allowedActorIds,
          allowedEntityIds,
          confirmation: publishConfirmation,
          reviewState: readback,
          expectedSnapshotHash: context.snapshotHash,
          expectedEntityFingerprint: context.context.canaryInput.expectedEntityFingerprint,
          now: createdAt,
        });

        if (publishCapability.visible) {
          const issuance = await issuePharmacyPreviewPublishAuthorization({
            capability: publishCapability,
            actorId,
            entityId: actionEntityId,
            reviewState: readback,
            store: createPharmacyPublishAuthorizationStoreFromEnvironment(),
          });
          publishCapability = issuance.capability;
          authorizationUiState = issuance.authorizationState;
        }
      }
      return {
        operation,
        status: "completed",
        entityId: actionEntityId,
        blockers: [],
        publicVisibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        executionReference: readback.snapshotHash,
      };
    },
  });

  const actionResult = await action({ actorId: admin.id, formData });
  const workflow = "workflow" in actionResult ? actionResult.workflow : null;
  const actionBlockers = actionResult.ok ? [] : actionResult.blockers;
  const afterState = stateReader
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;
  if (!afterState) {
    return {
      ok: false,
      blockers: [...actionBlockers, "state_readback_unavailable"],
      workflow,
      readState: persistedReadState,
      publishCapability,
      authorizationState: authorizationUiState,
      reservationState,
      stateMachine: null,
      receipt: {
        operation: requestedOperation,
        outcome: "blocked",
        recordedAt: new Date().toISOString(),
      },
    };
  }

  const readbackVerified = stageComplete(afterState, expectedReadbackStage(requestedOperation));
  const succeeded = actionResult.ok && readbackVerified;
  const replayed = requestedOperation === "reserve_private_publish"
    ? reservationState?.replayed === true
    : requestedOperation === "rollback"
      ? rollbackReplayed
      : stageComplete(beforeState, expectedReadbackStage(requestedOperation));

  return {
    ok: succeeded,
    blockers: succeeded ? [] : [...actionBlockers, ...(readbackVerified ? [] : ["state_readback_unverified"])],
    workflow,
    readState: persistedReadState,
    publishCapability: publishCapability ?? {
      visible: false,
      executable: false,
      mode: "locked",
      confirmationPhrase: buildPharmacyPreviewPublishConfirmation(entityId),
      blockers: [],
      publicVisibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      bulkAllowed: false,
    },
    authorizationState: authorizationUiState,
    reservationState,
    stateMachine: afterState,
    receipt: {
      operation: requestedOperation,
      outcome: succeeded ? replayed ? "replayed" : "fresh" : "blocked",
      recordedAt: afterState.generatedAt,
    },
  };
}

export async function runPharmacyPrivateAdminActionState(
  previousState: PharmacyPrivateAdminActionStateResult,
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const result = await runPharmacyPrivateAdminAction(formData);
  return result.stateMachine ? result : { ...result, stateMachine: previousState.stateMachine };
}
