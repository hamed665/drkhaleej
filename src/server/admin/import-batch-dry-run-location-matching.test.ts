import { describe, expect, it } from "vitest";

import {
  buildImportBatchDryRunLocalSuggestionSummary,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

function localSuggestionRow(input: {
  targetKey: string;
  sourceArea?: string | null;
  sourceGovernorate?: string | null;
  targetArea?: string | null;
  targetGovernorate?: string | null;
}): ImportBatchDryRunLocalSuggestionRow {
  return {
    sourceFamily: "doctor",
    sourceKey: "doctor-location-source",
    sourceArea: input.sourceArea ?? "Al Khuwair",
    sourceGovernorate: input.sourceGovernorate ?? "Muscat",
    targetFamily: "pharmacy",
    targetKey: input.targetKey,
    targetName: input.targetKey,
    targetArea: input.targetArea ?? "Al Khuwair",
    targetGovernorate: input.targetGovernorate ?? "Muscat",
    sourceName: "Oman Ministry of Health directory",
    sourceUrl: null,
    lastCheckedAt: "2026-07-01",
    confidence: "high",
    publicVisible: true,
    relationStatus: "active",
  };
}

describe("buildImportBatchDryRunLocalSuggestionSummary location matching", () => {
  it("keeps only same area and same governorate public-safe", () => {
    const rows = [
      localSuggestionRow({ targetKey: "same-location" }),
      localSuggestionRow({
        targetKey: "same-location-case-insensitive",
        sourceArea: "Al Khuwair",
        sourceGovernorate: "Muscat",
        targetArea: "al khuwair",
        targetGovernorate: "muscat",
      }),
      localSuggestionRow({
        targetKey: "different-area",
        targetArea: "Qurum",
      }),
      localSuggestionRow({
        targetKey: "different-governorate",
        targetGovernorate: "Dhofar",
      }),
      localSuggestionRow({
        targetKey: "missing-area",
        targetArea: null,
      }),
      localSuggestionRow({
        targetKey: "missing-governorate",
        targetGovernorate: null,
      }),
    ];

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows,
      candidateKeys: {
        doctor: ["doctor-location-source"],
        pharmacy: rows.map((row) => row.targetKey ?? ""),
      },
    });

    expect(summary.publicVisibleCount).toBe(2);
    expect(summary.unsafePublicCount).toBe(4);
    expect(summary.unsafePublicBlockers).toHaveLength(4);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.reason)).toEqual([
      "location_mismatch",
      "location_mismatch",
      "location_mismatch",
      "location_mismatch",
    ]);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.targetKey)).toEqual([
      "different-area",
      "different-governorate",
      "missing-area",
      "missing-governorate",
    ]);
  });
});
