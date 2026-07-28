import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}));

import {
  buildPublicImportSitemapEntry,
  type IncludedImportSitemapRow,
} from "./import-sitemap";

function reviewedRow(
  entityType: string,
  canonicalPath: string,
): IncludedImportSitemapRow {
  return {
    id: `queue-${entityType}`,
    target_entity_type: entityType,
    updated_at: "2026-07-28T10:00:00.000Z",
    metadata: {
      sitemap_included: true,
      robots_policy: "index",
      canonical_path: canonicalPath,
      import_entity_candidate_id: `candidate-${entityType}`,
    },
  };
}

describe("public import sitemap entry", () => {
  it("accepts an existing enabled route only when the resolver path matches exactly", () => {
    expect(
      buildPublicImportSitemapEntry(
        reviewedRow("doctor", "/en/om/doctor/sara-ahmed"),
      ),
    ).toEqual({
      entityType: "doctor",
      pathname: "/en/om/doctor/sara-ahmed",
      lastModified: new Date("2026-07-28T10:00:00.000Z"),
    });

    expect(
      buildPublicImportSitemapEntry(
        reviewedRow("doctor", "/en/om/doctors/sara-ahmed"),
      ),
    ).toBeNull();
  });

  it("keeps pharmacy out until its independent sitemap promotion and keeps hospital disabled", () => {
    expect(
      buildPublicImportSitemapEntry(
        reviewedRow("pharmacy", "/en/om/pharmacies/al-khuwair-pharmacy"),
      ),
    ).toBeNull();
    expect(
      buildPublicImportSitemapEntry(
        reviewedRow("hospital", "/ar/om/hospitals/muscat-general"),
      ),
    ).toBeNull();
  });

  it("rejects missing review evidence and unknown entity types", () => {
    const missingEvidence = reviewedRow("doctor", "/en/om/doctor/sara-ahmed");
    missingEvidence.metadata = {
      sitemap_included: true,
      robots_policy: "index",
      canonical_path: "/en/om/doctor/sara-ahmed",
    };

    expect(buildPublicImportSitemapEntry(missingEvidence)).toBeNull();
    expect(
      buildPublicImportSitemapEntry(
        reviewedRow("human_pharmacy", "/en/om/pharmacies/example"),
      ),
    ).toBeNull();
  });
});
