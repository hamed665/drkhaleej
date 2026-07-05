import { describe, expect, it } from "vitest";

import {
  buildImportBatchDryRunHospitalRelationSummary,
  buildImportBatchDryRunLocalSuggestionSummary,
  buildImportBatchDryRunReport,
  emptyImportBatchDryRunFamilySummary,
  importBatchDryRunRequiredChecks,
  type ImportBatchDryRunCheck,
  type ImportBatchDryRunFamilySummary,
  type ImportBatchDryRunHospitalRelationRow,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

function passingChecks(): readonly ImportBatchDryRunCheck[] {
  return importBatchDryRunRequiredChecks.map((key) => ({ key, passed: true, notes: null }));
}

function familySummary(selectedCount: number): ImportBatchDryRunFamilySummary {
  return {
    ...emptyImportBatchDryRunFamilySummary(),
    selectedCount,
    eligibleCount: selectedCount,
    sitemapUrlCount: selectedCount,
  };
}

describe("first-batch dry-run go decision", () => {
  it("returns go when every gate is clean", () => {
    const localSuggestionRows: readonly ImportBatchDryRunLocalSuggestionRow[] = [
      {
        sourceFamily: "doctor",
        sourceKey: "doctor-go-one",
        sourceArea: "Al Khuwair",
        sourceGovernorate: "Muscat",
        targetFamily: "pharmacy",
        targetKey: "pharmacy-go-one",
        targetArea: "Al Khuwair",
        targetGovernorate: "Muscat",
        targetName: "Go Path Pharmacy One",
        sourceName: "Oman Ministry of Health directory",
        sourceUrl: null,
        lastCheckedAt: "2026-07-05",
        confidence: "high",
        publicVisible: true,
        relationStatus: "active",
      },
      {
        sourceFamily: "pharmacy",
        sourceKey: "pharmacy-go-one",
        sourceArea: "Al Khuwair",
        sourceGovernorate: "Muscat",
        targetFamily: "doctor",
        targetKey: "doctor-go-one",
        targetArea: "Al Khuwair",
        targetGovernorate: "Muscat",
        targetName: "Go Path Doctor One",
        sourceName: null,
        sourceUrl: "https://example.com/go-path-source",
        lastCheckedAt: "2026-07-05",
        confidence: "medium",
        publicVisible: true,
        relationStatus: "approved",
      },
    ];
    const hospitalRelationRows: readonly ImportBatchDryRunHospitalRelationRow[] = [
      {
        hospitalKey: "hospital-go-one",
        doctorKey: "doctor-go-one",
        doctorName: "Go Path Doctor One",
        sourceUrl: "https://example.com/go-path-hospital-doctor-source",
        lastCheckedAt: "2026-07-05",
        confidence: "high",
        branchVerified: true,
        publicVisible: true,
        relationStatus: "active",
      },
    ];
    const localSuggestions = buildImportBatchDryRunLocalSuggestionSummary({
      rows: localSuggestionRows,
      candidateKeys: {
        doctor: ["doctor-go-one"],
        pharmacy: ["pharmacy-go-one"],
        hospital: ["hospital-go-one"],
      },
    });
    const hospitalRelations = buildImportBatchDryRunHospitalRelationSummary({
      rows: hospitalRelationRows,
      candidateHospitalKeys: ["hospital-go-one"],
    });
    const report = buildImportBatchDryRunReport({
      rehearsalId: "first-batch-go-path",
      generatedAt: "2026-07-05T00:00:00.000Z",
      commitSha: "go-path",
      checks: passingChecks(),
      sitemap: {
        beforeUrlCount: 100,
        afterUrlCount: 103,
        importedDeltaCount: 3,
        unexpectedUrlCount: 0,
        unexpectedUrls: [],
      },
      byFamily: {
        doctor: familySummary(1),
        pharmacy: familySummary(1),
        hospital: familySummary(1),
      },
      hospitalRelations,
      localSuggestions,
      notes: ["Golden path test only; no import or publish side effects."],
    });

    expect(localSuggestions.unsafePublicCount).toBe(0);
    expect(localSuggestions.unsafePublicBlockers).toEqual([]);
    expect(hospitalRelations.unsafePublicCount).toBe(0);
    expect(hospitalRelations.unsafePublicBlockers).toEqual([]);
    expect(report.sitemap.unexpectedUrlCount).toBe(0);
    expect(report.sitemap.unexpectedUrls).toEqual([]);
    expect(report.decision).toBe("go");
  });
});
