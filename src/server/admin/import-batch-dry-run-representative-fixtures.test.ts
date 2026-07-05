import { describe, expect, it } from "vitest";

import {
  buildImportBatchDryRunHospitalRelationSummary,
  buildImportBatchDryRunLocalSuggestionSummary,
  buildImportBatchDryRunReport,
  importBatchDryRunRequiredChecks,
  type ImportBatchDryRunCheck,
  type ImportBatchDryRunFamilySummary,
  type ImportBatchDryRunHospitalRelationRow,
  type ImportBatchDryRunLocalSuggestionFamily,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

const checkedAt = "2026-07-05";

function passingChecks(): readonly ImportBatchDryRunCheck[] {
  return importBatchDryRunRequiredChecks.map((key) => ({
    key,
    passed: true,
    notes: null,
  }));
}

function familySummary(): ImportBatchDryRunFamilySummary {
  return {
    selectedCount: 1,
    eligibleCount: 1,
    blockedCount: 0,
    sitemapUrlCount: 1,
    sampledUrlCount: 0,
    blockers: [],
    samples: [],
  };
}

function localRow(overrides: Partial<ImportBatchDryRunLocalSuggestionRow>): ImportBatchDryRunLocalSuggestionRow {
  return {
    sourceFamily: "doctor",
    sourceKey: "doctor-al-khuwair-one",
    sourceArea: "Al Khuwair",
    sourceGovernorate: "Muscat",
    targetFamily: "pharmacy",
    targetKey: "pharmacy-al-khuwair-one",
    targetArea: "Al Khuwair",
    targetGovernorate: "Muscat",
    targetName: "Representative Pharmacy One",
    sourceName: "Provider official website",
    sourceUrl: null,
    lastCheckedAt: checkedAt,
    confidence: "high",
    publicVisible: true,
    relationStatus: "active",
    ...overrides,
  } as ImportBatchDryRunLocalSuggestionRow;
}

function hospitalRow(overrides: Partial<ImportBatchDryRunHospitalRelationRow>): ImportBatchDryRunHospitalRelationRow {
  return {
    hospitalKey: "hospital-al-khuwair-one",
    doctorKey: "doctor-al-khuwair-one",
    doctorName: "Representative Doctor One",
    sourceUrl: "https://example.com/hospital-doctor-source",
    lastCheckedAt: checkedAt,
    confidence: "high",
    branchVerified: true,
    publicVisible: true,
    relationStatus: "active",
    ...overrides,
  } as ImportBatchDryRunHospitalRelationRow;
}

const localSuggestionRows: readonly ImportBatchDryRunLocalSuggestionRow[] = [
  localRow({
    sourceName: "Oman Ministry of Health directory",
    confidence: "high",
  }),
  localRow({
    sourceFamily: "pharmacy",
    sourceKey: "pharmacy-al-khuwair-one",
    targetFamily: "doctor",
    targetKey: "doctor-al-khuwair-one",
    targetName: "Representative Doctor One",
    sourceName: null,
    sourceUrl: "https://example.com/pharmacy-doctor-source",
    confidence: "medium",
    relationStatus: "approved",
  }),
  localRow({
    targetName: "Private Review Pharmacy",
    confidence: "medium",
    publicVisible: false,
  }),
  localRow({
    targetName: "Missing Source Evidence Pharmacy",
    sourceName: null,
    sourceUrl: null,
  }),
  localRow({
    targetName: "Missing Last Checked Pharmacy",
    lastCheckedAt: null,
  }),
  localRow({
    targetName: "Wrong Location Pharmacy",
    targetArea: "Qurum",
  }),
  localRow({
    targetName: "Missing Target Candidate Pharmacy",
    targetKey: "pharmacy-not-selected",
    confidence: "medium",
  }),
  localRow({
    targetName: "Source Candidate Missing Pharmacy",
    sourceKey: "doctor-not-in-candidates",
    confidence: "medium",
  }),
  localRow({
    targetFamily: "doctor",
    targetKey: "doctor-al-khuwair-one",
    targetName: "Representative Doctor One",
    confidence: "medium",
  }),
  localRow({
    targetName: "Requires Review Pharmacy",
    requiresReview: true,
  }),
  localRow({
    targetName: "Disputed Pharmacy",
    relationStatus: "disputed",
  }),
  localRow({
    targetFamily: "clinic" as unknown as ImportBatchDryRunLocalSuggestionFamily,
    targetKey: "clinic-al-khuwair-one",
    targetName: "Unsupported Clinic One",
  }),
];

const hospitalRelationRows: readonly ImportBatchDryRunHospitalRelationRow[] = [
  hospitalRow({}),
  hospitalRow({
    doctorName: "Disputed Hospital Doctor One",
    sourceUrl: "https://example.com/hospital-doctor-disputed-source",
    confidence: "medium",
    relationStatus: "disputed",
  }),
];

describe("representative first-batch dry-run fixtures", () => {
  it("summarizes safe, unsafe, and private suggestions without publish side effects", () => {
    const localSuggestions = buildImportBatchDryRunLocalSuggestionSummary({
      rows: localSuggestionRows,
      candidateKeys: {
        doctor: ["doctor-al-khuwair-one"],
        pharmacy: ["pharmacy-al-khuwair-one"],
        hospital: ["hospital-al-khuwair-one"],
      },
    });
    const hospitalRelations = buildImportBatchDryRunHospitalRelationSummary({
      rows: hospitalRelationRows,
      candidateHospitalKeys: ["hospital-al-khuwair-one"],
    });
    const report = buildImportBatchDryRunReport({
      rehearsalId: "first-batch-representative-fixture",
      generatedAt: "2026-07-05T00:00:00.000Z",
      commitSha: "representative-fixture",
      checks: passingChecks(),
      sitemap: {
        beforeUrlCount: 0,
        afterUrlCount: 3,
        importedDeltaCount: 3,
        unexpectedUrlCount: 0,
        unexpectedUrls: [],
      },
      byFamily: {
        doctor: familySummary(),
        pharmacy: familySummary(),
        hospital: familySummary(),
      },
      hospitalRelations,
      localSuggestions,
      notes: ["Representative fixture only; no database, route, sitemap, or publish writes."],
    });
    const localBlockerReasons = localSuggestions.unsafePublicBlockers.map((blocker) => blocker.reason);

    expect(localSuggestions.publicVisibleCount).toBe(2);
    expect(localSuggestions.unsafePublicCount).toBe(9);
    expect(localSuggestions.privateReviewCount).toBe(1);
    expect(hospitalRelations.publicVisibleCount).toBe(1);
    expect(hospitalRelations.unsafePublicCount).toBe(1);
    expect(report.decision).toBe("no_go");

    expect(localBlockerReasons).toContain("source_missing");
    expect(localBlockerReasons).toContain("last_checked_missing");
    expect(localBlockerReasons).toContain("location_mismatch");
    expect(localBlockerReasons).toContain("target_candidate_missing");
    expect(localBlockerReasons).toContain("source_candidate_missing");
    expect(localBlockerReasons).toContain("same_entity_self_link");
    expect(localBlockerReasons).toContain("ambiguous_review_required");
    expect(localBlockerReasons).toContain("unsupported_family");
    expect(hospitalRelations.unsafePublicBlockers.map((blocker) => blocker.reason)).toEqual([
      "ambiguous_review_required",
    ]);
  });
});
