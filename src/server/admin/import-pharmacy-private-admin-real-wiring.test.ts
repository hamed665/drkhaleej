import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPharmacyPrivateAdminRealPorts,
  type PharmacyPrivateAdminPublishContext,
  type PharmacyPrivateAdminRealWiringDependencies,
} from "./import-pharmacy-private-admin-real-wiring";
import type { PharmacyVerifiedReservationEvidence } from "./import-pharmacy-verified-reservation-handoff";
import type { ImportPharmacyPrivateMutationRequest } from "./import-pharmacy-private-mutation-adapter";
import type { ImportPharmacyPrivateRollbackResult } from "./import-supabase-pharmacy-private-rollback-writer";

const REQUEST_HASH = "a".repeat(64);
const PATCH_HASH = "b".repeat(64);
const SNAPSHOT_HASH = "c".repeat(64);
const FINGERPRINT = "d".repeat(64);

type RollbackWriter = NonNullable<PharmacyPrivateAdminRealWiringDependencies["rollbackWriter"]>;

function publishContext(): PharmacyPrivateAdminPublishContext {
  const canaryInput = {
    actorId: "admin-1",
    entityId: "pharmacy-1",
    expectedSnapshotHash: SNAPSHOT_HASH,
    expectedEntityFingerprint: FINGERPRINT,
    reservationRequest: {
      idempotencyKey: "operation-1",
      requestHash: REQUEST_HASH,
      expectedVersion: "version-1",
    },
  } as unknown as PharmacyPrivateAdminPublishContext["canaryInput"];

  return {
    canaryInput,
    mutationRequest: {
      family: "pharmacy",
      selectedFamily: "pharmacy",
      draft: { draftId: "pharmacy-1" },
      actorId: "admin-1",
      idempotencyKey: "operation-1",
      expectedVersion: "version-1",
      rollbackState: { visibility: "private" },
      executionEnabled: true,
      batchSize: 1,
    } as unknown as Omit<ImportPharmacyPrivateMutationRequest, "reservationResult">,
  };
}

function verifiedEvidence(): PharmacyVerifiedReservationEvidence {
  return {
    reviewBinding: {
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewStateId: "review-state-1",
      operationAttemptId: "attempt-1",
      idempotencyKey: "operation-1",
      requestHash: REQUEST_HASH,
      patchHash: PATCH_HASH,
      expectedVersion: "version-1",
      snapshotHash: SNAPSHOT_HASH,
      entityFingerprint: FINGERPRINT,
      entityFamily: "pharmacy",
      operationScope: "reserve_private_publish",
    },
    verificationInput: {
      actorId: "admin-1",
      entityId: "pharmacy-1",
      authorizationId: "authorization-1",
      reviewStateId: "review-state-1",
      operationAttemptId: "attempt-1",
      idempotencyKey: "operation-1",
      requestHash: REQUEST_HASH,
      patchHash: PATCH_HASH,
      expectedVersion: "version-1",
      expectedSnapshotHash: SNAPSHOT_HASH,
      expectedEntityFingerprint: FINGERPRINT,
      expectedReservationId: "reservation-1",
      expectedRollbackSnapshotId: "snapshot-1",
      expectedAuditEventId: "audit-1",
      entityFamily: "pharmacy",
      operationScope: "reserve_private_publish",
    },
    verificationResult: {
      verified: true,
      entityUnchanged: true,
      counts: {
        authorization: 1,
        idempotency: 1,
        rollbackSnapshot: 1,
        reservationAudit: 1,
        executionStartedAudit: 0,
        reservationCreatedAudit: 1,
        entityFingerprint: 1,
      },
      findings: { duplicateCount: 0, orphanCount: 0, auditGapCount: 0 },
      auditSignature: "reservation_created",
      auditSchemaVersion: "drkhaleej.import.publishAudit.v2",
      blockers: [],
      rawPayloadExposed: false,
      writeAllowed: false,
      publicEndpointAllowed: false,
      adminEndpointAllowed: false,
    },
    reservationExpiresAt: "2026-07-24T12:00:00.000Z",
  };
}

