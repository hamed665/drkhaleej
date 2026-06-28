export type ImportFirstBatchFamily = "doctor" | "pharmacy" | "hospital";

export type ImportFirstBatchLocale = "en" | "ar";

export type ImportFirstBatchStatus = "selected" | "held" | "removed";

export type ImportFirstBatchSchemaVersion = "drkhaleej.import.firstBatchSelection.v1";

export type ImportFirstBatchCaps = Record<ImportFirstBatchFamily, number>;

export type ImportFirstBatchRow = {
  family: ImportFirstBatchFamily;
  queueId: string;
  candidateId: string;
  canonicalPath: string;
  locale: ImportFirstBatchLocale;
  slug: string;
  displayName: string;
  area: string;
  governorate: string;
  sourceName: string;
  sourceUrl: string | null;
  lastCheckedAt: string;
  contactOrMapSignal: string;
  qaOwner: string;
  qaStatus: ImportFirstBatchStatus;
  qaNotes: string | null;
};

export type ImportFirstBatchSelection = {
  schemaVersion: ImportFirstBatchSchemaVersion;
  selectionId: string;
  generatedAt: string;
  caps: ImportFirstBatchCaps;
  rows: readonly ImportFirstBatchRow[];
};

export type ImportFirstBatchValidationIssue = {
  rowIndex: number | null;
  family: ImportFirstBatchFamily | null;
  reason: string;
};

export type ImportFirstBatchValidation = {
  valid: boolean;
  counts: ImportFirstBatchCaps;
  issues: readonly ImportFirstBatchValidationIssue[];
};

export const importFirstBatchSchemaVersion: ImportFirstBatchSchemaVersion =
  "drkhaleej.import.firstBatchSelection.v1";

export const firstBatchCaps = {
  doctor: 50,
  pharmacy: 25,
  hospital: 10,
} as const satisfies ImportFirstBatchCaps;

export const firstBatchFamilies: readonly ImportFirstBatchFamily[] = ["doctor", "pharmacy", "hospital"];

const safeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const safeCanonicalPatterns: Record<ImportFirstBatchFamily, RegExp> = {
  doctor: /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  pharmacy: /^\/(en|ar)\/om\/pharmacies\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hospital: /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

export function emptyFirstBatchCounts(): ImportFirstBatchCaps {
  return {
    doctor: 0,
    pharmacy: 0,
    hospital: 0,
  };
}

export function countSelectedFirstBatchRows(rows: readonly ImportFirstBatchRow[]): ImportFirstBatchCaps {
  const counts = emptyFirstBatchCounts();
  for (const row of rows) {
    if (row.qaStatus === "selected") counts[row.family] += 1;
  }
  return counts;
}

export function isFirstBatchWithinCaps(
  rows: readonly ImportFirstBatchRow[],
  caps: ImportFirstBatchCaps = firstBatchCaps,
): boolean {
  const counts = countSelectedFirstBatchRows(rows);
  return firstBatchFamilies.every((family) => counts[family] <= caps[family]);
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function addIssue(
  issues: ImportFirstBatchValidationIssue[],
  rowIndex: number | null,
  family: ImportFirstBatchFamily | null,
  reason: string,
): void {
  issues.push({ rowIndex, family, reason });
}

function rowCanonicalMatchesLocale(row: ImportFirstBatchRow): boolean {
  return row.canonicalPath.startsWith(`/${row.locale}/om/`);
}

function rowCanonicalMatchesSlug(row: ImportFirstBatchRow): boolean {
  return row.canonicalPath.endsWith(`/${row.slug}`);
}

export function validateFirstBatchSelection(
  selection: ImportFirstBatchSelection,
  caps: ImportFirstBatchCaps = firstBatchCaps,
): ImportFirstBatchValidation {
  const issues: ImportFirstBatchValidationIssue[] = [];
  const counts = countSelectedFirstBatchRows(selection.rows);

  if (selection.schemaVersion !== importFirstBatchSchemaVersion) addIssue(issues, null, null, "schema_version_invalid");
  if (!hasText(selection.selectionId)) addIssue(issues, null, null, "selection_id_missing");
  if (!hasText(selection.generatedAt)) addIssue(issues, null, null, "generated_at_missing");

  selection.rows.forEach((row, rowIndex) => {
    if (!hasText(row.queueId)) addIssue(issues, rowIndex, row.family, "queue_id_missing");
    if (!hasText(row.candidateId)) addIssue(issues, rowIndex, row.family, "candidate_id_missing");
    if (!hasText(row.displayName)) addIssue(issues, rowIndex, row.family, "display_name_missing");
    if (!hasText(row.area)) addIssue(issues, rowIndex, row.family, "area_missing");
    if (!hasText(row.governorate)) addIssue(issues, rowIndex, row.family, "governorate_missing");
    if (!hasText(row.sourceName)) addIssue(issues, rowIndex, row.family, "source_name_missing");
    if (!hasText(row.lastCheckedAt)) addIssue(issues, rowIndex, row.family, "last_checked_at_missing");
    if (!hasText(row.contactOrMapSignal)) addIssue(issues, rowIndex, row.family, "contact_or_map_signal_missing");
    if (!hasText(row.qaOwner)) addIssue(issues, rowIndex, row.family, "qa_owner_missing");
    if (!safeSlugPattern.test(row.slug)) addIssue(issues, rowIndex, row.family, "slug_unsafe");
    if (!safeCanonicalPatterns[row.family].test(row.canonicalPath)) {
      addIssue(issues, rowIndex, row.family, "canonical_path_unsafe");
    }
    if (!rowCanonicalMatchesLocale(row)) addIssue(issues, rowIndex, row.family, "canonical_locale_mismatch");
    if (!rowCanonicalMatchesSlug(row)) addIssue(issues, rowIndex, row.family, "canonical_slug_mismatch");
  });

  for (const family of firstBatchFamilies) {
    if (counts[family] > caps[family]) addIssue(issues, null, family, "family_cap_exceeded");
  }

  return {
    valid: issues.length === 0,
    counts,
    issues,
  };
}
