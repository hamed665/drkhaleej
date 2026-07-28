import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildImportedProviderDiscoveryEntry,
  type PublicImportProviderCandidateRow,
  type PublicImportProviderQueueRow,
} from "./public-provider-import-adapter";

function queueRow(
  targetEntityType: string,
  canonicalPath: string,
): PublicImportProviderQueueRow {
  return {
    id: "queue-1",
    metadata: {
      canonical_path: canonicalPath,
      sourceName: "Reviewed source",
      lastCheckedAt: "2026-07-28T10:00:00.000Z",
      phone: "+96824123456",
    },
    target_entity_type: targetEntityType,
    publish_status: "index_eligible",
    index_policy: "index",
    sitemap_policy: "included",
    updated_at: "2026-07-28T10:00:00.000Z",
  };
}

function candidate(entityType: string): PublicImportProviderCandidateRow {
  return {
    id: "candidate-1",
    candidate_status: "approved",
    entity_type: entityType,
    candidate_payload: {
      name: "Reviewed provider",
      geo: { governorate: "Muscat" },
    },
  };
}

describe("public provider import adapter convergence", () => {
  it("keeps the existing canonical Doctor route eligible", () => {
    expect(
      buildImportedProviderDiscoveryEntry(
        queueRow("doctor", "/en/om/doctor/reviewed-provider"),
        candidate("doctor"),
      ),
    ).toMatchObject({
      entityType: "doctor",
      family: "doctors",
      canonicalPath: "/en/om/doctor/reviewed-provider",
      publicDetailEligible: true,
      publicDiscoveryEligible: true,
      publicSitemapEligible: true,
    });
  });

  it("uses a canonical candidate to disambiguate the legacy center queue value", () => {
    expect(
      buildImportedProviderDiscoveryEntry(
        queueRow("center", "/en/om/center/reviewed-provider"),
        candidate("medical_center"),
      ),
    ).toMatchObject({
      entityType: "clinic",
      family: "centers",
      publicDetailEligible: false,
      publicDiscoveryEligible: false,
      publicSitemapEligible: false,
    });
    expect(
      buildImportedProviderDiscoveryEntry(
        queueRow("center", "/en/om/center/reviewed-provider"),
        null,
      ),
    ).toBeNull();
  });

  it("fails closed when queue and candidate entity types conflict", () => {
    expect(
      buildImportedProviderDiscoveryEntry(
        queueRow("doctor", "/en/om/doctor/reviewed-provider"),
        candidate("pharmacy"),
      ),
    ).toBeNull();
    expect(
      buildImportedProviderDiscoveryEntry(
        queueRow("unknown_provider", "/en/om/doctor/reviewed-provider"),
        candidate("doctor"),
      ),
    ).toBeNull();
  });
});
