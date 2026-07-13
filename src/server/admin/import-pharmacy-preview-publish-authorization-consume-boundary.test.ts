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

function harness() {
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
  it("consumes one exact authorization while keeping execution, reservation, and mutation disabled", async () => {
    const test = harness();
    const authorization = await createPharmacyPublishAuthorizationEnvelopeService(test.store).issue({
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewSnapshotHash: SNAPSHOT_HASH,
      entityFingerprint: FINGERPRINT,
    });

    const result = await consumePharmacyPreviewPublishAuthorization(input({ authorization, store: test.store }));

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
    const authorization = await createPharmacyPublishAuthorizationEnvelopeService(test.store).issue({
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewSnapshotHash: SNAPSHOT_HASH,
      entityFingerprint: FINGERPRINT,
    });
    const request = input({ authorization, store: test.store });

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
