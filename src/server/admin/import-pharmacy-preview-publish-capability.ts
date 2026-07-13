import "server-only";

import {
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedReadState,
} from "./import-pharmacy-admin-bounded-read-state";

export const PHARMACY_PREVIEW_PUBLISH_CONFIRMATION_PREFIX = "PRIVATE PUBLISH";

export type PharmacyPreviewPublishCapability = {
  visible: boolean;
  executable: false;
  mode: "preview_only" | "locked";
  confirmationPhrase: string;
  blockers: readonly string[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  bulkAllowed: false;
};

export type ResolvePharmacyPreviewPublishCapabilityInput = {
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  confirmation: string;
  reviewState: PharmacyAdminBoundedReadState | null;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
  now: string;
};

export function buildPharmacyPreviewPublishConfirmation(entityId: string): string {
  return `${PHARMACY_PREVIEW_PUBLISH_CONFIRMATION_PREFIX} ${entityId}`;
}

export function resolvePharmacyPreviewPublishCapability(
  input: ResolvePharmacyPreviewPublishCapabilityInput,
): PharmacyPreviewPublishCapability {
  const confirmationPhrase = buildPharmacyPreviewPublishConfirmation(input.entityId);
  const blockers: string[] = [];
  const review = input.reviewState;

  if (input.environment !== "preview") blockers.push("preview_environment_required");
  if (!input.allowedActorIds.includes(input.actorId)) blockers.push("actor_not_allowlisted");
  if (!input.allowedEntityIds.includes(input.entityId)) blockers.push("entity_not_allowlisted");
  if (input.confirmation !== confirmationPhrase) blockers.push("confirmation_mismatch");
  if (!review) {
    blockers.push("review_required");
  } else {
    if (review.operation !== "review") blockers.push("review_operation_required");
    if (review.actorId !== input.actorId) blockers.push("review_actor_mismatch");
    if (review.entityId !== input.entityId) blockers.push("review_entity_mismatch");
    if (!review.reviewedAt || !Number.isFinite(Date.parse(review.reviewedAt))) blockers.push("review_timestamp_invalid");
    if (!isPharmacyAdminBoundedReadStateFresh(review, input.now)) blockers.push("review_expired");
    if (review.snapshotHash !== input.expectedSnapshotHash) blockers.push("review_snapshot_mismatch");
    if (review.entityFingerprint !== input.expectedEntityFingerprint) blockers.push("review_fingerprint_mismatch");
    if (review.blockerCodes.length > 0) blockers.push("review_has_blockers");
    if (
      review.publicVisibility !== "private" ||
      review.indexEligible !== false ||
      review.sitemapEligible !== false ||
      review.routeEnabled !== false
    ) blockers.push("review_public_boundary_invalid");
  }

  const uniqueBlockers = [...new Set(blockers)];
  return {
    visible: uniqueBlockers.length === 0,
    executable: false,
    mode: uniqueBlockers.length === 0 ? "preview_only" : "locked",
    confirmationPhrase,
    blockers: uniqueBlockers,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    bulkAllowed: false,
  };
}
