import { describe, expect, it } from "vitest";

import { importBatchDryRunRequiredChecks } from "./import-batch-dry-run-report";
import { buildFirstBatchDryRunReport } from "./import-first-batch-dry-run-bridge";
import {
  firstBatchCaps,
  importFirstBatchSchemaVersion,
  type ImportFirstBatchRow,
  type ImportFirstBatchSelection,
} from "./import-first-batch-selection";

const allPassedChecks = importBatchDryRunRequiredChecks.map((key) => ({
  key,
  passed: true,
  notes: null,
}));

const validRow: ImportFirstBatchRow = {
  family: "doctor",
  queueId: "queue-doctor-1",
  candidateId: "candidate-doctor-1",
  canonicalPath: "/en/om/doctor/amina-salim",
  locale: "en",
  slug: "amina-salim",
  displayName: "Amina Salim",
  area: "Muscat",
  governorate: "Muscat",
  sourceName: "clinic website",
  sourceUrl: "https://example.com/amina-salim",
  lastCheckedAt: "2026-06-28",
  contactOrMapSignal: "map",
  qaOwner: "import qa",
  qaStatus: "selected",
  qaNotes: null,
};

const validSelection: ImportFirstBatchSelection = {
  schemaVersion: importFirstBatchSchemaVersion,
  selectionId: "first-batch-test",
  generatedAt: "2026-06-28T00:00:00.000Z",
  caps: firstBatchCaps,
  rows: [validRow],
};

describe("buildFirstBatchDryRunReport", () => {
  it("returns go for a valid selected first batch row when required checks pass", () => {
    const report = buildFirstBatchDryRunReport({
      selection: validSelection,
      generatedAt: "2026-06-28T00:00:00.000Z",
      checks: allPassedChecks,
    });

    expect(report.decision).toBe("go");
    expect(report.byFamily.doctor.selectedCount).toBe(1);
    expect(report.byFamily.doctor.blockedCount).toBe(0);
    expect(report.sitemap.importedDeltaCount).toBe(1);
  });

  it("maps missing source evidence into a dry-run blocker", () => {
    const report = buildFirstBatchDryRunReport({
      selection: {
        ...validSelection,
        rows: [
          {
            ...validRow,
            sourceName: "",
          },
        ],
      },
      generatedAt: "2026-06-28T00:00:00.000Z",
      checks: allPassedChecks,
    });

    expect(report.decision).toBe("no_go");
    expect(report.byFamily.doctor.blockers.map((blocker) => blocker.reason)).toContain("source_missing");
  });
});
