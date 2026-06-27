export type ImportBatchDryRunFamily = "doctor" | "pharmacy" | "hospital";

export type ImportBatchDryRunDecision = "go" | "no_go";

export type ImportBatchDryRunCheckKey =
  | "ci_green"
  | "seo_check_green"
  | "readiness_audit_zero_blockers"
  | "sitemap_diff_frozen"
  | "representative_profile_smoke_passed"
  | "blocked_route_classes_absent";

export type ImportBatchDryRunBlockerReason =
  | "canonical_unsafe"
  | "source_missing"
  | "contact_or_map_missing"
  | "geo_missing"
  | "candidate_missing"
  | "candidate_not_approved"
  | "candidate_type_mismatch"
  | "queue_not_index_eligible"
  | "sitemap_not_included"
  | "robots_not_index"
  | "sitemap_cap_exceeded"
  | "unexpected_route_class"
  | "representative_smoke_failed";

export type ImportBatchDryRunReportSchemaVersion = "drkhaleej.import.batchDryRun.v1";

export type ImportBatchDryRunCaps = Record<ImportBatchDryRunFamily, number>;

export type ImportBatchDryRunCheck = {
  key: ImportBatchDryRunCheckKey;
  passed: boolean;
  notes: string | null;
};

export type ImportBatchDryRunBlocker = {
  family: ImportBatchDryRunFamily;
  reason: ImportBatchDryRunBlockerReason;
  queueId: string | null;
  candidateId: string | null;
  canonicalPath: string | null;
  notes: string | null;
};

export type ImportBatchDryRunSample = {
  family: ImportBatchDryRunFamily;
  locale: "en" | "ar";
  canonicalPath: string;
  renderedName: string | null;
  hasLocationEvidence: boolean;
  hasSourceEvidence: boolean;
  hasContactOrMapEvidence: boolean;
  hasCanonical: boolean;
  hasLocaleAlternates: boolean;
  passed: boolean;
  notes: string | null;
};

export type ImportBatchDryRunFamilySummary = {
  selectedCount: number;
  eligibleCount: number;
  blockedCount: number;
  sitemapUrlCount: number;
  sampledUrlCount: number;
  blockers: readonly ImportBatchDryRunBlocker[];
  samples: readonly ImportBatchDryRunSample[];
};

export type ImportBatchDryRunSitemapSummary = {
  beforeUrlCount: number;
  afterUrlCount: number;
  importedDeltaCount: number;
  unexpectedUrlCount: number;
  unexpectedUrls: readonly string[];
};

export type ImportBatchDryRunReport = {
  schemaVersion: ImportBatchDryRunReportSchemaVersion;
  rehearsalId: string;
  generatedAt: string;
  commitSha: string | null;
  decision: ImportBatchDryRunDecision;
  caps: ImportBatchDryRunCaps;
  checks: readonly ImportBatchDryRunCheck[];
  sitemap: ImportBatchDryRunSitemapSummary;
  byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>;
  notes: readonly string[];
};

export const importBatchDryRunSchemaVersion: ImportBatchDryRunReportSchemaVersion =
  "drkhaleej.import.batchDryRun.v1";

export const firstImportBatchDryRunCaps = {
  doctor: 50,
  pharmacy: 25,
  hospital: 10,
} as const satisfies ImportBatchDryRunCaps;

export const importBatchDryRunRequiredChecks: readonly ImportBatchDryRunCheckKey[] = [
  "ci_green",
  "seo_check_green",
  "readiness_audit_zero_blockers",
  "sitemap_diff_frozen",
  "representative_profile_smoke_passed",
  "blocked_route_classes_absent",
];

export function emptyImportBatchDryRunFamilySummary(): ImportBatchDryRunFamilySummary {
  return {
    selectedCount: 0,
    eligibleCount: 0,
    blockedCount: 0,
    sitemapUrlCount: 0,
    sampledUrlCount: 0,
    blockers: [],
    samples: [],
  };
}

export function createEmptyImportBatchDryRunReport(input: {
  rehearsalId: string;
  generatedAt: string;
  commitSha?: string | null;
  notes?: readonly string[];
}): ImportBatchDryRunReport {
  return {
    schemaVersion: importBatchDryRunSchemaVersion,
    rehearsalId: input.rehearsalId,
    generatedAt: input.generatedAt,
    commitSha: input.commitSha ?? null,
    decision: "no_go",
    caps: firstImportBatchDryRunCaps,
    checks: importBatchDryRunRequiredChecks.map((key) => ({ key, passed: false, notes: null })),
    sitemap: {
      beforeUrlCount: 0,
      afterUrlCount: 0,
      importedDeltaCount: 0,
      unexpectedUrlCount: 0,
      unexpectedUrls: [],
    },
    byFamily: {
      doctor: emptyImportBatchDryRunFamilySummary(),
      pharmacy: emptyImportBatchDryRunFamilySummary(),
      hospital: emptyImportBatchDryRunFamilySummary(),
    },
    notes: input.notes ?? [],
  };
}
