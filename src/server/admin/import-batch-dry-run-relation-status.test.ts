import { describe, expect, it } from "vitest";

import {
  buildImportBatchDryRunLocalSuggestionSummary,
  type ImportBatchDryRunLocalSuggestionRow,
} from "./import-batch-dry-run-report";

function localSuggestionRow(input: {
  targetKey: string;
  relationStatus?: string | null;
  requiresReview?: boolean;
}): ImportBatchDryRunLocalSuggestionRow {
  return {
    sourceFamily: "doctor",
    sourceKey: "doctor-source",
    sourceArea: "Al Khuwair",
    sourceGovernorate: "Muscat",
    targetFamily: "pharmacy",
    targetKey: input.targetKey,
    targetName: input.targetKey,
    targetArea: "Al Khuwair",
    targetGovernorate: "Muscat",
    sourceName: "Oman Ministry of Health directory",
    sourceUrl: null,
    lastCheckedAt: "2026-07-01",
    confidence: "high",
    publicVisible: true,
    relationStatus: input.relationStatus,
    requiresReview: input.requiresReview,
  };
}

describe("buildImportBatchDryRunLocalSuggestionSummary relation status", () => {
  it("allows only empty, active, and approved public local suggestions", () => {
    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: [
        localSuggestionRow({ targetKey: "pharmacy-status-empty" }),
        localSuggestionRow({ targetKey: "pharmacy-status-active", relationStatus: "active" }),
        localSuggestionRow({ targetKey: "pharmacy-status-approved", relationStatus: "approved" }),
        localSuggestionRow({ targetKey: "pharmacy-status-draft", relationStatus: "draft" }),
        localSuggestionRow({ targetKey: "pharmacy-status-disputed", relationStatus: "disputed" }),
        localSuggestionRow({ targetKey: "pharmacy-requires-review", relationStatus: "active", requiresReview: true }),
      ],
      candidateKeys: {
        doctor: ["doctor-source"],
        pharmacy: [
          "pharmacy-status-empty",
          "pharmacy-status-active",
          "pharmacy-status-approved",
          "pharmacy-status-draft",
          "pharmacy-status-disputed",
          "pharmacy-requires-review",
        ],
      },
    });

    expect(summary.publicVisibleCount).toBe(3);
    expect(summary.unsafePublicCount).toBe(3);
    expect(summary.unsafePublicBlockers).toHaveLength(3);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.reason)).toEqual([
      "ambiguous_review_required",
      "ambiguous_review_required",
      "ambiguous_review_required",
    ]);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.targetKey)).toEqual([
      "pharmacy-status-draft",
      "pharmacy-status-disputed",
      "pharmacy-requires-review",
    ]);
  });
});
