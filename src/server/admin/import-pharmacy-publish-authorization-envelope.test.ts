import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPharmacyPublishAuthorizationEnvelopeService,
  type PharmacyPublishAuthorizationEnvelopeRecord,
  type PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";

const AUTHORIZATION_ID = "11111111-1111-4111-8111-111111111111";
const REVIEW_STATE_ID = "22222222-2222-4222-8222-222222222222";

function harness(now = new Date("2026-07-13T00:00:00.000Z")) {
  let record: PharmacyPublishAuthorizationEnvelopeRecord | null = null;
  const store: PharmacyPublishAuthorizationEnvelopeStore = {
    resolveReviewStateId: vi.fn(async () => REVIEW_STATE_ID),
    create: vi.fn(async (value) => {
      record = { authorizationId: AUTHORIZATION_ID, ...value };
      return AUTHORIZATION_ID;
    }),
    readByAuthorizationId: vi.fn(async () => record),
    readByTokenHash: vi.fn(async () => record),
    readByReviewStateId: vi.fn(async () => record),
    invalidateActive: vi.fn(async () => 0),
    transition: vi.fn(async ({ toStatus, transitionedAt, reason }) => {
      if (!record || record.status !== "issued") return record?.status === toStatus;
      record = {
        ...record,
        status: toStatus,
        invalidatedAt: toStatus === "invalidated" ? transitionedAt : null,
        invalidationReason: toStatus === "invalidated" ? reason : null,
      };
      return true;
    }),
    consume: vi.fn(async () => false),
  };
  const service = createPharmacyPublishAuthorizationEnvelopeService(store, {
    now: () => now,
    ttlMs: 5 * 60 * 1000,
  });
  return { service, store, getRecord: () => record, setRecord: (value: PharmacyPublishAuthorizationEnvelopeRecord | null) => { record = value; } };
}

const input = {
  actorId: "admin-1",
  entityId: "pharmacy-1",
  reviewSnapshotHash: "a".repeat(64),
  entityFingerprint: "b".repeat(64),
  operationAttemptId: "33333333-3333-4333-8333-333333333333",
  idempotencyKey: "pharmacy:reserve:33333333-3333-4333-8333-333333333333",
  requestHash: "c".repeat(64),
  patchHash: "d".repeat(64),
  expectedEntityVersion: "2026-07-13T00:00:00.000Z",
  entityFamily: "pharmacy" as const,
  operationScope: "reserve_private_publish" as const,
};

describe("Pharmacy publish authorization envelope", () => {
  it("invalidates older active authorizations before persisting one bounded handle", async () => {
    const test = harness();
    const issued = await test.service.issue(input);

    expect(test.store.invalidateActive).toHaveBeenCalledWith({
      actorId: input.actorId,
      entityId: input.entityId,
      operationScope: "reserve_private_publish",
      exceptReviewStateId: REVIEW_STATE_ID,
      invalidatedAt: "2026-07-13T00:00:00.000Z",
      reason: "superseded_by_review",
    });
    expect(issued?.authorization).toEqual({
      authorizationId: AUTHORIZATION_ID,
      expiresAt: "2026-07-13T00:05:00.000Z",
    });
    expect(issued?.authorization).not.toHaveProperty("token");
    expect(issued?.authorization).not.toHaveProperty("nonce");
    expect(issued?.legacySecret?.token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(issued?.legacySecret?.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(test.store.resolveReviewStateId).toHaveBeenCalledWith(input.operationAttemptId);

    const record = test.getRecord();
    expect(record?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record?.nonceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record).toMatchObject({
      ...input,
      authorizationId: AUTHORIZATION_ID,
      reviewStateId: REVIEW_STATE_ID,
      status: "issued",
      consumedAt: null,
      invalidatedAt: null,
      invalidationReason: null,
      consumedByReservationId: null,
    });
  });

  it("replays one fresh authorization for the same persisted Review without creating a duplicate", async () => {
    const test = harness();
    const first = await test.service.issue(input);
    const second = await test.service.issue(input);

    expect(second).toEqual({ authorization: first?.authorization, legacySecret: null });
    expect(test.store.create).toHaveBeenCalledTimes(1);
    expect(test.store.invalidateActive).toHaveBeenCalledTimes(1);
  });

  it("marks an issued authorization expired during server readback", async () => {
    const issuedAt = new Date("2026-07-13T00:00:00.000Z");
    const test = harness(issuedAt);
    const issued = await test.service.issue(input);
    const expiredService = createPharmacyPublishAuthorizationEnvelopeService(test.store, {
      now: () => new Date("2026-07-13T00:06:00.000Z"),
    });

    await expect(expiredService.readback({ ...input, authorizationId: issued!.authorization.authorizationId })).resolves.toEqual({
      authorizationReady: false,
      authorizationStatus: "expired",
      expiresAt: "2026-07-13T00:05:00.000Z",
    });
    expect(test.store.transition).toHaveBeenCalledWith(expect.objectContaining({ toStatus: "expired", reason: null }));
  });

  it("invalidates an issued authorization when bounded identity no longer matches", async () => {
    const test = harness();
    const issued = await test.service.issue(input);

    await expect(test.service.readback({
      ...input,
      authorizationId: issued!.authorization.authorizationId,
      patchHash: "e".repeat(64),
    })).resolves.toMatchObject({ authorizationReady: false, authorizationStatus: "invalidated" });
    expect(test.store.transition).toHaveBeenCalledWith(expect.objectContaining({
      toStatus: "invalidated",
      reason: "authorization_identity_mismatch",
    }));
  });

  it("fails closed when the persisted Review cannot be resolved", async () => {
    const test = harness();
    vi.mocked(test.store.resolveReviewStateId).mockResolvedValueOnce(null);
    await expect(test.service.issue(input)).resolves.toBeNull();
    expect(test.store.create).not.toHaveBeenCalled();
  });

  it("fails closed for malformed identity, invalidation failure, or persistence failure", async () => {
    const test = harness();
    await expect(test.service.issue({ ...input, reviewSnapshotHash: "bad" })).resolves.toBeNull();
    vi.mocked(test.store.invalidateActive).mockResolvedValueOnce(null);
    await expect(test.service.issue(input)).resolves.toBeNull();
    vi.mocked(test.store.invalidateActive).mockResolvedValueOnce(0);
    vi.mocked(test.store.create).mockResolvedValueOnce(null);
    await expect(test.service.issue(input)).resolves.toBeNull();
  });
});
