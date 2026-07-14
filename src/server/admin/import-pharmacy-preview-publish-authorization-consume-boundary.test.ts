import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPharmacyPublishAuthorizationEnvelopeService,
  type PharmacyPublishAuthorizationEnvelopeRecord,
  type PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";
import { consumePharmacyPreviewPublishAuthorization } from "./import-pharmacy-preview-publish-authorization-consume-boundary";

const SNAPSHOT_HASH = "a".repeat(64);
const FINGERPRINT = "b".repeat(64);
const AUTHORIZATION_ID = "11111111-1111-4111-8111-111111111111";
const REVIEW_STATE_ID = "22222222-2222-4222-8222-222222222222";

const issueInput = {
  actorId: "admin-1",
  entityId: "pharmacy-1",
  reviewSnapshotHash: SNAPSHOT_HASH,
  entityFingerprint: FINGERPRINT,
  operationAttemptId: "33333333-3333-4333-8333-333333333333",
  idempotencyKey: "pharmacy:reserve:33333333-3333-4333-8333-333333333333",
  requestHash: "c".repeat(64),
  patchHash: "d".repeat(64),
  expectedEntityVersion: "2026-07-13T00:00:00.000Z",
  entityFamily: "pharmacy" as const,
  operationScope: "reserve_private_publish" as const,
};

function harness() {
  let record: PharmacyPublishAuthorizationEnvelopeRecord | null = null;
  const store: PharmacyPublishAuthorizationEnvelopeStore = {
    resolveReviewStateId: vi.fn(async () => REVIEW_STATE_ID),
    create: vi.fn(async (value) => {
      record = { authorizationId: AUTHORIZATION_ID, ...value };
      return AUTHORIZATION_ID;
    }),
    readByAuthorizationId: vi.fn(async () => record),
    readByTokenHash: vi.fn(async () => record),
    consume: vi.fn(async ({ tokenHash, nonceHash, consumedAt }) => {
      if (!record || record.tokenHash !== tokenHash || record.nonceHash !== nonceHash || record.consumedAt !== null) {
        return false;
      }
      record = { ...record, consumedAt, status: "consumed" };
      return true;
    }),
  };
  return { store };
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    environment: "preview",
    actorId: "admin-1",
    entityId: "pharmacy-1",
    allowedActorIds: ["admin-1"],
    allowedEntityIds: ["pharmacy-1"],
    reviewSnapshotHash: SNAPSHOT_HASH,
    entityFingerprint: FINGERPRINT,
    authorization: null,
    store: null,
    ...overrides,
  } as Parameters<typeof consumePharmacyPreviewPublishAuthorization>[0];
}

describe("Pharmacy Preview publish authorization consume boundary", () => {
  it("consumes one exact server-only legacy secret while keeping execution disabled", async () => {
    const test = harness();
    const issued = await createPharmacyPublishAuthorizationEnvelopeService(test.store).issue(issueInput);

    const result = await consumePharmacyPreviewPublishAuthorization(input({
      authorization: issued!.legacySecret,
      store: test.store,
    }));

    expect(result).toEqual({
      authorized: true,
      executionEnabled: false,
      reservationAllowed: false,
      mutationAllowed: false,
      blockers: [],
      publicVisibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      bulkAllowed: false,
    });
  });

  it("rejects replay after the first atomic consumption", async () => {
    const test = harness();
    const issued = await createPharmacyPublishAuthorizationEnvelopeService(test.store).issue(issueInput);
    const request = input({ authorization: issued!.legacySecret, store: test.store });

    await expect(consumePharmacyPreviewPublishAuthorization(request)).resolves.toMatchObject({ authorized: true });
    await expect(consumePharmacyPreviewPublishAuthorization(request)).resolves.toMatchObject({
      authorized: false,
      blockers: ["authorization_invalid_or_consumed"],
    });
  });

  it("fails closed outside Preview and without exact actor or entity allowlists", async () => {
    const result = await consumePharmacyPreviewPublishAuthorization(input({
      environment: "production",
      allowedActorIds: [],
      allowedEntityIds: [],
    }));

    expect(result.authorized).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "preview_environment_required",
      "actor_not_allowlisted",
      "entity_not_allowlisted",
      "authorization_required",
      "authorization_store_unavailable",
    ]));
    expect(result.reservationAllowed).toBe(false);
    expect(result.mutationAllowed).toBe(false);
  });

  it("rejects missing authorization, missing store, and invalid bounded identity", async () => {
    const result = await consumePharmacyPreviewPublishAuthorization(input({
      actorId: "",
      reviewSnapshotHash: "bad",
    }));

    expect(result.authorized).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "actor_not_allowlisted",
      "authorization_required",
      "authorization_store_unavailable",
      "authorization_identity_invalid",
    ]));
  });
});
