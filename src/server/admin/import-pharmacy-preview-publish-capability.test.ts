import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedReadState,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";
import {
  buildPharmacyPreviewPublishConfirmation,
  resolvePharmacyPreviewPublishCapability,
} from "./import-pharmacy-preview-publish-capability";

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
  projection_version: "projection-1",
  canonical_path: "/en/om/pharmacies/pharmacy-one",
  name_en: "Pharmacy One",
  metadata_source_evidence: "null",
});

function reviewState(overrides: Partial<PharmacyAdminBoundedReadState> = {}): PharmacyAdminBoundedReadState {
  return {
    ...buildPharmacyAdminBoundedReadState({
      operation: "review",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      snapshotHash: "a".repeat(64),
      entityFingerprint: "b".repeat(64),
      expectedEntityVersion: "2026-07-13T00:00:00.000Z",
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      reviewedAt: "2026-07-13T00:00:00.000Z",
      current,
      proposed: current,
    }),
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
    expectedSnapshotHash: "a".repeat(64),
    expectedEntityFingerprint: "b".repeat(64),
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