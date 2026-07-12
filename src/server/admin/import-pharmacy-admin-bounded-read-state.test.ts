import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  isPharmacyAdminBoundedReadStateFresh,
  PHARMACY_ADMIN_DIFF_FIELDS,
} from "./import-pharmacy-admin-bounded-read-state";

const current = {
  status: "draft",
  is_active: false,
  is_featured: false,
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  projection_version: "12",
  canonical_path: "/en/om/pharmacies/example",
} as const;

const proposed = {
  ...current,
  projection_version: "13",
} as const;

describe("bounded Pharmacy Admin read state", () => {
  it("emits only allowlisted changed fields and fixed private boundaries", () => {
    const state = buildPharmacyAdminBoundedReadState({
      operation: "dry_run",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      snapshotHash: "snapshot-hash",
      entityFingerprint: "fingerprint",
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      current,
      proposed,
      blockerCodes: ["zeta", "alpha", "alpha", ""],
    });

    expect(state.diff).toEqual([
      { field: "projection_version", before: "12", after: "13" },
    ]);
    expect(state.blockerCodes).toEqual(["alpha", "zeta"]);
    expect(state.publicVisibility).toBe("private");
    expect(state.indexEligible).toBe(false);
    expect(state.sitemapEligible).toBe(false);
    expect(state.routeEnabled).toBe(false);
    expect(state.diff.every((entry) => PHARMACY_ADMIN_DIFF_FIELDS.includes(entry.field))).toBe(true);
  });

  it("requires a bounded review timestamp for review state", () => {
    expect(() =>
      buildPharmacyAdminBoundedReadState({
        operation: "review",
        actorId: "admin-1",
        entityId: "pharmacy-1",
        snapshotHash: "snapshot-hash",
        entityFingerprint: "fingerprint",
        createdAt: "2026-07-13T00:00:00.000Z",
        expiresAt: "2026-07-13T00:15:00.000Z",
        current,
        proposed,
      }),
    ).toThrow("reviewed_at_required");
  });

  it("rejects stale or inverted windows and reports freshness deterministically", () => {
    expect(() =>
      buildPharmacyAdminBoundedReadState({
        operation: "dry_run",
        actorId: "admin-1",
        entityId: "pharmacy-1",
        snapshotHash: "snapshot-hash",
        entityFingerprint: "fingerprint",
        createdAt: "2026-07-13T00:15:00.000Z",
        expiresAt: "2026-07-13T00:00:00.000Z",
        current,
        proposed,
      }),
    ).toThrow("expiry_not_after_creation");

    const state = buildPharmacyAdminBoundedReadState({
      operation: "review",
      actorId: "admin-1",
      entityId: "pharmacy-1",
      snapshotHash: "snapshot-hash",
      entityFingerprint: "fingerprint",
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      reviewedAt: "2026-07-13T00:05:00.000Z",
      current,
      proposed,
    });

    expect(isPharmacyAdminBoundedReadStateFresh(state, "2026-07-13T00:14:59.000Z")).toBe(true);
    expect(isPharmacyAdminBoundedReadStateFresh(state, "2026-07-13T00:15:00.000Z")).toBe(false);
  });
});
