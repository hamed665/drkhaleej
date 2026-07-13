import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { PharmacyAdminBoundedReadState } from "./import-pharmacy-admin-bounded-read-state";
import {
  buildPharmacyPreviewPublishConfirmation,
  resolvePharmacyPreviewPublishCapability,
} from "./import-pharmacy-preview-publish-capability";

function reviewState(overrides: Partial<PharmacyAdminBoundedReadState> = {}): PharmacyAdminBoundedReadState {
  return {
    schemaVersion: "pharmacy_admin_read_state_v1",
    operation: "review",
    actorId: "admin-1",
    entityId: "pharmacy-1",
    snapshotHash: "snapshot-1",
    entityFingerprint: "fingerprint-1",
    createdAt: "2026-07-13T00:00:00.000Z",
    expiresAt: "2026-07-13T00:15:00.000Z",
    reviewedAt: "2026-07-13T00:00:00.000Z",
    diff: [],
    blockerCodes: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    ...overrides,
  };
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    environment: "preview",
    actorId: "admin-1",
    entityId: "pharmacy-1",
    allowedActorIds: ["admin-1"],
    allowedEntityIds: ["pharmacy-1"],
    confirmation: buildPharmacyPreviewPublishConfirmation("pharmacy-1"),
    reviewState: reviewState(),
    expectedSnapshotHash: "snapshot-1",
    expectedEntityFingerprint: "fingerprint-1",
    now: "2026-07-13T00:05:00.000Z",
    ...overrides,
  } as Parameters<typeof resolvePharmacyPreviewPublishCapability>[0];
}

describe("pharmacy preview publish capability", () => {
  it("reveals a non-executable preview control only after exact confirmation and matching review", () => {
    expect(resolvePharmacyPreviewPublishCapability(input())).toEqual({
      visible: true,
      executable: false,
      mode: "preview_only",
      confirmationPhrase: "PRIVATE PUBLISH pharmacy-1",
      blockers: [],
      publicVisibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      bulkAllowed: false,
    });
  });

  it("fails closed outside Preview or without actor and entity allowlists", () => {
    const result = resolvePharmacyPreviewPublishCapability(input({
      environment: "production",
      allowedActorIds: [],
      allowedEntityIds: [],
    }));
    expect(result.visible).toBe(false);
    expect(result.executable).toBe(false);
    expect(result.blockers).toEqual([
      "preview_environment_required",
      "actor_not_allowlisted",
      "entity_not_allowlisted",
    ]);
  });

  it("requires the exact entity-bound confirmation phrase", () => {
    const result = resolvePharmacyPreviewPublishCapability(input({ confirmation: "PRIVATE PUBLISH" }));
    expect(result.visible).toBe(false);
    expect(result.blockers).toContain("confirmation_mismatch");
  });

  it("rejects missing, stale, mismatched, or blocked review state", () => {
    expect(resolvePharmacyPreviewPublishCapability(input({ reviewState: null })).blockers).toContain("review_required");
    expect(resolvePharmacyPreviewPublishCapability(input({ now: "2026-07-13T00:16:00.000Z" })).blockers).toContain("review_expired");
    expect(resolvePharmacyPreviewPublishCapability(input({ expectedSnapshotHash: "other" })).blockers).toContain("review_snapshot_mismatch");
    expect(resolvePharmacyPreviewPublishCapability(input({ expectedEntityFingerprint: "other" })).blockers).toContain("review_fingerprint_mismatch");
    expect(resolvePharmacyPreviewPublishCapability(input({ reviewState: reviewState({ blockerCodes: ["blocked"] }) })).blockers).toContain("review_has_blockers");
  });
});
