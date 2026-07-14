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
  createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment,
  loadPharmacyPrivateAdminRuntimeContext,
} from "@/server/admin/import-pharmacy-private-admin-runtime-context";
import {
  createPharmacyPrivateAdminServerAction,
  type PharmacyPrivateAdminServerActionResult,
} from "@/server/admin/import-pharmacy-private-admin-server-action";

const IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review"] as const;
const READ_STATE_TTL_MS = 15 * 60 * 1000;

export type PharmacyPublishAuthorizationUiState = {
  authorizationReady: boolean;
  expiresAt: string | null;
  authorizationStatus: "unavailable" | "ready" | "expired" | "invalidated" | "consumed";
};

export type PharmacyPrivateAdminActionStateResult = PharmacyPrivateAdminServerActionResult & {
  readState?: PharmacyAdminBoundedReadState | null;
  publishCapability?: PharmacyPreviewPublishCapability | null;
  authorizationState?: PharmacyPublishAuthorizationUiState | null;
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

export async function runPharmacyPrivateAdminAction(
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  const admin = await requirePlatformAdmin();
  const allowedActorIds = parseAllowlist(process.env.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const allowedEntityIds = parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const confirmation = String(formData.get("publishConfirmation") ?? "");
  let persistedReadState: PharmacyAdminBoundedReadState | null = null;
  let publishCapability: PharmacyPreviewPublishCapability | null = null;
  let authorizationUiState: PharmacyPublishAuthorizationUiState | null = null;

  const action = createPharmacyPrivateAdminServerAction({
    executionEnabled: process.env.VERCEL_ENV === "preview",
    enabledOperations: IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS,
    environment: process.env.VERCEL_ENV,
    allowedEntityIds,
    execute: async ({ operation, actorId, entityId }) => {
      if (operation !== "dry_run" && operation !== "review") {
        return {
          operation,
          status: "failed",
          entityId,
          blockers: [],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
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
        return {
          operation,
          status: "failed",
          entityId,
          blockers: ["readiness_blocked"],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
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
          entityId,
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
        entityId,
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
        ? await store.readLatestFresh({ actorId, entityId, operation, now: createdAt })
        : null;
      if (!persisted || !readback || readback.snapshotHash !== context.snapshotHash) {
        return {
          operation,
          status: "failed",
          entityId,
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
          entityId,
          allowedActorIds,
          allowedEntityIds,
          confirmation,
          reviewState: readback,
          expectedSnapshotHash: context.snapshotHash,
          expectedEntityFingerprint: context.context.canaryInput.expectedEntityFingerprint,
          now: createdAt,
        });

        if (publishCapability.visible) {
          const issuance = await issuePharmacyPreviewPublishAuthorization({
            capability: publishCapability,
            actorId,
            entityId,
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
        entityId,
        blockers: [],
        publicVisibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        executionReference: readback.snapshotHash,
      };
    },
  });

  const result = await action({ actorId: admin.id, formData });
  const entityId = String(formData.get("entityId") ?? "");
  return {
    ...result,
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
  };
}

export async function runPharmacyPrivateAdminActionState(
  _previousState: PharmacyPrivateAdminActionStateResult | null,
  formData: FormData,
): Promise<PharmacyPrivateAdminActionStateResult> {
  return runPharmacyPrivateAdminAction(formData);
}
