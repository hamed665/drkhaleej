import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyCanonicalMutationPatch,
  projectPharmacyCanonicalMutationPatchForReview,
  projectPharmacyRollbackSnapshotForMutationReview,
  serializePharmacyMutationReviewValue,
} from "./import-pharmacy-canonical-mutation-patch";

const draft = {
  draftId: "pharmacy-1",
  source: "excel",
  entityType: "pharmacy",
  name: "Reviewed Pharmacy",
  legalName: "Reviewed Pharmacy LLC",
  slugCandidate: "reviewed-pharmacy",
  description: "Reviewed description",
  services: [],
  specialties: [],
  contact: {
    phone: "+96811111111",
    whatsapp: "+96822222222",
    email: "reviewed@example.com",
    website: "https://example.com",
  },
  canonicalGeo: {
    country_code: "om",
    geo_resolution_status: "resolved",
  },
  sourceEvidence: { z: 1, a: { y: 2, x: 3 } },
  rawPayloadHash: "raw-hash",
  duplicateCandidateIds: [],
  requiresManualReview: false,
} as const;

describe("canonical Pharmacy mutation patch", () => {
  it("builds the exact RPC patch and deterministic review projection from one authority", () => {
    const patch = buildPharmacyCanonicalMutationPatch(draft);
    const review = projectPharmacyCanonicalMutationPatchForReview(patch);

    expect(patch.name_en).toBe("Reviewed Pharmacy");
    expect(patch.default_country).toBe("om");
    expect(patch.default_locale).toBe("en");
    expect(patch.metadata.visibility).toBe("private");
    expect(review.name_en).toBe(patch.name_en);
    expect(review.metadata_source).toBe(patch.metadata.source);
    expect(review.metadata_source_evidence).toBe('{"a":{"x":3,"y":2},"z":1}');
    expect(review.metadata_public_route_enabled).toBe(false);
  });

  it("canonicalizes nested evidence independently of key insertion order", () => {
    expect(serializePharmacyMutationReviewValue({ b: 2, a: 1 })).toBe(
      serializePharmacyMutationReviewValue({ a: 1, b: 2 }),
    );
  });

  it("projects the current rollback snapshot with the same review field contract", () => {
    const current = projectPharmacyRollbackSnapshotForMutationReview({
      center: {
        nameEn: "Old Pharmacy",
        legalName: null,
        slug: "old-pharmacy",
        descriptionEn: null,
        primaryPhone: null,
        whatsappPhone: null,
        email: null,
        websiteUrl: null,
        defaultCountry: "om",
        defaultLocale: "ar",
        metadata: {
          source: "manual",
          sourceEvidence: { source: "old" },
          rawPayloadHash: null,
          visibility: "private",
          publicRouteEnabled: false,
          indexable: false,
          sitemapEligible: false,
        },
      },
    });

    expect(current).not.toBeNull();
    expect(current?.name_en).toBe("Old Pharmacy");
    expect(current?.default_locale).toBe("ar");
    expect(current?.metadata_source_evidence).toBe('{"source":"old"}');
  });
});
