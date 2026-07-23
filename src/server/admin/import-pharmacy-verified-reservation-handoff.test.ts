import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getPharmacyVerifiedReservationHandoffBlockers,
  runPharmacyVerifiedReservationHandoff,
  type PharmacyVerifiedReservationEvidence,
  type PharmacyVerifiedReservationPublishContext,
} from "./import-pharmacy-verified-reservation-handoff";
import type { ImportPharmacyPrivateMutationRequest } from "./import-pharmacy-private-mutation-adapter";
import type { ImportPersistenceReadbackVerificationResult } from "./import-persistence-readback-verifier";

const REQUEST_HASH = "a".repeat(64);
const PATCH_HASH = "b".repeat(64);
const SNAPSHOT_HASH = "c".repeat(64);
const FINGERPRINT = "d".repeat(64);

function context(): PharmacyVerifiedReservationPublishContext {
  const mutationRequest = {
    family: "pharmacy",
    selectedFamily: "pharmacy",
    draft: { draftId: "pharmacy-1" },
    actorId: "admin-1",
    idempotencyKey: "operation-1",
    expectedVersion: "version-1",
    rollbackState: { visibility: "private" },
    executionEnabled: true,
    batchSize: 1,
  } as unknown as Omit<ImportPharmacyPrivateMutationRequest, "reservationResult">;

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
  } as unknown as PharmacyVerifiedReservationPublishContext["canaryInput"];

  return { canaryInput, mutationRequest };
}

function verificationResult(
  overrides: Partial<ImportPersistenceReadbackVerificationResult> = {},
): ImportPersistenceReadbackVerificationResult {
  return {
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
    ...overrides,
  };
}

function evidence(
  overrides: Partial<PharmacyVerifiedReservationEvidence> = {},
): PharmacyVerifiedReservationEvidence {
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
    verificationResult: verificationResult(),
    reservationExpiresAt: "2026-07-24T12:00:00.000Z",
    ...overrides,
  };
}

const input = (
  evidenceValue = evidence(),
  contextValue = context(),
) => ({
  actorId: "admin-1",
  entityId: "pharmacy-1",
  now: "2026-07-23T12:00:00.000Z",
  context: contextValue,
  evidence: evidenceValue,
});

describe("verified Pharmacy reservation handoff", () => {
  it("hands one fully verified reservation to an injected executor without invoking reservation again", async () => {
    const acceptVerifiedReservation = vi.fn(async () => ({ ok: true, reference: "handoff-1" }));

    const result = await runPharmacyVerifiedReservationHandoff(
      input(),
      { acceptVerifiedReservation },
    );

    expect(result).toEqual({
      kind: "handed_off",
      reference: "handoff-1",
      blockers: [],
      reservationRpcInvocations: 0,
      mutationActivated: false,
      rawIdentifiersExposed: false,
    });
    expect(acceptVerifiedReservation).toHaveBeenCalledTimes(1);
    expect(acceptVerifiedReservation).toHaveBeenCalledWith(expect.objectContaining({
      actorId: "admin-1",
      idempotencyKey: "operation-1",
      expectedVersion: "version-1",
      reservationResult: {
        kind: "reserved",
        reservationId: "reservation-1",
        rollbackSnapshotId: "snapshot-1",
        auditEventId: "audit-1",
      },
    }));
    expect(JSON.stringify(result)).not.toContain("reservation-1");
    expect(JSON.stringify(result)).not.toContain("authorization-1");
  });

  it("rejects an expired reservation before the executor port", async () => {
    const acceptVerifiedReservation = vi.fn();
    const stale = evidence({ reservationExpiresAt: "2026-07-23T11:59:59.000Z" });

    const result = await runPharmacyVerifiedReservationHandoff(
      input(stale),
      { acceptVerifiedReservation },
    );

    expect(result.kind).toBe("blocked");
    expect(result.blockers).toContain("reservation_expired");
    expect(acceptVerifiedReservation).not.toHaveBeenCalled();
  });

  it("rejects foreign and incomplete reservation evidence", () => {
    const foreign = evidence({
      verificationInput: {
        ...evidence().verificationInput,
        actorId: "other-admin",
        expectedAuditEventId: "",
      },
    });

    expect(getPharmacyVerifiedReservationHandoffBlockers(input(foreign))).toEqual(
      expect.arrayContaining(["foreign_reservation", "reservation_incomplete"]),
    );
  });

  it("rejects stale version, fingerprint, and request binding", () => {
    const staleContext = context();
    staleContext.mutationRequest = {
      ...staleContext.mutationRequest,
      expectedVersion: "version-2",
      idempotencyKey: "operation-2",
    };

    expect(getPharmacyVerifiedReservationHandoffBlockers(input(evidence(), staleContext))).toEqual(
      expect.arrayContaining(["stale_reservation", "reservation_binding_mismatch"]),
    );
  });

  it("rejects unverified or non-exact readback integrity", async () => {
    const acceptVerifiedReservation = vi.fn();
    const invalid = evidence({
      verificationResult: verificationResult({
        verified: false,
        entityUnchanged: false,
        counts: {
          ...verificationResult().counts,
          reservationAudit: 2,
        },
        findings: { duplicateCount: 1, orphanCount: 0, auditGapCount: 1 },
        blockers: ["audit_row_count_invalid"],
      }),
    });

    const result = await runPharmacyVerifiedReservationHandoff(
      input(invalid),
      { acceptVerifiedReservation },
    );

    expect(result.kind).toBe("blocked");
    expect(result.blockers).toEqual(expect.arrayContaining([
      "reservation_not_verified",
      "reservation_integrity_failed",
    ]));
    expect(acceptVerifiedReservation).not.toHaveBeenCalled();
  });

  it("retains compatible legacy reservation-audit handoff during the migration window", async () => {
    const acceptVerifiedReservation = vi.fn(async () => ({ ok: true, reference: "legacy-handoff" }));
    const legacy = evidence({
      verificationResult: verificationResult({
        counts: {
          ...verificationResult().counts,
          executionStartedAudit: 1,
          reservationCreatedAudit: 0,
        },
        auditSignature: "execution_started",
        auditSchemaVersion: "drkhaleej.import.publishAudit.v1",
      }),
    });

    await expect(runPharmacyVerifiedReservationHandoff(
      input(legacy),
      { acceptVerifiedReservation },
    )).resolves.toMatchObject({ kind: "handed_off", reference: "legacy-handoff" });
  });

  it("returns a bounded blocker when the injected executor refuses the handoff", async () => {
    const result = await runPharmacyVerifiedReservationHandoff(
      input(),
      { acceptVerifiedReservation: vi.fn(async () => ({ ok: false, reference: null })) },
    );

    expect(result).toEqual({
      kind: "blocked",
      reference: null,
      blockers: ["executor_rejected"],
      reservationRpcInvocations: 0,
      mutationActivated: false,
      rawIdentifiersExposed: false,
    });
  });
});
