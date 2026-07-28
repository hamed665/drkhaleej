import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
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
  canonical_path: "/en/om/pharmacies/recovery-roundtrip",
  name_en: "Recovery Roundtrip Pharmacy",
  metadata_source_evidence: "null",
});

const proposed: Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue> = {
  ...current,
  projection_version: "13",
};

const identity = {
  actorId: "00000000-0000-4000-8000-000000000001",
  entityId: "00000000-0000-4000-8000-000000000002",
  snapshotHash: "a".repeat(64),
  entityFingerprint: "b".repeat(64),
  expectedEntityVersion: "2026-07-27T00:00:00.000Z",
};

describe("Pharmacy recovery timestamp roundtrip", () => {
  it("keeps the recovery identity stable across equivalent Supabase timestamptz spellings", () => {
    const submitted = buildPharmacyAdminBoundedReadState({
      operation: "review",
      ...identity,
      createdAt: "2026-07-27T13:59:47.120Z",
      reviewedAt: "2026-07-27T13:59:47.121Z",
      expiresAt: "2026-07-27T14:14:47.120Z",
      current,
      proposed,
    });

    const databaseReadback = buildPharmacyAdminBoundedReadState({
      operation: "review",
      ...identity,
      createdAt: "2026-07-27 13:59:47.120+00",
      reviewedAt: "2026-07-27 13:59:47.121+00",
      expiresAt: "2026-07-27 14:14:47.120+00",
      current,
      proposed,
    });

    expect(databaseReadback.operationAttemptId).toBe(submitted.operationAttemptId);
    expect(databaseReadback.idempotencyKey).toBe(submitted.idempotencyKey);
    expect(databaseReadback.requestHash).toBe(submitted.requestHash);
    expect(databaseReadback.createdAt).toBe("2026-07-27T13:59:47.120Z");
    expect(databaseReadback.reviewedAt).toBe("2026-07-27T13:59:47.121Z");
    expect(databaseReadback.expiresAt).toBe("2026-07-27T14:14:47.120Z");
  });

  it("does not fabricate a recovery nonce when created and reviewed timestamps are the same instant", () => {
    const zulu = buildPharmacyAdminBoundedReadState({
      operation: "review",
      ...identity,
      createdAt: "2026-07-27T13:59:47.120Z",
      reviewedAt: "2026-07-27T13:59:47.120Z",
      expiresAt: "2026-07-27T14:14:47.120Z",
      current,
      proposed,
    });
    const offsetReadback = buildPharmacyAdminBoundedReadState({
      operation: "review",
      ...identity,
      createdAt: "2026-07-27T13:59:47.120Z",
      reviewedAt: "2026-07-27 13:59:47.120+00",
      expiresAt: "2026-07-27 14:14:47.120+00",
      current,
      proposed,
    });

    expect(offsetReadback.operationAttemptId).toBe(zulu.operationAttemptId);
    expect(offsetReadback.idempotencyKey).toBe(zulu.idempotencyKey);
  });
});
