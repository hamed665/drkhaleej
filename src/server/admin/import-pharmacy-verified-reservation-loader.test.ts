import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";
import type { PharmacyPublishAuthorizationEnvelopeRecord } from "./import-pharmacy-publish-authorization-envelope";
import type { PharmacyPrivateAdminPublishContext } from "./import-pharmacy-private-admin-real-wiring";
import type {
  ImportPersistenceReadbackVerificationInput,
  ImportPersistenceReadbackVerificationResult,
} from "./import-persistence-readback-verifier";
import {
  areEquivalentPharmacyExpectedVersions,
  loadPharmacyVerifiedReservationForPublish,
  type PharmacyVerifiedReservationLoaderDependencies,
} from "./import-pharmacy-verified-reservation-loader";

const actorId = "actor-1";
const entityId = "entity-1";
const reviewStateId = "review-state-1";
const authorizationId = "authorization-1";
const reservationId = "reservation-1";
const rollbackSnapshotId = "rollback-1";
const auditEventId = "audit-1";
const snapshotHash = "a".repeat(64);
const entityFingerprint = "b".repeat(64);
const expectedVersion = "2026-07-26T01:00:00.000Z";

const current = Object.fromEntries(
  PHARMACY_ADMIN_DIFF_FIELDS.map((field) => [field, null]),
) as Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
Object.assign(current, {
  status: "draft",
  is_active: false,
  is_featured: false,
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  projection_version: "12",
  canonical_path: "/en/om/pharmacies/example",
  name_en: "Example Pharmacy",
  metadata_source_evidence: "null",
});

const review = buildPharmacyAdminBoundedReadState({
  operation: "review",
  actorId,
  entityId,
  snapshotHash,
  entityFingerprint,
  expectedEntityVersion: expectedVersion,
  createdAt: "2026-07-26T01:00:00.000Z",
  expiresAt: "2026-07-26T01:15:00.000Z",
  reviewedAt: "2026-07-26T01:00:00.000Z",
  current,
  proposed: current,
});
const requestHash = review.requestHash;
const patchHash = review.patchHash;

const verificationInput: ImportPersistenceReadbackVerificationInput = {
  actorId,
  entityId,
  authorizationId,
  reviewStateId,
  operationAttemptId: review.operationAttemptId,
  idempotencyKey: review.idempotencyKey,
  requestHash,
  patchHash,
  expectedVersion,
  expectedSnapshotHash: snapshotHash,
  expectedEntityFingerprint: entityFingerprint,
  expectedReservationId: reservationId,
  expectedRollbackSnapshotId: rollbackSnapshotId,
  expectedAuditEventId: auditEventId,
  entityFamily: "pharmacy",
  operationScope: "reserve_private_publish",
};

const authorization: PharmacyPublishAuthorizationEnvelopeRecord = {
  authorizationId,
  tokenHash: "e".repeat(64),
  nonceHash: "f".repeat(64),
  actorId,
  entityId,
  reviewStateId,
  reviewSnapshotHash: snapshotHash,
  entityFingerprint,
  operationAttemptId: review.operationAttemptId,
  idempotencyKey: review.idempotencyKey,
  requestHash,
  patchHash,
  expectedEntityVersion: "2026-07-26 01:00:00+00",
  entityFamily: "pharmacy",
  operationScope: "reserve_private_publish",
  status: "consumed",
  issuedAt: "2026-07-26T01:00:00.000Z",
  expiresAt: "2026-07-26T01:05:00.000Z",
  consumedAt: "2026-07-26T01:04:00.000Z",
  invalidatedAt: null,
  invalidationReason: null,
  consumedByReservationId: reservationId,
};

const verificationResult: ImportPersistenceReadbackVerificationResult = {
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
};

const context = {
  canaryInput: {
    actorId,
    entityId,
    expectedSnapshotHash: snapshotHash,
    expectedEntityFingerprint: entityFingerprint,
    reservationRequest: {
      actorId,
      entityId,
      idempotencyKey: review.idempotencyKey,
      requestHash,
      expectedVersion: "2026-07-26 01:00:00+00",
    },
  },
  mutationRequest: {
    actorId,
    idempotencyKey: review.idempotencyKey,
    expectedVersion: "2026-07-26T05:00:00+04:00",
    family: "pharmacy",
    selectedFamily: "pharmacy",
    executionEnabled: true,
    batchSize: 1,
    draft: { draftId: entityId },
  },
} as unknown as PharmacyPrivateAdminPublishContext;

describe("verified Pharmacy Reservation loader", () => {
  it("treats equivalent PostgreSQL and ISO timestamp wire formats as the same version", () => {
    expect(areEquivalentPharmacyExpectedVersions(
      "2026-07-26T01:00:00.000Z",
      "2026-07-26 01:00:00+00",
    )).toBe(true);
    expect(areEquivalentPharmacyExpectedVersions(
      "2026-07-26T01:00:00.000Z",
      "2026-07-26T05:00:00+04:00",
    )).toBe(true);
    expect(areEquivalentPharmacyExpectedVersions(
      "2026-07-26T01:00:00.000Z",
      "2026-07-26T01:00:01.000Z",
    )).toBe(false);
  });

  it("uses the exact persisted review after its TTL when the Reservation remains live", async () => {
    const dependencies: PharmacyVerifiedReservationLoaderDependencies = {
      loadBaseContext: vi.fn(async () => context),
      readLatestReview: vi.fn(async () => review),
      loadPersistence: vi.fn(async () => ({
        authorization,
        verificationInput: {
          ...verificationInput,
          expectedVersion: "2026-07-26 01:00:00+00",
        },
        reservationExpiresAt: "2026-07-26T03:00:00.000Z",
      })),
      verifyReadback: vi.fn(async () => verificationResult),
    };

    const result = await loadPharmacyVerifiedReservationForPublish({
      actorId,
      entityId,
      now: "2026-07-26T02:00:00.000Z",
      dependencies,
    });

    expect(result.ok).toBe(true);
    expect(dependencies.readLatestReview).toHaveBeenCalledWith({
      actorId,
      entityId,
      now: "2026-07-26T02:00:00.000Z",
    });
    if (result.ok) {
      expect(result.evidence.reservationExpiresAt).toBe("2026-07-26T03:00:00.000Z");
      expect(result.review.expiresAt).toBe("2026-07-26T01:15:00.000Z");
      expect(result.evidence.verificationInput.expectedVersion).toBe(expectedVersion);
      expect(result.context.mutationRequest.expectedVersion).toBe(expectedVersion);
    }
  });
});
