import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPharmacyAdminBoundedReadState } from "./import-pharmacy-admin-bounded-read-state";
import { verifyPharmacyAdminPublishReview } from "./import-pharmacy-admin-publish-review-gate";
import type { PharmacyAdminReadStateStore } from "./import-pharmacy-admin-read-state-store";

const SNAPSHOT_HASH = "a".repeat(64);
const FINGERPRINT = "b".repeat(64);
const current = {
  status: "draft",
  is_active: false,
  is_featured: false,
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  projection_version: "projection-1",
  canonical_path: "/en/om/pharmacies/pharmacy-one",
} as const;

function review(overrides: Partial<ReturnType<typeof buildPharmacyAdminBoundedReadState>> = {}) {
  return {
    ...buildPharmacyAdminBoundedReadState({
      operation: "review",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      snapshotHash: SNAPSHOT_HASH,
      entityFingerprint: FINGERPRINT,
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      reviewedAt: "2026-07-13T00:05:00.000Z",
      current,
      proposed: current,
    }),
    ...overrides,
  };
}

function store(value: ReturnType<typeof review> | null): PharmacyAdminReadStateStore {
  return {
    persist: vi.fn(),
    readLatestFresh: vi.fn(async () => value),
  } as unknown as PharmacyAdminReadStateStore;
}

function input(value: ReturnType<typeof review> | null = review()) {
  return {
    actorId: "admin-1",
    entityId: "pharmacy-1",
    expectedSnapshotHash: SNAPSHOT_HASH,
    expectedEntityFingerprint: FINGERPRINT,
    now: "2026-07-13T00:10:00.000Z",
    store: store(value),
  };
}

describe("persisted Pharmacy private publish review gate", () => {
  it("approves only one fresh matching reviewed state", async () => {
    const result = await verifyPharmacyAdminPublishReview(input());
    expect(result.approved).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("rejects missing or stale review state", async () => {
    await expect(verifyPharmacyAdminPublishReview(input(null))).resolves.toEqual({
      approved: false,
      review: null,
      blockers: ["review_missing"],
    });

    const stale = await verifyPharmacyAdminPublishReview({
      ...input(review()),
      now: "2026-07-13T00:15:00.000Z",
    });
    expect(stale.approved).toBe(false);
    expect(stale.blockers).toContain("review_not_fresh");
  });

  it("rejects snapshot, fingerprint, blocker, and identity mismatch", async () => {
    const mismatched = review({
      actorId: "other-admin",
      snapshotHash: "c".repeat(64),
      entityFingerprint: "d".repeat(64),
      blockerCodes: ["source_review_required"],
    });
    const result = await verifyPharmacyAdminPublishReview(input(mismatched));
    expect(result.approved).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "review_identity_mismatch",
      "review_snapshot_mismatch",
      "review_fingerprint_mismatch",
      "review_has_blockers",
    ]));
  });
});
