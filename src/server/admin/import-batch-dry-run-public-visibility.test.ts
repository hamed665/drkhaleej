import { describe, expect, it } from "vitest";

import { buildImportBatchDryRunPayloadExtraction } from "./import-batch-dry-run-payload-adapter";
import { buildImportBatchDryRunLocalSuggestionSummary } from "./import-batch-dry-run-report";

describe("local suggestion public visibility dry-run behavior", () => {
  it("keeps only explicitly public rows public-safe", () => {
    const targetKeys = [
      "pharmacy-public-visible",
      "pharmacy-public-visible-alias",
      "pharmacy-private-visible-false",
      "pharmacy-private-visible-missing",
    ];

    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: [
        {
          candidateKey: "doctor-visibility-source",
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
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-public-visible",
                  targetName: "Public Visible Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-public-visible-alias",
                  targetName: "Public Visible Alias Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  public_visible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-private-visible-false",
                  targetName: "Private False Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: false,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-private-visible-missing",
                  targetName: "Private Missing Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
              ],
            },
          },
        },
        ...targetKeys.map((targetKey) => ({
          candidateKey: targetKey,
          entityType: "pharmacy",
          candidateStatus: "approved",
          candidatePayload: {},
        })),
      ],
    });

    expect(extraction.localSuggestionRows.map((row) => row.publicVisible)).toEqual([
      true,
      true,
      false,
      false,
    ]);

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });

    expect(summary.publicVisibleCount).toBe(2);
    expect(summary.privateReviewCount).toBe(2);
    expect(summary.unsafePublicCount).toBe(0);
    expect(summary.blockedFromPublicCount).toBe(0);
    expect(summary.unsafePublicBlockers).toEqual([]);
  });
});
