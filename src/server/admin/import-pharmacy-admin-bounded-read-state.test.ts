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
  metadata_source_evidence: "null",
});

const proposed = {
  ...current,
  projection_version: "13",
  name_en: "Reviewed Pharmacy",
};

const identityInput = {
  actorId: "00000000-0000-4000-8000-000000000001",
  entityId: "00000000-0000-4000-8000-000000000002",
  snapshotHash: "a".repeat(64),
  entityFingerprint: "b".repeat(64),
  expectedEntityVersion: "2026-07-13T00:00:00.000Z",
};

describe("bounded Pharmacy Admin read state", () => {
  it("emits only allowlisted changed fields and one stable private operation identity", () => {
    const input = {
      operation: "dry_run" as const,
      ...identityInput,
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      current,
      proposed,
      blockerCodes: ["zeta", "alpha", "alpha", ""],
    };
    const state = buildPharmacyAdminBoundedReadState(input);
    const replay = buildPharmacyAdminBoundedReadState(input);

    expect(state.schemaVersion).toBe("pharmacy_admin_read_state_v3");
    expect(state.diff).toEqual([
      { field: "projection_version", before: "12", after: "13" },
      { field: "name_en", before: "Old Pharmacy", after: "Reviewed Pharmacy" },
    ]);
    expect(state.operationAttemptId).toBe(replay.operationAttemptId);
    expect(state.idempotencyKey).toBe(replay.idempotencyKey);
    expect(state.requestHash).toMatch(/^[a-f0-9]{64}$/);
    expect(state.patchHash).toMatch(/^[a-f0-9]{64}$/);
    expect(state.operationScope).toBe("reserve_private_publish");
    expect(state.entityFamily).toBe("pharmacy");
    expect(state.blockerCodes).toEqual(["alpha", "zeta"]);
    expect(state.publicVisibility).toBe("private");
    expect(state.indexEligible).toBe(false);
    expect(state.sitemapEligible).toBe(false);
    expect(state.routeEnabled).toBe(false);
    expect(state.diff.every((entry) => PHARMACY_ADMIN_DIFF_FIELDS.includes(entry.field))).toBe(true);
  });

  it("changes the operation identity when the proposed patch or expected version changes", () => {
    const base = buildPharmacyAdminBoundedReadState({
      operation: "dry_run",
      ...identityInput,
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      current,
      proposed,
    });
    const changedPatch = buildPharmacyAdminBoundedReadState({
      operation: "dry_run",
      ...identityInput,
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      current,
      proposed: { ...proposed, name_en: "Different Pharmacy" },
    });
    const changedVersion = buildPharmacyAdminBoundedReadState({
      operation: "dry_run",
      ...identityInput,
      expectedEntityVersion: "2026-07-13T00:01:00.000Z",
      createdAt: "2026-07-13T00:00:00.000Z",
      expiresAt: "2026-07-13T00:15:00.000Z",
      current,
      proposed,
    });

    expect(changedPatch.operationAttemptId).not.toBe(base.operationAttemptId);
    expect(changedVersion.operationAttemptId).not.toBe(base.operationAttemptId);
  });

  it("requires a bounded review timestamp for review state", () => {
    expect(() =>
      buildPharmacyAdminBoundedReadState({
        operation: "review",
        ...identityInput,
        createdAt: "2026-07-13T00:00:00.000Z",
        expiresAt: "2026-07-13T00:15:00.000Z",
        current,
        proposed,
      }),
    ).toThrow("reviewed_at_required");
  });

  it("rejects stale windows and reports freshness deterministically", () => {
    expect(() =>
      buildPharmacyAdminBoundedReadState({
        operation: "dry_run",
        ...identityInput,
        createdAt: "2026-07-13T00:15:00.000Z",
        expiresAt: "2026-07-13T00:00:00.000Z",
        current,
        proposed,
      }),
    ).toThrow("expiry_not_after_creation");

    const state = buildPharmacyAdminBoundedReadState({
      operation: "review",
      ...identityInput,
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
