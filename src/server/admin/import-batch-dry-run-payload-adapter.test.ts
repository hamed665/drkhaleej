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

  it("aligns dry-run source evidence with the runtime local suggestion guard", () => {
    const targetKeys = [
      "pharmacy-source-url",
      "pharmacy-source-name",
      "pharmacy-url-without-last-checked",
      "pharmacy-name-without-last-checked",
      "pharmacy-missing-source-anchor",
    ];
    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: [
        {
          candidateKey: "doctor-source",
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
                  targetKey: "pharmacy-source-url",
                  targetName: "Source URL Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceUrl: "https://example.com/source-url",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-source-name",
                  targetName: "Source Name Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                  lastCheckedAt: "2026-07-01",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-url-without-last-checked",
                  targetName: "URL Without Last Checked Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceUrl: "https://example.com/source-url-without-date",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-name-without-last-checked",
                  targetName: "Name Without Last Checked Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
                  sourceName: "Oman Ministry of Health directory",
                },
                {
                  targetFamily: "pharmacy",
                  targetKey: "pharmacy-missing-source-anchor",
                  targetName: "Missing Source Anchor Pharmacy",
                  targetArea: "Al Khuwair",
                  targetGovernorate: "Muscat",
                  publicVisible: true,
                  confidence: "high",
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

    const rowsByTargetKey = new Map(extraction.localSuggestionRows.map((row) => [row.targetKey, row]));
    expect(rowsByTargetKey.get("pharmacy-source-name")?.sourceName).toBe("Oman Ministry of Health directory");

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });

    expect(summary.publicVisibleCount).toBe(2);
    expect(summary.unsafePublicCount).toBe(3);

    const blockersByTargetKey = new Map(
      summary.unsafePublicBlockers.map((blocker) => [blocker.targetKey, blocker.reason]),
    );
    expect(blockersByTargetKey.get("pharmacy-url-without-last-checked")).toBe("last_checked_missing");
    expect(blockersByTargetKey.get("pharmacy-name-without-last-checked")).toBe("last_checked_missing");
    expect(blockersByTargetKey.get("pharmacy-missing-source-anchor")).toBe("source_missing");
  });
});
