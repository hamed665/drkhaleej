import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPharmacyAdminBoundedReadState, PHARMACY_ADMIN_DIFF_FIELDS, type PharmacyAdminBoundedValue, type PharmacyAdminDiffField } from "./import-pharmacy-admin-bounded-read-state";
import { runPharmacyAdminReservationOperation } from "./import-pharmacy-admin-reservation-operation";
import type { PharmacyPrivateAdminPublishContext } from "./import-pharmacy-private-admin-real-wiring";

const current = Object.fromEntries(PHARMACY_ADMIN_DIFF_FIELDS.map((field) => [field, null])) as Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
Object.assign(current, {
  status: "draft", is_active: false, is_featured: false, visibility: "private",
  index_policy: "noindex", sitemap_policy: "excluded", projection_version: "1",
  canonical_path: "/en/om/pharmacies/pharmacy-1", metadata_source_evidence: "null",
});
const review = buildPharmacyAdminBoundedReadState({
  operation: "review",
  actorId: "admin-1",
  entityId: "pharmacy-1",
  snapshotHash: "a".repeat(64),
  entityFingerprint: "b".repeat(64),
  expectedEntityVersion: "2026-07-14T00:00:00.000Z",
  createdAt: "2026-07-14T00:00:00.000Z",
  expiresAt: "2026-07-14T00:15:00.000Z",
  reviewedAt: "2026-07-14T00:00:00.000Z",
  current,
  proposed: current,
});
const context = {
  canaryInput: {
    executionEnabled: true,
    environment: "preview",
    actorId: "admin-1",
    entityId: "pharmacy-1",
    allowedActorIds: ["admin-1"],
    allowedEntityIds: ["pharmacy-1"],
    approvalToken: "approved",
    expectedApprovalToken: "approved",
    reservationRequest: {
      entityId: "pharmacy-1",
      actorId: "admin-1",
      idempotencyKey: "legacy-random",
      requestHash: "c".repeat(64),
      expectedVersion: review.expectedEntityVersion,
      rollbackSnapshot: { visibility: "private", indexPolicy: "noindex", sitemapPolicy: "excluded", publishStatus: "private_published", publicReady: false, projectionVersion: "1", canonicalRoute: "/en/om/pharmacies/pharmacy-1" },
      auditSchemaVersion: "1",
      reservationExpiresAt: "2026-07-15T00:00:00.000Z",
      rollbackExpiresAt: "2026-08-13T00:00:00.000Z",
    },
    expectedSnapshotHash: review.snapshotHash,
    expectedEntityFingerprint: review.entityFingerprint,
  },
  mutationRequest: {
    family: "pharmacy", selectedFamily: "pharmacy", actorId: "admin-1", idempotencyKey: review.idempotencyKey,
    expectedVersion: review.expectedEntityVersion, rollbackState: {}, executionEnabled: true, batchSize: 1,
    draft: { draftId: "pharmacy-1", source: "manual", entityType: "pharmacy", name: "Pharmacy", canonicalGeo: {}, sourceEvidence: {}, duplicateCandidateIds: [], requiresManualReview: false },
  },
} as unknown as PharmacyPrivateAdminPublishContext;

function dependencies(result: { kind: "reserved"; reservationId: string; rollbackSnapshotId: string; auditEventId: string; replayed?: boolean } = { kind: "reserved", reservationId: "r", rollbackSnapshotId: "s", auditEventId: "a" }) {
  const authorization = {
    authorizationId: "11111111-1111-4111-8111-111111111111",
    tokenHash: "1".repeat(64), nonceHash: "2".repeat(64), actorId: review.actorId, entityId: review.entityId,
    reviewStateId: "22222222-2222-4222-8222-222222222222", reviewSnapshotHash: review.snapshotHash,
    entityFingerprint: review.entityFingerprint, operationAttemptId: review.operationAttemptId,
    idempotencyKey: review.idempotencyKey, requestHash: review.requestHash, patchHash: review.patchHash,
    expectedEntityVersion: review.expectedEntityVersion, entityFamily: "pharmacy" as const,
    operationScope: "reserve_private_publish" as const, status: "issued" as const,
    issuedAt: "2026-07-14T00:00:00.000Z", expiresAt: "2026-07-14T00:10:00.000Z",
    consumedAt: null, invalidatedAt: null, invalidationReason: null, consumedByReservationId: null,
  };
  return {
    persistenceAdapter: {
      runReservationSnapshotAuditTransaction: vi.fn(async () => result),
      persistTerminalResult: vi.fn(),
    },
    authorizationStore: {
      resolveReviewStateId: vi.fn(async () => authorization.reviewStateId),
      create: vi.fn(), readByAuthorizationId: vi.fn(), readByTokenHash: vi.fn(),
      readByReviewStateId: vi.fn(async (): Promise<typeof authorization | null> => authorization),
      invalidateActive: vi.fn(), transition: vi.fn(), consume: vi.fn(),
    },
  };
}

describe("Pharmacy Admin reservation operation", () => {
  it("reserves exactly once without entity or public mutation", async () => {
    const deps = dependencies();
    const result = await runPharmacyAdminReservationOperation({
      environment: "preview", actorId: review.actorId, entityId: review.entityId,
      allowedActorIds: [review.actorId], allowedEntityIds: [review.entityId],
      confirmation: `RESERVE PRIVATE PUBLISH ${review.entityId}`,
      now: "2026-07-14T00:05:00.000Z", reviewState: review, context, dependencies: deps,
    });
    expect(result).toEqual({ reserved: true, replayed: false, entityMutated: false, publicVisibility: "private", indexEligible: false, sitemapEligible: false, routeEnabled: false, blocker: null });
    expect(deps.persistenceAdapter.runReservationSnapshotAuditTransaction).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: review.idempotencyKey, requestHash: review.requestHash,
      authorization: expect.objectContaining({ operationAttemptId: review.operationAttemptId, patchHash: review.patchHash }),
    }));
  });

  it("fails closed for wrong confirmation and unavailable authorization", async () => {
    const deps = dependencies();
    await expect(runPharmacyAdminReservationOperation({
      environment: "preview", actorId: review.actorId, entityId: review.entityId,
      allowedActorIds: [review.actorId], allowedEntityIds: [review.entityId], confirmation: "wrong",
      now: "2026-07-14T00:05:00.000Z", reviewState: review, context, dependencies: deps,
    })).resolves.toMatchObject({ reserved: false, blocker: "reservation_boundary_blocked" });
    vi.mocked(deps.authorizationStore.readByReviewStateId).mockResolvedValueOnce(null);
    await expect(runPharmacyAdminReservationOperation({
      environment: "preview", actorId: review.actorId, entityId: review.entityId,
      allowedActorIds: [review.actorId], allowedEntityIds: [review.entityId],
      confirmation: `RESERVE PRIVATE PUBLISH ${review.entityId}`,
      now: "2026-07-14T00:05:00.000Z", reviewState: review, context, dependencies: deps,
    })).resolves.toMatchObject({ reserved: false, blocker: "authorization_unavailable" });
  });
});