function harness() {
  const acceptVerifiedReservation = vi.fn(async () => ({ ok: true, reference: "handoff-reference-1" }));
  const rollbackWriter = vi.fn(
    async (..._args: Parameters<RollbackWriter>): Promise<ImportPharmacyPrivateRollbackResult> => ({
      kind: "rolled_back",
      entityId: "pharmacy-1",
      actualVersion: "version-3",
    }),
  );
  const loadPublishContext = vi.fn(async () => publishContext());
  const verifyPublishReview = vi.fn(async () => true);
  const loadVerifiedReservationEvidence = vi.fn(async () => verifiedEvidence());

  const dependencies: PharmacyPrivateAdminRealWiringDependencies = {
    rollbackRpcClient: {} as never,
    loadPublishContext,
    verifyPublishReview,
    loadVerifiedReservationEvidence,
    verifiedReservationExecutor: { acceptVerifiedReservation },
    resolveRollbackRequest: vi.fn(async () => ({
      reservationId: "reservation-1",
      rollbackSnapshotId: "snapshot-1",
      entityId: "pharmacy-1",
      actorId: "admin-1",
      expectedCurrentVersion: "version-2",
      expectedSnapshotHash: SNAPSHOT_HASH,
    })),
    dryRun: vi.fn(async () => ({ ok: true, reference: "dry-1" })),
    review: vi.fn(async () => ({ ok: true, reference: "review-1" })),
    audit: vi.fn(async () => true),
    rollbackWriter,
    now: () => "2026-07-23T12:00:00.000Z",
  };

  return {
    dependencies,
    acceptVerifiedReservation,
    rollbackWriter,
    loadPublishContext,
    verifyPublishReview,
    loadVerifiedReservationEvidence,
  };
}

describe("pharmacy private admin real wiring", () => {
  it("hands a pre-verified reservation to the injected executor exactly once", async () => {
    const test = harness();
    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(result).toEqual({ ok: true, reference: "handoff-reference-1" });
    expect(test.loadPublishContext).toHaveBeenCalledTimes(1);
    expect(test.verifyPublishReview).toHaveBeenCalledWith({
      actorId: "admin-1",
      entityId: "pharmacy-1",
      expectedSnapshotHash: SNAPSHOT_HASH,
      expectedEntityFingerprint: FINGERPRINT,
    });
    expect(test.loadVerifiedReservationEvidence).toHaveBeenCalledTimes(1);
    expect(test.acceptVerifiedReservation).toHaveBeenCalledTimes(1);
    expect(test.acceptVerifiedReservation).toHaveBeenCalledWith(expect.objectContaining({
      reservationResult: {
        kind: "reserved",
        reservationId: "reservation-1",
        rollbackSnapshotId: "snapshot-1",
        auditEventId: "audit-1",
      },
    }));
  });

  it("fails closed before reading reservation evidence when persisted review is not approved", async () => {
    const test = harness();
    test.verifyPublishReview.mockResolvedValueOnce(false);

    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(result).toEqual({ ok: false, reference: null });
    expect(test.loadVerifiedReservationEvidence).not.toHaveBeenCalled();
    expect(test.acceptVerifiedReservation).not.toHaveBeenCalled();
  });

  it("keeps private publish disabled when the executor port is absent", async () => {
    const test = harness();
    delete test.dependencies.verifiedReservationExecutor;

    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(result).toEqual({ ok: false, reference: null });
    expect(test.loadPublishContext).not.toHaveBeenCalled();
    expect(test.verifyPublishReview).not.toHaveBeenCalled();
    expect(test.loadVerifiedReservationEvidence).not.toHaveBeenCalled();
  });

  it("fails closed before the executor when verified evidence is stale or foreign", async () => {
    const test = harness();
    const invalid = verifiedEvidence();
    invalid.reviewBinding.actorId = "other-admin";
    invalid.reservationExpiresAt = "2026-07-23T11:00:00.000Z";
    test.loadVerifiedReservationEvidence.mockResolvedValueOnce(invalid);

    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(result).toEqual({ ok: false, reference: null });
    expect(test.acceptVerifiedReservation).not.toHaveBeenCalled();
  });

  it("rejects mismatched publish context before reading reservation evidence", async () => {
    const test = harness();
    const mismatched = publishContext();
    mismatched.mutationRequest = {
      ...mismatched.mutationRequest,
      actorId: "other-admin",
    };
    test.loadPublishContext.mockResolvedValueOnce(mismatched);

    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(result).toEqual({ ok: false, reference: null });
    expect(test.verifyPublishReview).not.toHaveBeenCalled();
    expect(test.loadVerifiedReservationEvidence).not.toHaveBeenCalled();
    expect(test.acceptVerifiedReservation).not.toHaveBeenCalled();
  });

  it("does not expose raw reservation identifiers in the workflow result", async () => {
    const test = harness();
    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).privatePublish({
      actorId: "admin-1",
      entityId: "pharmacy-1",
    });

    expect(JSON.stringify(result)).not.toContain("reservation-1");
    expect(JSON.stringify(result)).not.toContain("authorization-1");
  });

  it("resolves an opaque reference and runs the existing rollback boundary once", async () => {
    const test = harness();
    const result = await createPharmacyPrivateAdminRealPorts(test.dependencies).rollback({
      actorId: "admin-1",
      entityId: "pharmacy-1",
      publishReference: "publish-reference-1",
    });

    expect(result).toEqual({ ok: true, reference: "publish-reference-1" });
    expect(test.rollbackWriter).toHaveBeenCalledTimes(1);
  });
});
