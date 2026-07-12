import "server-only";

import {
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedReadState,
} from "./import-pharmacy-admin-bounded-read-state";
import type { PharmacyAdminReadStateStore } from "./import-pharmacy-admin-read-state-store";

export type PharmacyAdminPublishReviewBlocker =
  | "review_missing"
  | "review_identity_mismatch"
  | "review_not_fresh"
  | "review_timestamp_missing"
  | "review_snapshot_mismatch"
  | "review_fingerprint_mismatch"
  | "review_has_blockers"
  | "review_public_boundary_invalid";

export type PharmacyAdminPublishReviewResult =
  | { approved: true; review: PharmacyAdminBoundedReadState; blockers: readonly [] }
  | { approved: false; review: PharmacyAdminBoundedReadState | null; blockers: readonly PharmacyAdminPublishReviewBlocker[] };

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

export async function verifyPharmacyAdminPublishReview(input: {
  actorId: string;
  entityId: string;
  expectedSnapshotHash: string;
  expectedEntityFingerprint: string;
  now: string;
  store: PharmacyAdminReadStateStore;
}): Promise<PharmacyAdminPublishReviewResult> {
  if (
    input.actorId.trim().length === 0 ||
    input.entityId.trim().length === 0 ||
    !isSha256(input.expectedSnapshotHash) ||
    !isSha256(input.expectedEntityFingerprint) ||
    !Number.isFinite(Date.parse(input.now))
  ) {
    return { approved: false, review: null, blockers: ["review_identity_mismatch"] };
  }

  const review = await input.store.readLatestFresh({
    actorId: input.actorId,
    entityId: input.entityId,
    operation: "review",
    now: input.now,
  });
  if (!review) return { approved: false, review: null, blockers: ["review_missing"] };

  const blockers: PharmacyAdminPublishReviewBlocker[] = [];
  if (review.operation !== "review" || review.actorId !== input.actorId || review.entityId !== input.entityId) {
    blockers.push("review_identity_mismatch");
  }
  if (!isPharmacyAdminBoundedReadStateFresh(review, input.now)) blockers.push("review_not_fresh");
  if (!review.reviewedAt || !Number.isFinite(Date.parse(review.reviewedAt))) blockers.push("review_timestamp_missing");
  if (review.snapshotHash !== input.expectedSnapshotHash) blockers.push("review_snapshot_mismatch");
  if (review.entityFingerprint !== input.expectedEntityFingerprint) blockers.push("review_fingerprint_mismatch");
  if (review.blockerCodes.length > 0) blockers.push("review_has_blockers");
  if (
    review.publicVisibility !== "private" ||
    review.indexEligible !== false ||
    review.sitemapEligible !== false ||
    review.routeEnabled !== false
  ) {
    blockers.push("review_public_boundary_invalid");
  }

  const uniqueBlockers = [...new Set(blockers)];
  return uniqueBlockers.length === 0
    ? { approved: true, review, blockers: [] }
    : { approved: false, review, blockers: uniqueBlockers };
}
