import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildFirstBatchDryRunReport } from "../../src/server/admin/import-first-batch-dry-run-bridge";
import type { ImportFirstBatchSelection } from "../../src/server/admin/import-first-batch-selection";

const root = process.cwd();
const inputPath = "fixtures/import/first-batch-dry-run.input.json";

const input = JSON.parse(await readFile(path.join(root, inputPath), "utf8")) as {
  selection: ImportFirstBatchSelection;
  checks: Parameters<typeof buildFirstBatchDryRunReport>[0]["checks"];
  sitemap: Parameters<typeof buildFirstBatchDryRunReport>[0]["sitemap"];
  hospitalRelations: Parameters<typeof buildFirstBatchDryRunReport>[0]["hospitalRelationRows"];
  localSuggestions: Parameters<typeof buildFirstBatchDryRunReport>[0]["localSuggestionRows"];
  notes: readonly string[];
};

const report = buildFirstBatchDryRunReport({
  selection: input.selection,
  generatedAt: input.selection.generatedAt,
  commitSha: null,
  checks: input.checks,
  sitemap: input.sitemap,
  hospitalRelationRows: input.hospitalRelations,
  localSuggestionRows: input.localSuggestions,
  notes: input.notes,
});

if (report.schemaVersion !== "drkhaleej.import.batchDryRun.v1") {
  throw new Error("Unexpected dry-run report schema version.");
}

if (report.rehearsalId !== input.selection.selectionId) {
  throw new Error("Dry-run bridge did not preserve the first-batch selection id.");
}

if (!report.byFamily.hospital || report.byFamily.hospital.selectedCount < 1) {
  throw new Error("Dry-run bridge smoke must include selected hospital rows without publishing them.");
}

if (report.decision !== "no_go") {
  throw new Error("Dry-run bridge smoke must remain no_go while imported hospitals are held.");
}

console.log("first batch dry-run bridge smoke passed.");
