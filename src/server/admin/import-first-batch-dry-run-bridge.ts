import {
  buildImportBatchDryRunHospitalRelationSummary,
  buildImportBatchDryRunLocalSuggestionSummary,
  buildImportBatchDryRunReport,
  importBatchDryRunRequiredChecks,
  type ImportBatchDryRunBlocker,
  type ImportBatchDryRunBlockerReason,
  type ImportBatchDryRunCheck,
  type ImportBatchDryRunFamily,
  type ImportBatchDryRunFamilySummary,
  type ImportBatchDryRunHospitalRelationRow,
  type ImportBatchDryRunLocalSuggestionCandidateKeys,
  type ImportBatchDryRunLocalSuggestionRow,
  type ImportBatchDryRunReport,
  type ImportBatchDryRunSitemapSummary,
} from "./import-batch-dry-run-report";
import {
  firstBatchFamilies,
  firstBatchCaps,
  validateFirstBatchSelection,
  type ImportFirstBatchFamily,
  type ImportFirstBatchSelection,
  type ImportFirstBatchValidationIssue,
} from "./import-first-batch-selection";

export type BuildFirstBatchDryRunReportInput = {
  selection: ImportFirstBatchSelection;
  generatedAt: string;
  commitSha?: string | null;
  checks?: readonly ImportBatchDryRunCheck[];
  sitemap?: ImportBatchDryRunSitemapSummary;
  hospitalRelationRows?: readonly ImportBatchDryRunHospitalRelationRow[];
  candidateHospitalKeys?: readonly string[];
  localSuggestionRows?: readonly ImportBatchDryRunLocalSuggestionRow[];
  localSuggestionCandidateKeys?: ImportBatchDryRunLocalSuggestionCandidateKeys;
  notes?: readonly string[];
};

function defaultChecks(): readonly ImportBatchDryRunCheck[] {
  return importBatchDryRunRequiredChecks.map((key) => ({ key, passed: false, notes: null }));
}

function toDryRunFamily(family: ImportFirstBatchFamily): ImportBatchDryRunFamily {
  return family;
}

function selectedCandidateIds(selection: ImportFirstBatchSelection, family: ImportFirstBatchFamily): string[] {
  return selection.rows.filter((row) => row.family === family && row.qaStatus === "selected").map((row) => row.candidateId);
}

function defaultCandidateHospitalKeys(selection: ImportFirstBatchSelection): readonly string[] {
  return selectedCandidateIds(selection, "hospital");
}

function defaultLocalSuggestionCandidateKeys(selection: ImportFirstBatchSelection): ImportBatchDryRunLocalSuggestionCandidateKeys {
  return {
    doctor: selectedCandidateIds(selection, "doctor"),
    pharmacy: selectedCandidateIds(selection, "pharmacy"),
    hospital: selectedCandidateIds(selection, "hospital"),
    radiology: [],
    dentistry: [],
    beauty: [],
  };
}

function mergeLocalSuggestionCandidateKeys(
  selection: ImportFirstBatchSelection,
  candidateKeys?: ImportBatchDryRunLocalSuggestionCandidateKeys,
): ImportBatchDryRunLocalSuggestionCandidateKeys {
  return {
    ...defaultLocalSuggestionCandidateKeys(selection),
    ...(candidateKeys ?? {}),
  };
}

function mapSelectionIssueReason(reason: string): ImportBatchDryRunBlockerReason {
  if (reason.includes("canonical") || reason.includes("slug")) return "canonical_unsafe";
  if (reason.includes("source") || reason.includes("last_checked")) return "source_missing";
  if (reason.includes("contact_or_map")) return "contact_or_map_missing";
  if (reason.includes("area") || reason.includes("governorate")) return "geo_missing";
  if (reason.includes("candidate")) return "candidate_missing";
  if (reason.includes("queue")) return "queue_not_index_eligible";
  if (reason.includes("cap")) return "sitemap_cap_exceeded";
  return "unexpected_route_class";
}

function issueToBlocker(
  selection: ImportFirstBatchSelection,
  issue: ImportFirstBatchValidationIssue,
): ImportBatchDryRunBlocker {
  const row = issue.rowIndex === null ? null : selection.rows[issue.rowIndex] ?? null;
  const family = toDryRunFamily(issue.family ?? row?.family ?? "doctor");
  return {
    family,
    reason: mapSelectionIssueReason(issue.reason),
    queueId: row?.queueId ?? null,
    candidateId: row?.candidateId ?? null,
    canonicalPath: row?.canonicalPath ?? null,
    notes: issue.reason,
  };
}

function buildFamilySummary(
  selection: ImportFirstBatchSelection,
  family: ImportFirstBatchFamily,
  blockers: readonly ImportBatchDryRunBlocker[],
): ImportBatchDryRunFamilySummary {
  const selectedRows = selection.rows
    .map((row, rowIndex) => ({ row, rowIndex }))
    .filter(({ row }) => row.family === family && row.qaStatus === "selected");
  const blockerIndexes = new Set(
    selection.rows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => row.family === family)
      .filter(({ rowIndex }) => blockers.some((blocker) => blocker.queueId === selection.rows[rowIndex]?.queueId))
      .map(({ rowIndex }) => rowIndex),
  );
  return {
    selectedCount: selectedRows.length,
    eligibleCount: selectedRows.filter(({ rowIndex }) => !blockerIndexes.has(rowIndex)).length,
    blockedCount: blockers.length,
    sitemapUrlCount: selectedRows.length,
    sampledUrlCount: 0,
    blockers,
    samples: [],
  };
}

function defaultSitemapSummary(selection: ImportFirstBatchSelection): ImportBatchDryRunSitemapSummary {
  const selectedCount = selection.rows.filter((row) => row.qaStatus === "selected").length;
  return {
    beforeUrlCount: 0,
    afterUrlCount: selectedCount,
    importedDeltaCount: selectedCount,
    unexpectedUrlCount: 0,
    unexpectedUrls: [],
  };
}

export function buildFirstBatchDryRunReport(input: BuildFirstBatchDryRunReportInput): ImportBatchDryRunReport {
  const validation = validateFirstBatchSelection(input.selection, input.selection.caps ?? firstBatchCaps);
  const blockers = validation.issues.map((issue) => issueToBlocker(input.selection, issue));
  const byFamily = Object.fromEntries(
    firstBatchFamilies.map((family) => {
      const familyBlockers = blockers.filter((blocker) => blocker.family === family);
      return [family, buildFamilySummary(input.selection, family, familyBlockers)];
    }),
  ) as Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>;
  const hospitalRelations = buildImportBatchDryRunHospitalRelationSummary({
    rows: input.hospitalRelationRows ?? [],
    candidateHospitalKeys: input.candidateHospitalKeys ?? defaultCandidateHospitalKeys(input.selection),
  });
  const localSuggestions = buildImportBatchDryRunLocalSuggestionSummary({
    rows: input.localSuggestionRows ?? [],
    candidateKeys: mergeLocalSuggestionCandidateKeys(input.selection, input.localSuggestionCandidateKeys),
  });

  return buildImportBatchDryRunReport({
    rehearsalId: input.selection.selectionId,
    generatedAt: input.generatedAt,
    commitSha: input.commitSha ?? null,
    checks: input.checks ?? defaultChecks(),
    sitemap: input.sitemap ?? defaultSitemapSummary(input.selection),
    byFamily,
    hospitalRelations,
    localSuggestions,
    caps: input.selection.caps,
    notes: input.notes ?? [],
  });
}
