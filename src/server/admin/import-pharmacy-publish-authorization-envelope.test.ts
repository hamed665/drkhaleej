import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPharmacyPublishAuthorizationEnvelopeService,
  type PharmacyPublishAuthorizationEnvelopeRecord,
  type PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";

function harness(now = new Date("2026-07-13T00:00:00.000Z")) {
  let record: PharmacyPublishAuthorizationEnvelopeRecord | null = null;
  const store: PharmacyPublishAuthorizationEnvelopeStore = {
    create: vi.fn(async (value) => {
      record = value;
      return true;
    }),
    readByTokenHash: vi.fn(async () => record),
    consume: vi.fn(async ({ tokenHash, nonceHash, consumedAt }) => {
      if (!record || record.tokenHash !== tokenHash || record.nonceHash !== nonceHash || record.consumedAt !== null) {
        return false;
      }
      record = { ...record, consumedAt };
      return true;
    }),
  };
  const service = createPharmacyPublishAuthorizationEnvelopeService(store, { now: () => now, ttlMs: 5 * 60 * 1000 });
  return { service, store, getRecord: () => record, setNow: (value: Date) => { now = value; } };
}

const input = {
  actorId: "admin-1",
  entityId: "pharmacy-1",
  reviewSnapshotHash: "a".repeat(64),
  entityFingerprint: "b".repeat(64),
};

describe("Pharmacy publish authorization envelope", () => {
  it("issues only opaque token and nonce while storing hashes and bounded identity", async () => {
    const test = harness();
    const envelope = await test.service.issue(input);
    expect(envelope).not.toBeNull();
    expect(envelope?.token).not.toContain(input.actorId);
    expect(envelope?.nonce).not.toContain(input.entityId);
    const record = test.getRecord();
    expect(record?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record?.nonceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record).toMatchObject({ ...input, consumedAt: null });
  });

  it("verifies and consumes exactly once", async () => {
    const test = harness();
    const envelope = await test.service.issue(input);
    expect(envelope).not.toBeNull();
    const request = { ...input, token: envelope!.token, nonce: envelope!.nonce };
    await expect(test.service.verifyAndConsume(request)).resolves.toBe(true);
    await expect(test.service.verifyAndConsume(request)).resolves.toBe(false);
    expect(test.store.consume).toHaveBeenCalledTimes(1);
  });

  it("rejects expired, mismatched actor, entity, snapshot, fingerprint, token, and nonce", async () => {
    const cases = [
      { actorId: "other-admin" },
      { entityId: "other-pharmacy" },
      { reviewSnapshotHash: "c".repeat(64) },
      { entityFingerprint: "d".repeat(64) },
      { token: "wrong-token" },
      { nonce: "wrong-nonce" },
    ];
    for (const change of cases) {
      const test = harness();
      const envelope = await test.service.issue(input);
      const request = { ...input, token: envelope!.token, nonce: envelope!.nonce, ...change };
      await expect(test.service.verifyAndConsume(request)).resolves.toBe(false);
    }

    const expired = harness();
    const envelope = await expired.service.issue(input);
    expired.setNow(new Date("2026-07-13T00:06:00.000Z"));
    await expect(expired.service.verifyAndConsume({ ...input, token: envelope!.token, nonce: envelope!.nonce })).resolves.toBe(false);
  });

  it("fails closed for malformed hashes and storage failures", async () => {
    const test = harness();
    await expect(test.service.issue({ ...input, reviewSnapshotHash: "bad" })).resolves.toBeNull();
    vi.mocked(test.store.create).mockResolvedValueOnce(false);
    await expect(test.service.issue(input)).resolves.toBeNull();
  });
});
