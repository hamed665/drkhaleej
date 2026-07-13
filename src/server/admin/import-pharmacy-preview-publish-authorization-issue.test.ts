import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";
import type {
  PharmacyPublishAuthorizationEnvelopeRecord,
  PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";
import { issuePharmacyPreviewPublishAuthorization } from "./import-pharmacy-preview-publish-authorization-issue";
import type { PharmacyPreviewPublishCapability } from "./import-pharmacy-preview-publish-capability";

const capability: PharmacyPreviewPublishCapability = {
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
};

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

const reviewState = buildPharmacyAdminBoundedReadState({
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
});

function store(createResult = true): PharmacyPublishAuthorizationEnvelopeStore {
  let record: PharmacyPublishAuthorizationEnvelopeRecord | null = null;
  return {
    create: vi.fn(async (value) => {
      record = value;
      return createResult;
    }),
    readByTokenHash: vi.fn(async () => record),
    consume: vi.fn(async () => false),
  };
}

describe("Preview Pharmacy publish authorization issuance", () => {
  it("issues one opaque authorization only after a visible non-executable capability", async () => {
    const result = await issuePharmacyPreviewPublishAuthorization({
      capability,
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewState,
      store: store(),
    });

    expect(result.capability).toEqual(capability);
    expect(result.authorization?.token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.authorization?.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.authorization?.token).not.toContain("admin-1");
    expect(result.authorization?.nonce).not.toContain("pharmacy-1");
  });

  it("does not issue when capability is locked", async () => {
    const authorizationStore = store();
    const result = await issuePharmacyPreviewPublishAuthorization({
      capability: { ...capability, visible: false, mode: "locked" },
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewState,
      store: authorizationStore,
    });

    expect(result.authorization).toBeNull();
    expect(authorizationStore.create).not.toHaveBeenCalled();
  });

  it("locks capability when store is unavailable or persistence fails", async () => {
    const unavailable = await issuePharmacyPreviewPublishAuthorization({
      capability,
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewState,
      store: null,
    });
    expect(unavailable.authorization).toBeNull();
    expect(unavailable.capability.blockers).toContain("authorization_store_unavailable");

    const failed = await issuePharmacyPreviewPublishAuthorization({
      capability,
      actorId: "admin-1",
      entityId: "pharmacy-1",
      reviewState,
      store: store(false),
    });
    expect(failed.authorization).toBeNull();
    expect(failed.capability.blockers).toContain("authorization_issue_failed");
  });
});