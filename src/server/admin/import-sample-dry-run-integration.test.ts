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

function boolValue(value: string): boolean {
  return value.trim().toLowerCase() === "true";
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
  return rows.filter((row) => row.row_type === "candidate" && row.family === family && row.qa_status === "selected").length;
}

function relationPayload(row: CsvRow): Record<string, unknown> {
  return {
    source_family: row.source_family,
    source_key: row.source_key,
    source_area: row.source_area,
    source_governorate: row.source_governorate,
    target_family: row.target_family,
    target_key: row.target_key,
    target_name: row.target_name,
    target_area: row.target_area,
    target_governorate: row.target_governorate,
    source_name: row.source_name,
    source_url: row.source_url,
    last_checked_at: row.last_checked_at,
    public_visible: boolValue(row.public_visible),
    confidence: row.confidence,
    relation_status: row.relation_status,
    requires_review: boolValue(row.requires_review),
    notes: row.notes,
  };
}

function transformedCandidates(rows: readonly CsvRow[]): readonly ImportBatchDryRunTransformedCandidate[] {
  return rows
    .filter((row) => row.row_type === "candidate")
    .map((candidate) => ({
      candidateKey: candidate.candidate_key,
      entityType: candidate.family,
      candidateStatus: "approved",
      candidatePayload: {
        geo: {
          area: candidate.area,
          governorate: candidate.governorate,
        },
        relations: {
          local_suggestions: rows
            .filter((row) => row.row_type === "local_suggestion" && row.source_key === candidate.candidate_key)
            .map(relationPayload),
        },
      },
    }));
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
