import { describe, expect, it } from "vitest";

import { buildImportBatchDryRunPayloadExtraction } from "./import-batch-dry-run-payload-adapter";
import { buildImportBatchDryRunLocalSuggestionSummary } from "./import-batch-dry-run-report";

describe("buildImportBatchDryRunPayloadExtraction", () => {
  it("keeps unsupported local suggestion targets unsafe instead of defaulting to hospital", () => {
    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: [
        {
          candidateKey: "doctor-1",
          entityType: "doctor",
          candidateStatus: "approved",
          candidatePayload: {
            geo: {
              area: "Al Khuwair",
              governorate: "Muscat",
            },
            relations: {
              localSuggestions: [
                {
                  targetFamily: "clinic",
                  targetKey: "clinic-1",
                  targetName: "Clinic One",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceUrl: "https://example.com/clinic-source",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetKey: "missing-target-kind-1",
                  targetName: "Missing Target Kind One",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "medium",
                  sourceUrl: "https://example.com/missing-target-kind-source",
                  lastCheckedAt: "2026-07-01",
                },
              ],
            },
          },
        },
      ],
    });

    expect(extraction.localSuggestionRows.map((row) => row.targetFamily)).toEqual(["clinic", "unsupported"]);
    expect(extraction.localSuggestionRows.map((row) => row.targetFamily)).not.toContain("hospital");

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });

    expect(summary.unsafePublicCount).toBe(2);
    expect(summary.unsafePublicBlockers.filter((blocker) => blocker.reason === "unsupported_family")).toHaveLength(2);
  });
});
