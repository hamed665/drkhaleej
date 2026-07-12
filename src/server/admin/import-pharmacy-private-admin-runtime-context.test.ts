import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  loadPharmacyPrivateAdminRuntimeContext,
  type PharmacyPrivateAdminRuntimeCenter,
} from "./import-pharmacy-private-admin-runtime-context";

function center(overrides: Partial<PharmacyPrivateAdminRuntimeCenter> = {}): PharmacyPrivateAdminRuntimeCenter {
  return {
    id: "pharmacy-1",
    center_type: "pharmacy",
    slug: "pharmacy-one",
    name_en: "Pharmacy One",
    name_ar: "صيدلية واحد",
    legal_name: "Pharmacy One LLC",
    status: "draft",
    verification_status: "verified",
    primary_phone: "+96890000000",
    secondary_phone: null,
    whatsapp_phone: "+96890000000",
    email: "one@example.com",
    website_url: "https://example.com",
    logo_url: null,
    cover_image_url: null,
    short_description_en: null,
    short_description_ar: null,
    description_en: "Private pharmacy",
    description_ar: null,
    default_locale: "en",
    default_country: "om",
    is_active: false,
    is_claimable: true,
    is_featured: false,
    sort_order: 0,
    metadata: {
      source: "manual",
      projectionVersion: "projection-1",
      rawPayloadHash: "a".repeat(64),
      sourceEvidence: {
        source: "manual",
        sourceId: "source-1",
        sourceName: "Admin",
        importedBy: "admin-1",
        importedAt: "2026-07-12T00:00:00.000Z",
      },
      canonicalGeo: {
        country_code: "om",
        governorate_id: "gov-1",
        city_id: "city-1",
        area_id: "area-1",
        latitude: 23.5,
        longitude: 58.4,
        geo_confidence_score: 100,
        geo_source: "manual",
        geo_resolution_status: "manually_verified",
        geo_validated: true,
      },
    },
    deleted_at: null,
    updated_at: "2026-07-12T00:00:00.000Z",
    ...overrides,
  };
}

function input() {
  return {
    executionEnabled: true,
    environment: "preview",
    actorId: "admin-1",
    entityId: "pharmacy-1",
    allowedActorIds: ["admin-1"],
    allowedEntityIds: ["pharmacy-1"],
    approvalToken: "approved",
    expectedApprovalToken: "approved",
    now: new Date("2026-07-12T00:00:00.000Z"),
  };
}

describe("pharmacy private Admin runtime context", () => {
  it("builds one reservation and mutation context with a full private pharmacy snapshot", async () => {
    const result = await loadPharmacyPrivateAdminRuntimeContext(input(), {
      readPharmacy: vi.fn(async () => ({ data: center(), error: null })),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context.canaryInput.entityId).toBe("pharmacy-1");
    expect(result.context.mutationRequest.batchSize).toBe(1);
    expect(result.context.mutationRequest.rollbackState).toMatchObject({
      visibility: "private",
      indexPolicy: "noindex",
      sitemapPolicy: "excluded",
      center: {
        id: "pharmacy-1",
        centerType: "pharmacy",
        status: "draft",
        isActive: false,
        isFeatured: false,
      },
    });
    expect(result.snapshotHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.context.canaryInput.expectedEntityFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails before database reads outside Preview or outside both allowlists", async () => {
    const readPharmacy = vi.fn(async () => ({ data: center(), error: null }));
    const result = await loadPharmacyPrivateAdminRuntimeContext(
      { ...input(), environment: "production", actorId: "other", entityId: "other" },
      { readPharmacy },
    );

    expect(result).toEqual({
      ok: false,
      blockers: expect.arrayContaining(["environment_not_preview", "actor_not_allowed", "entity_not_allowed"]),
    });
    expect(readPharmacy).not.toHaveBeenCalled();
  });

  it("rejects public, deleted, non-pharmacy, or metadata-incomplete rows", async () => {
    const result = await loadPharmacyPrivateAdminRuntimeContext(input(), {
      readPharmacy: vi.fn(async () => ({
        data: center({ center_type: "hospital", status: "active", is_active: true, deleted_at: "2026-01-01", metadata: {} }),
        error: null,
      })),
    });

    expect(result).toEqual({
      ok: false,
      blockers: expect.arrayContaining([
        "entity_not_pharmacy",
        "pharmacy_not_private",
        "pharmacy_deleted",
        "canonical_geo_missing",
        "source_evidence_missing",
        "projection_version_missing",
      ]),
    });
  });
});
