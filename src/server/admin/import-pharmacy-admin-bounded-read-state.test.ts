import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  isPharmacyAdminBoundedReadStateFresh,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";

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
  projection_version: "12",
  canonical_path: "/en/om/pharmacies/example",
  name_en: "Old Pharmacy",
  default_country: "om",
  default_locale: "en",
  metadata_source_evidence: "null",
});

const proposed = {
  ...current,
  projection_version: "13",
  name_en: "Reviewed Pharmacy",
};

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

    expect(state.schemaVersion).toBe("pharmacy_admin_read_state_v2");
    expect(state.diff).toEqual([
      { field: "projection_version", before: "12", after: "13" },
      { field: "name_en", before: "Old Pharmacy", after: "Reviewed Pharmacy" },
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
