import { describe, expect, it } from "vitest";

import { buildImportBatchDryRunPayloadExtraction } from "./import-batch-dry-run-payload-adapter";
import { buildImportBatchDryRunLocalSuggestionSummary } from "./import-batch-dry-run-report";

describe("future local suggestion family dry-run skeletons", () => {
  it("normalizes future family aliases while still requiring candidate-map support", () => {
    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: [
        {
          candidateKey: "imaging-source",
          entityType: "imaging",
          candidateStatus: "approved",
          candidatePayload: {
            geo: {
              area: "Al Khuwair",
              governorate: "Muscat",
            },
            relations: {
              localSuggestions: [
                {
                  targetFamily: "dental",
                  targetKey: "dental-target",
                  targetName: "Dental Target",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "beauty_salon",
                  targetKey: "beauty-target",
                  targetName: "Beauty Target",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
              ],
            },
          },
        },
        {
          candidateKey: "dental-target",
          entityType: "dentist",
          candidateStatus: "approved",
          candidatePayload: {},
        },
      ],
    });

    expect(extraction.localSuggestionCandidateKeys.radiology).toEqual(["imaging-source"]);
    expect(extraction.localSuggestionCandidateKeys.dentistry).toEqual(["dental-target"]);
    expect(extraction.localSuggestionCandidateKeys.beauty).toEqual([]);
    expect(extraction.localSuggestionRows.map((row) => row.sourceFamily)).toEqual([
      "radiology",
      "radiology",
    ]);
    expect(extraction.localSuggestionRows.map((row) => row.targetFamily)).toEqual([
      "dentistry",
      "beauty",
    ]);

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });

    expect(summary.publicVisibleCount).toBe(1);
    expect(summary.unsafePublicCount).toBe(1);
    expect(summary.unsafePublicBlockers).toHaveLength(1);
    expect(summary.unsafePublicBlockers[0]?.reason).toBe("target_candidate_missing");
    expect(summary.unsafePublicBlockers[0]?.targetFamily).toBe("beauty");
    expect(summary.unsafePublicBlockers[0]?.targetKey).toBe("beauty-target");
  });
});
