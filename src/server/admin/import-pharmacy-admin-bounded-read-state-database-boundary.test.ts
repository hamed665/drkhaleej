import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";

const state = Object.fromEntries(
  PHARMACY_ADMIN_DIFF_FIELDS.map((field) => [field, null]),
) as Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
Object.assign(state, {
  status: "draft",
  is_active: false,
  is_featured: false,
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  projection_version: "12",
  canonical_path: "/en/om/pharmacies/database-boundary",
  name_en: "Database Boundary Pharmacy",
  metadata_source_evidence: "null",
});

describe("Pharmacy Review database time boundary", () => {
  it("rejects reviewed_at exactly at expires_at just like the PostgreSQL constraint", () => {
    expect(() => buildPharmacyAdminBoundedReadState({
      operation: "review",
      actorId: "00000000-0000-4000-8000-000000000001",
      entityId: "00000000-0000-4000-8000-000000000002",
      snapshotHash: "a".repeat(64),
      entityFingerprint: "b".repeat(64),
      expectedEntityVersion: "2026-07-27T00:00:00.000Z",
      createdAt: "2026-07-27T13:59:47.120Z",
      reviewedAt: "2026-07-27T14:14:47.120Z",
      expiresAt: "2026-07-27T14:14:47.120Z",
      current: state,
      proposed: state,
    })).toThrow("reviewed_at_out_of_range");
  });
});
