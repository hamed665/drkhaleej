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
    consume: vi.fn(async () => false),
  };
  const service = createPharmacyPublishAuthorizationEnvelopeService(store, {
    now: () => now,
    ttlMs: 5 * 60 * 1000,
  });
  return { service, store, getRecord: () => record };
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
  it("returns a bounded handle plus an internal legacy secret while persisting the full identity", async () => {
    const test = harness();
    const issued = await test.service.issue(input);

    expect(issued?.authorization).toEqual({
      authorizationId: AUTHORIZATION_ID,
      expiresAt: "2026-07-13T00:05:00.000Z",
    });
    expect(issued?.authorization).not.toHaveProperty("token");
    expect(issued?.authorization).not.toHaveProperty("nonce");
    expect(issued?.legacySecret.token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(issued?.legacySecret.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
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

  it("fails closed when the persisted Review cannot be resolved", async () => {
    const test = harness();
    vi.mocked(test.store.resolveReviewStateId).mockResolvedValueOnce(null);
    await expect(test.service.issue(input)).resolves.toBeNull();
    expect(test.store.create).not.toHaveBeenCalled();
  });

  it("fails closed for malformed identity or persistence failure", async () => {
    const test = harness();
    await expect(test.service.issue({ ...input, reviewSnapshotHash: "bad" })).resolves.toBeNull();
    vi.mocked(test.store.create).mockResolvedValueOnce(null);
    await expect(test.service.issue(input)).resolves.toBeNull();
  });
});
