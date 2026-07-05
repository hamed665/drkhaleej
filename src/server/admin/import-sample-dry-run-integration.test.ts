import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildImportBatchDryRunPayloadExtraction, type ImportBatchDryRunTransformedCandidate } from "./import-batch-dry-run-payload-adapter";
import {
  buildImportBatchDryRunHospitalRelationSummary,
  buildImportBatchDryRunLocalSuggestionSummary,
  buildImportBatchDryRunReport,
  emptyImportBatchDryRunFamilySummary,
  importBatchDryRunRequiredChecks,
  type ImportBatchDryRunCheck,
  type ImportBatchDryRunFamily,
  type ImportBatchDryRunFamilySummary,
} from "./import-batch-dry-run-report";

type CsvRow = Record<string, string>;

function parseCsv(source: string): CsvRow[] {
  const lines = source.trim().split(/\r?\n/);
  const headerLine = lines.shift();
  if (headerLine === undefined) throw new Error("CSV sample must include a header row.");
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function value(row: CsvRow, key: string): string {
  return row[key] ?? "";
}

function boolValue(row: CsvRow, key: string): boolean {
  return value(row, key).trim().toLowerCase() === "true";
}

function checkRows(): readonly ImportBatchDryRunCheck[] {
  return importBatchDryRunRequiredChecks.map((key) => ({ key, passed: true, notes: null }));
}

function familySummary(selectedCount: number): ImportBatchDryRunFamilySummary {
  return {
    ...emptyImportBatchDryRunFamilySummary(),
    selectedCount,
    eligibleCount: selectedCount,
  };
}

function countFamily(rows: readonly CsvRow[], family: ImportBatchDryRunFamily): number {
  return rows.filter((row) => value(row, "row_type") === "candidate" && value(row, "family") === family && value(row, "qa_status") === "selected").length;
}

function relationPayload(row: CsvRow): Record<string, unknown> {
  return {
    source_family: value(row, "source_family"),
    source_key: value(row, "source_key"),
    source_area: value(row, "source_area"),
    source_governorate: value(row, "source_governorate"),
    target_family: value(row, "target_family"),
    target_key: value(row, "target_key"),
    target_name: value(row, "target_name"),
    target_area: value(row, "target_area"),
    target_governorate: value(row, "target_governorate"),
    source_name: value(row, "source_name"),
    source_url: value(row, "source_url"),
    last_checked_at: value(row, "last_checked_at"),
    public_visible: boolValue(row, "public_visible"),
    confidence: value(row, "confidence"),
    relation_status: value(row, "relation_status"),
    requires_review: boolValue(row, "requires_review"),
    notes: value(row, "notes"),
  };
}

function transformedCandidates(rows: readonly CsvRow[]): readonly ImportBatchDryRunTransformedCandidate[] {
  return rows
    .filter((row) => value(row, "row_type") === "candidate")
    .map((candidate) =>
      ({
        candidateKey: value(candidate, "candidate_key"),
        entityType: value(candidate, "family"),
        candidateStatus: "approved",
        candidatePayload: {
          geo: {
            area: value(candidate, "area"),
            governorate: value(candidate, "governorate"),
          },
          relations: {
            local_suggestions: rows
              .filter((row) => value(row, "row_type") === "local_suggestion" && value(row, "source_key") === value(candidate, "candidate_key"))
              .map(relationPayload),
          },
        },
      }) satisfies ImportBatchDryRunTransformedCandidate,
    );
}

describe("first-batch sample dry-run integration", () => {
  it("builds a no_go report from the sample CSV", () => {
    const samplePath = path.join(process.cwd(), "docs/import/examples/first-batch-import-template.sample.csv");
    const rows = parseCsv(readFileSync(samplePath, "utf8"));
    const extraction = buildImportBatchDryRunPayloadExtraction({
      candidates: transformedCandidates(rows),
    });
    const hospitalRelations = buildImportBatchDryRunHospitalRelationSummary({
      rows: extraction.hospitalRelationRows,
      candidateHospitalKeys: extraction.candidateHospitalKeys,
    });
    const localSuggestions = buildImportBatchDryRunLocalSuggestionSummary({
      rows: extraction.localSuggestionRows,
      candidateKeys: extraction.localSuggestionCandidateKeys,
    });
    const report = buildImportBatchDryRunReport({
      rehearsalId: "first-batch-sample-csv",
      generatedAt: "2026-07-05T00:00:00.000Z",
      commitSha: "sample-integration",
      checks: checkRows(),
      sitemap: {
        beforeUrlCount: 0,
        afterUrlCount: 0,
        importedDeltaCount: 0,
        unexpectedUrlCount: 0,
        unexpectedUrls: [],
      },
      byFamily: {
        doctor: familySummary(countFamily(rows, "doctor")),
        pharmacy: familySummary(countFamily(rows, "pharmacy")),
        hospital: familySummary(countFamily(rows, "hospital")),
      },
      hospitalRelations,
      localSuggestions,
      notes: ["Sample CSV integration test only; no import or publish side effects."],
    });
    const localBlockerReasons = localSuggestions.unsafePublicBlockers.map((blocker) => blocker.reason);

    expect(extraction.localSuggestionRows).toHaveLength(4);
    expect(localSuggestions.publicVisibleCount).toBe(2);
    expect(localSuggestions.unsafePublicCount).toBe(2);
    expect(report.decision).toBe("no_go");
    expect(localBlockerReasons).toContain("location_mismatch");
    expect(localBlockerReasons).toContain("unsupported_family");
  });
});
