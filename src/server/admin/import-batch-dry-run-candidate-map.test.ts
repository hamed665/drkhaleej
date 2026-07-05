import { describe, expect, it } from "vitest";

import {
  buildImportBatchDryRunLocalSuggestionSummary,
  type ImportBatchDryRunLocalSuggestionFamily,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

function localSuggestionRow(input: {
  sourceFamily?: ImportBatchDryRunLocalSuggestionFamily;
  sourceKey?: string | null;
  targetFamily?: ImportBatchDryRunLocalSuggestionFamily;
  targetKey?: string | null;
}): ImportBatchDryRunLocalSuggestionRow {
  const targetKey = input.targetKey ?? "pharmacy-target";

  return {
    sourceFamily: input.sourceFamily ?? "doctor",
    sourceKey: input.sourceKey ?? "doctor-source",
    sourceArea: "Al Khuwair",
    sourceGovernorate: "Muscat",
    targetFamily: input.targetFamily ?? "pharmacy",
    targetKey,
    targetName: targetKey,
    targetArea: "Al Khuwair",
    targetGovernorate: "Muscat",
    sourceName: "Oman Ministry of Health directory",
    sourceUrl: null,
    lastCheckedAt: "2026-07-01",
    confidence: "high",
    publicVisible: true,
    relationStatus: "active",
  };
}

describe("buildImportBatchDryRunLocalSuggestionSummary candidate key map", () => {
  it("requires source and target candidate keys before public display", () => {
    const rows = [
      localSuggestionRow({
        targetKey: "pharmacy-safe-target",
      }),
      localSuggestionRow({
        sourceKey: "doctor-missing",
        targetKey: "pharmacy-source-missing-target",
      }),
      localSuggestionRow({
        targetKey: "pharmacy-missing-target",
      }),
      localSuggestionRow({
        targetFamily: "radiology",
        targetKey: "radiology-future-target",
      }),
      localSuggestionRow({
        sourceFamily: "radiology",
        sourceKey: "radiology-future-source",
        targetKey: "pharmacy-future-source-target",
      }),
    ];

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows,
      candidateKeys: {
        doctor: ["doctor-source"],
        pharmacy: [
          "pharmacy-safe-target",
          "pharmacy-source-missing-target",
          "pharmacy-future-source-target",
        ],
        radiology: [],
      },
    });

    expect(summary.publicVisibleCount).toBe(1);
    expect(summary.unsafePublicCount).toBe(4);
    expect(summary.unsafePublicBlockers).toHaveLength(4);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.reason)).toEqual([
      "source_candidate_missing",
      "target_candidate_missing",
      "target_candidate_missing",
      "source_candidate_missing",
    ]);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.targetKey)).toEqual([
      "pharmacy-source-missing-target",
      "pharmacy-missing-target",
      "radiology-future-target",
      "pharmacy-future-source-target",
    ]);
  });
});
