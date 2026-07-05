import { describe, expect, it } from "vitest";

import { buildImportBatchDryRunPayloadExtraction } from "./import-batch-dry-run-payload-adapter";
import { buildImportBatchDryRunLocalSuggestionSummary } from "./import-batch-dry-run-report";

describe("dry-run payload adapter boolean aliases", () => {
  it("maps strict visibility aliases and fails closed for invalid text", () => {
    const aliases = [
      ["true-lower", "true", true],
      ["true-upper", "TRUE", true],
      ["yes-lower", "yes", true],
      ["yes-upper", "YES", true],
      ["one", "1", true],
      ["false-lower", "false", false],
      ["false-upper", "FALSE", false],
      ["no-lower", "no", false],
      ["no-upper", "NO", false],
      ["zero", "0", false],
      ["empty", "", false],
      ["invalid", "maybe", false],
    ] as const;
    const targetKeys = [...aliases.map(([key]) => `pharmacy-${key}`), "pharmacy-review-yes"];
    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: [
        {
          candidateKey: "doctor-boolean-source",
          entityType: "doctor",
          candidateStatus: "approved",
          candidatePayload: {
            geo: { area: "Al Khuwair", governorate: "Muscat" },
            relations: {
              local_suggestions: [
                ...aliases.map(([key, value]) => ({
                  target_family: "pharmacy",
                  target_key: `pharmacy-${key}`,
                  target_name: `Boolean Alias ${key}`,
                  target_area: "Al Khuwair",
                  target_governorate: "Muscat",
                  public_visible: value,
                  confidence: "high",
                  source_name: "Oman Ministry of Health directory",
                  last_checked_at: "2026-07-05",
                  relation_status: "active",
                })),
                {
                  target_family: "pharmacy",
                  target_key: "pharmacy-review-yes",
                  target_name: "Boolean Review Pharmacy",
                  target_area: "Al Khuwair",
                  target_governorate: "Muscat",
                  public_visible: "yes",
                  requires_review: "YES",
                  confidence: "high",
                  source_name: "Oman Ministry of Health directory",
                  last_checked_at: "2026-07-05",
                  relation_status: "active",
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

    for (const [key, , expected] of aliases) {
      expect(rowsByTargetKey.get(`pharmacy-${key}`)?.publicVisible).toBe(expected);
    }
    expect(rowsByTargetKey.get("pharmacy-review-yes")?.publicVisible).toBe(true);
    expect(rowsByTargetKey.get("pharmacy-review-yes")?.requiresReview).toBe(true);

    const summary = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });

    expect(summary.publicVisibleCount).toBe(5);
    expect(summary.privateReviewCount).toBe(7);
    expect(summary.unsafePublicCount).toBe(1);
    expect(summary.unsafePublicBlockers.map((blocker) => blocker.reason)).toEqual(["ambiguous_review_required"]);
  });
});
