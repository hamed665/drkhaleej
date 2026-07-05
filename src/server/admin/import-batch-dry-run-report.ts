export type ImportBatchDryRunFamily = "doctor" | "pharmacy" | "hospital";

export type ImportBatchDryRunLocalSuggestionFamily =
  | ImportBatchDryRunFamily
  | "radiology"
  | "dentistry"
  | "beauty";

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

export type ImportBatchDryRunHospitalRelationBlockerReason =
  | "branch_not_verified"
  | "source_missing"
  | "last_checked_missing"
  | "confidence_unsupported"
  | "doctor_name_missing"
  | "hospital_mismatch"
  | "ambiguous_review_required";

export type ImportBatchDryRunLocalSuggestionBlockerReason =
  | "source_candidate_missing"
  | "target_candidate_missing"
  | "target_name_missing"
  | "location_mismatch"
  | "source_missing"
  | "last_checked_missing"
  | "confidence_unsupported"
  | "same_entity_self_link"
  | "unsupported_family"
  | "ambiguous_review_required";

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

export type ImportBatchDryRunHospitalRelationBlocker = {
  reason: ImportBatchDryRunHospitalRelationBlockerReason;
  hospitalKey: string | null;
  doctorKey: string | null;
  doctorName: string | null;
  sourceUrl: string | null;
  notes: string | null;
};

export type ImportBatchDryRunLocalSuggestionBlocker = {
  reason: ImportBatchDryRunLocalSuggestionBlockerReason;
  sourceFamily: string | null;
  sourceKey: string | null;
  sourceArea: string | null;
  sourceGovernorate: string | null;
  targetFamily: string | null;
  targetKey: string | null;
  targetArea: string | null;
  targetGovernorate: string | null;
  targetName: string | null;
  sourceUrl: string | null;
  notes: string | null;
};

export type ImportBatchDryRunHospitalRelationRow = {
  hospitalKey: string | null;
  doctorKey: string | null;
  doctorName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  confidence: string | null;
  branchVerified: boolean;
  publicVisible: boolean;
  relationStatus?: string | null;
  requiresReview?: boolean;
  notes?: string | null;
};

export type ImportBatchDryRunLocalSuggestionRow = {
  sourceFamily: ImportBatchDryRunLocalSuggestionFamily;
  sourceKey: string | null;
  sourceArea: string | null;
  sourceGovernorate: string | null;
  targetFamily: ImportBatchDryRunLocalSuggestionFamily;
  targetKey: string | null;
  targetArea: string | null;
  targetGovernorate: string | null;
  targetName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  confidence: string | null;
  publicVisible: boolean;
  relationStatus?: string | null;
  requiresReview?: boolean;
  notes?: string | null;
};

export type ImportBatchDryRunLocalSuggestionCandidateKeys = Partial<
  Record<ImportBatchDryRunLocalSuggestionFamily, readonly string[]>
>;

export type BuildImportBatchDryRunHospitalRelationSummaryInput = {
  rows: readonly ImportBatchDryRunHospitalRelationRow[];
  candidateHospitalKeys: readonly string[];
};

export type BuildImportBatchDryRunLocalSuggestionSummaryInput = {
  rows: readonly ImportBatchDryRunLocalSuggestionRow[];
  candidateKeys?: ImportBatchDryRunLocalSuggestionCandidateKeys;
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

export type ImportBatchDryRunHospitalRelationSummary = {
  totalRows: number;
  candidateHospitalCount: number;
  publicVisibleCount: number;
  blockedFromPublicCount: number;
  privateReviewCount: number;
  hospitalSuggestionCount: number;
  unsafePublicCount: number;
  unsafePublicBlockers: readonly ImportBatchDryRunHospitalRelationBlocker[];
  blockedFromPublicReasons: readonly ImportBatchDryRunHospitalRelationBlocker[];
};

export type ImportBatchDryRunLocalSuggestionSummary = {
  totalRows: number;
  publicVisibleCount: number;
  blockedFromPublicCount: number;
  privateReviewCount: number;
  sourceEntitySuggestionCount: number;
  locationClusterCount: number;
  unsafePublicCount: number;
  unsafePublicBlockers: readonly ImportBatchDryRunLocalSuggestionBlocker[];
  blockedFromPublicReasons: readonly ImportBatchDryRunLocalSuggestionBlocker[];
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
  hospitalRelations: ImportBatchDryRunHospitalRelationSummary;
  localSuggestions: ImportBatchDryRunLocalSuggestionSummary;
  notes: readonly string[];
};

export type BuildImportBatchDryRunReportInput = {
  rehearsalId: string;
  generatedAt: string;
  commitSha?: string | null;
  checks: readonly ImportBatchDryRunCheck[];
  sitemap: ImportBatchDryRunSitemapSummary;
  byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>;
  hospitalRelations?: ImportBatchDryRunHospitalRelationSummary;
  localSuggestions?: ImportBatchDryRunLocalSuggestionSummary;
  caps?: ImportBatchDryRunCaps;
  notes?: readonly string[];
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

const importBatchDryRunFamilies: readonly ImportBatchDryRunFamily[] = ["doctor", "pharmacy", "hospital"];

const importBatchDryRunLocalSuggestionFamilies: readonly ImportBatchDryRunLocalSuggestionFamily[] = [
  "doctor",
  "pharmacy",
  "hospital",
  "radiology",
  "dentistry",
  "beauty",
];

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function cleanKeySet(values: readonly string[]): Set<string> {
  const result = new Set<string>();
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) result.add(cleaned);
  }
  return result;
}

function cleanLocalSuggestionFamily(value: string | null | undefined): ImportBatchDryRunLocalSuggestionFamily | null {
  const cleaned = cleanText(value);
  if (cleaned === null) return null;
  return importBatchDryRunLocalSuggestionFamilies.includes(cleaned as ImportBatchDryRunLocalSuggestionFamily)
    ? (cleaned as ImportBatchDryRunLocalSuggestionFamily)
    : null;
}

function cleanLocalSuggestionCandidateKeyMap(
  values: ImportBatchDryRunLocalSuggestionCandidateKeys = {},
): Map<ImportBatchDryRunLocalSuggestionFamily, Set<string>> {
  const result = new Map<ImportBatchDryRunLocalSuggestionFamily, Set<string>>();
  for (const family of importBatchDryRunLocalSuggestionFamilies) {
    result.set(family, cleanKeySet(values[family] ?? []));
  }
  return result;
}

function normalizeLocationPart(value: string | null | undefined): string | null {
  return cleanText(value)?.toLowerCase() ?? null;
}

function isSupportedHospitalRelationConfidence(confidence: string | null): boolean {
  return confidence === "high" || confidence === "medium";
}

function isSupportedLocalSuggestionConfidence(confidence: string | null): boolean {
  return isSupportedHospitalRelationConfidence(confidence);
}

function needsHospitalRelationReview(row: ImportBatchDryRunHospitalRelationRow): boolean {
  const relationStatus = cleanText(row.relationStatus);
  return row.requiresReview === true || (relationStatus !== null && relationStatus !== "active" && relationStatus !== "approved");
}

function needsLocalSuggestionReview(row: ImportBatchDryRunLocalSuggestionRow): boolean {
  const relationStatus = cleanText(row.relationStatus);
  return row.requiresReview === true || (relationStatus !== null && relationStatus !== "active" && relationStatus !== "approved");
}

function hospitalRelationBlocker(
  row: ImportBatchDryRunHospitalRelationRow,
  reason: ImportBatchDryRunHospitalRelationBlockerReason,
  notes: string,
): ImportBatchDryRunHospitalRelationBlocker {
  return {
    reason,
    hospitalKey: cleanText(row.hospitalKey),
    doctorKey: cleanText(row.doctorKey),
    doctorName: cleanText(row.doctorName),
    sourceUrl: cleanText(row.sourceUrl),
    notes,
  };
}

function localSuggestionBlocker(
  row: ImportBatchDryRunLocalSuggestionRow,
  reason: ImportBatchDryRunLocalSuggestionBlockerReason,
  notes: string,
): ImportBatchDryRunLocalSuggestionBlocker {
  return {
    reason,
    sourceFamily: cleanText(row.sourceFamily),
    sourceKey: cleanText(row.sourceKey),
    sourceArea: cleanText(row.sourceArea),
    sourceGovernorate: cleanText(row.sourceGovernorate),
    targetFamily: cleanText(row.targetFamily),
    targetKey: cleanText(row.targetKey),
    targetArea: cleanText(row.targetArea),
    targetGovernorate: cleanText(row.targetGovernorate),
    targetName: cleanText(row.targetName),
    sourceUrl: cleanText(row.sourceUrl),
    notes,
  };
}

function hospitalRelationBlockers(
  row: ImportBatchDryRunHospitalRelationRow,
  candidateHospitalKeys: Set<string>,
): ImportBatchDryRunHospitalRelationBlocker[] {
  const blockers: ImportBatchDryRunHospitalRelationBlocker[] = [];
  const hospitalKey = cleanText(row.hospitalKey);

  if (hospitalKey === null || !candidateHospitalKeys.has(hospitalKey)) {
    blockers.push(hospitalRelationBlocker(row, "hospital_mismatch", "Relation hospital key does not match the dry-run hospital candidates."));
  }
  if (cleanText(row.doctorName) === null) {
    blockers.push(hospitalRelationBlocker(row, "doctor_name_missing", "Doctor display name is required before public suggestion."));
  }
  if (row.branchVerified !== true) {
    blockers.push(hospitalRelationBlocker(row, "branch_not_verified", "Hospital branch relationship is not verified."));
  }
  if (cleanText(row.sourceUrl) === null) {
    blockers.push(hospitalRelationBlocker(row, "source_missing", "Relation source URL is required before public suggestion."));
  }
  if (cleanText(row.lastCheckedAt) === null) {
    blockers.push(hospitalRelationBlocker(row, "last_checked_missing", "Relation last checked date is required before public suggestion."));
  }
  if (!isSupportedHospitalRelationConfidence(cleanText(row.confidence))) {
    blockers.push(hospitalRelationBlocker(row, "confidence_unsupported", "Relation confidence must be high or medium before public suggestion."));
  }
  if (needsHospitalRelationReview(row)) {
    blockers.push(hospitalRelationBlocker(row, "ambiguous_review_required", "Relation is marked for review or has an unsupported status."));
  }

  return blockers;
}

function localSuggestionBlockers(
  row: ImportBatchDryRunLocalSuggestionRow,
  candidateKeys: Map<ImportBatchDryRunLocalSuggestionFamily, Set<string>>,
): ImportBatchDryRunLocalSuggestionBlocker[] {
  const blockers: ImportBatchDryRunLocalSuggestionBlocker[] = [];
  const sourceFamily = cleanLocalSuggestionFamily(row.sourceFamily);
  const targetFamily = cleanLocalSuggestionFamily(row.targetFamily);
  const sourceKey = cleanText(row.sourceKey);
  const targetKey = cleanText(row.targetKey);
  const sourceArea = normalizeLocationPart(row.sourceArea);
  const sourceGovernorate = normalizeLocationPart(row.sourceGovernorate);
  const targetArea = normalizeLocationPart(row.targetArea);
  const targetGovernorate = normalizeLocationPart(row.targetGovernorate);

  if (sourceFamily === null || targetFamily === null) {
    blockers.push(localSuggestionBlocker(row, "unsupported_family", "Local suggestion family must be supported before public display."));
  }
  if (sourceKey === null || (sourceFamily !== null && !(candidateKeys.get(sourceFamily)?.has(sourceKey) ?? false))) {
    blockers.push(localSuggestionBlocker(row, "source_candidate_missing", "Source entity must exist in the dry-run candidate key map."));
  }
  if (targetKey === null || (targetFamily !== null && !(candidateKeys.get(targetFamily)?.has(targetKey) ?? false))) {
    blockers.push(localSuggestionBlocker(row, "target_candidate_missing", "Target entity must exist in the dry-run candidate key map."));
  }
  if (sourceFamily !== null && targetFamily !== null && sourceFamily === targetFamily && sourceKey !== null && targetKey !== null && sourceKey === targetKey) {
    blockers.push(localSuggestionBlocker(row, "same_entity_self_link", "Local suggestion must not point an entity page back to itself."));
  }
  if (cleanText(row.targetName) === null) {
    blockers.push(localSuggestionBlocker(row, "target_name_missing", "Target display name is required before public local suggestion."));
  }
  if (
    sourceArea === null ||
    sourceGovernorate === null ||
    targetArea === null ||
    targetGovernorate === null ||
    sourceArea !== targetArea ||
    sourceGovernorate !== targetGovernorate
  ) {
    blockers.push(localSuggestionBlocker(row, "location_mismatch", "Source and target must share the same area and governorate before public local suggestion."));
  }
  if (cleanText(row.sourceUrl) === null) {
    blockers.push(localSuggestionBlocker(row, "source_missing", "Local suggestion source URL is required before public display."));
  }
  if (cleanText(row.lastCheckedAt) === null) {
    blockers.push(localSuggestionBlocker(row, "last_checked_missing", "Local suggestion last checked date is required before public display."));
  }
  if (!isSupportedLocalSuggestionConfidence(cleanText(row.confidence))) {
    blockers.push(localSuggestionBlocker(row, "confidence_unsupported", "Local suggestion confidence must be high or medium before public display."));
  }
  if (needsLocalSuggestionReview(row)) {
    blockers.push(localSuggestionBlocker(row, "ambiguous_review_required", "Local suggestion is marked for review or has an unsupported status."));
  }

  return blockers;
}

function localSuggestionSourceEntityKey(row: ImportBatchDryRunLocalSuggestionRow): string | null {
  const sourceFamily = cleanLocalSuggestionFamily(row.sourceFamily);
  const sourceKey = cleanText(row.sourceKey);
  return sourceFamily !== null && sourceKey !== null ? `${sourceFamily}:${sourceKey}` : null;
}

function localSuggestionLocationKey(row: ImportBatchDryRunLocalSuggestionRow): string | null {
  const area = normalizeLocationPart(row.sourceArea);
  const governorate = normalizeLocationPart(row.sourceGovernorate);
  return area !== null && governorate !== null ? `${governorate}:${area}` : null;
}

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

export function emptyImportBatchDryRunHospitalRelationSummary(): ImportBatchDryRunHospitalRelationSummary {
  return {
    totalRows: 0,
    candidateHospitalCount: 0,
    publicVisibleCount: 0,
    blockedFromPublicCount: 0,
    privateReviewCount: 0,
    hospitalSuggestionCount: 0,
    unsafePublicCount: 0,
    unsafePublicBlockers: [],
    blockedFromPublicReasons: [],
  };
}

export function emptyImportBatchDryRunLocalSuggestionSummary(): ImportBatchDryRunLocalSuggestionSummary {
  return {
    totalRows: 0,
    publicVisibleCount: 0,
    blockedFromPublicCount: 0,
    privateReviewCount: 0,
    sourceEntitySuggestionCount: 0,
    locationClusterCount: 0,
    unsafePublicCount: 0,
    unsafePublicBlockers: [],
    blockedFromPublicReasons: [],
  };
}

export function buildImportBatchDryRunHospitalRelationSummary(
  input: BuildImportBatchDryRunHospitalRelationSummaryInput,
): ImportBatchDryRunHospitalRelationSummary {
  const candidateHospitalKeys = cleanKeySet(input.candidateHospitalKeys);
  const candidateHospitalsWithRows = new Set<string>();
  const hospitalsWithPublicSuggestions = new Set<string>();
  const unsafePublicBlockers: ImportBatchDryRunHospitalRelationBlocker[] = [];
  const blockedFromPublicReasons: ImportBatchDryRunHospitalRelationBlocker[] = [];
  let publicVisibleCount = 0;
  let blockedFromPublicCount = 0;
  let privateReviewCount = 0;
  let unsafePublicCount = 0;

  for (const row of input.rows) {
    const hospitalKey = cleanText(row.hospitalKey);
    if (hospitalKey !== null && candidateHospitalKeys.has(hospitalKey)) {
      candidateHospitalsWithRows.add(hospitalKey);
    }

    const blockers = hospitalRelationBlockers(row, candidateHospitalKeys);
    const safeForPublic = blockers.length === 0;

    if (row.publicVisible && safeForPublic) {
      publicVisibleCount += 1;
      if (hospitalKey !== null) hospitalsWithPublicSuggestions.add(hospitalKey);
      continue;
    }

    if (row.publicVisible && !safeForPublic) {
      unsafePublicCount += 1;
      unsafePublicBlockers.push(...blockers);
      continue;
    }

    if (!row.publicVisible && safeForPublic) {
      privateReviewCount += 1;
      continue;
    }

    blockedFromPublicCount += 1;
    blockedFromPublicReasons.push(...blockers);
  }

  return {
    totalRows: input.rows.length,
    candidateHospitalCount: candidateHospitalsWithRows.size,
    publicVisibleCount,
    blockedFromPublicCount,
    privateReviewCount,
    hospitalSuggestionCount: hospitalsWithPublicSuggestions.size,
    unsafePublicCount,
    unsafePublicBlockers,
    blockedFromPublicReasons,
  };
}

export function buildImportBatchDryRunLocalSuggestionSummary(
  input: BuildImportBatchDryRunLocalSuggestionSummaryInput,
): ImportBatchDryRunLocalSuggestionSummary {
  const candidateKeys = cleanLocalSuggestionCandidateKeyMap(input.candidateKeys ?? {});
  const sourceEntitiesWithPublicSuggestions = new Set<string>();
  const publicLocationClusters = new Set<string>();
  const unsafePublicBlockers: ImportBatchDryRunLocalSuggestionBlocker[] = [];
  const blockedFromPublicReasons: ImportBatchDryRunLocalSuggestionBlocker[] = [];
  let publicVisibleCount = 0;
  let blockedFromPublicCount = 0;
  let privateReviewCount = 0;
  let unsafePublicCount = 0;

  for (const row of input.rows) {
    const blockers = localSuggestionBlockers(row, candidateKeys);
    const safeForPublic = blockers.length === 0;

    if (row.publicVisible && safeForPublic) {
      publicVisibleCount += 1;
      const sourceEntityKey = localSuggestionSourceEntityKey(row);
      const locationKey = localSuggestionLocationKey(row);
      if (sourceEntityKey !== null) sourceEntitiesWithPublicSuggestions.add(sourceEntityKey);
      if (locationKey !== null) publicLocationClusters.add(locationKey);
      continue;
    }

    if (row.publicVisible && !safeForPublic) {
      unsafePublicCount += 1;
      unsafePublicBlockers.push(...blockers);
      continue;
    }

    if (!row.publicVisible && safeForPublic) {
      privateReviewCount += 1;
      continue;
    }

    blockedFromPublicCount += 1;
    blockedFromPublicReasons.push(...blockers);
  }

  return {
    totalRows: input.rows.length,
    publicVisibleCount,
    blockedFromPublicCount,
    privateReviewCount,
    sourceEntitySuggestionCount: sourceEntitiesWithPublicSuggestions.size,
    locationClusterCount: publicLocationClusters.size,
    unsafePublicCount,
    unsafePublicBlockers,
    blockedFromPublicReasons,
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
    hospitalRelations: emptyImportBatchDryRunHospitalRelationSummary(),
    localSuggestions: emptyImportBatchDryRunLocalSuggestionSummary(),
    notes: input.notes ?? [],
  };
}

function hasAllRequiredChecks(checks: readonly ImportBatchDryRunCheck[]): boolean {
  return importBatchDryRunRequiredChecks.every((key) => checks.some((check) => check.key === key && check.passed));
}

function familyWithinCaps(
  byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>,
  caps: ImportBatchDryRunCaps,
): boolean {
  return importBatchDryRunFamilies.every((family) => {
    const summary = byFamily[family];
    return summary.selectedCount <= caps[family] && summary.sitemapUrlCount <= caps[family];
  });
}

function familyHasNoBlockers(byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>): boolean {
  return importBatchDryRunFamilies.every((family) => {
    const summary = byFamily[family];
    return summary.blockedCount === 0 && summary.blockers.length === 0 && summary.samples.every((sample) => sample.passed);
  });
}

function hasNoUnsafePublicHospitalRelations(hospitalRelations: ImportBatchDryRunHospitalRelationSummary): boolean {
  return hospitalRelations.unsafePublicCount === 0 && hospitalRelations.unsafePublicBlockers.length === 0;
}

function hasNoUnsafePublicLocalSuggestions(localSuggestions: ImportBatchDryRunLocalSuggestionSummary): boolean {
  return localSuggestions.unsafePublicCount === 0 && localSuggestions.unsafePublicBlockers.length === 0;
}

export function decideImportBatchDryRunReport(input: {
  checks: readonly ImportBatchDryRunCheck[];
  sitemap: ImportBatchDryRunSitemapSummary;
  byFamily: Record<ImportBatchDryRunFamily, ImportBatchDryRunFamilySummary>;
  hospitalRelations?: ImportBatchDryRunHospitalRelationSummary;
  localSuggestions?: ImportBatchDryRunLocalSuggestionSummary;
  caps?: ImportBatchDryRunCaps;
}): ImportBatchDryRunDecision {
  const caps = input.caps ?? firstImportBatchDryRunCaps;
  const hospitalRelations = input.hospitalRelations ?? emptyImportBatchDryRunHospitalRelationSummary();
  const localSuggestions = input.localSuggestions ?? emptyImportBatchDryRunLocalSuggestionSummary();
  if (!hasAllRequiredChecks(input.checks)) return "no_go";
  if (input.sitemap.unexpectedUrlCount > 0 || input.sitemap.unexpectedUrls.length > 0) return "no_go";
  if (!familyWithinCaps(input.byFamily, caps)) return "no_go";
  if (!familyHasNoBlockers(input.byFamily)) return "no_go";
  if (!hasNoUnsafePublicHospitalRelations(hospitalRelations)) return "no_go";
  if (!hasNoUnsafePublicLocalSuggestions(localSuggestions)) return "no_go";
  return "go";
}

export function buildImportBatchDryRunReport(input: BuildImportBatchDryRunReportInput): ImportBatchDryRunReport {
  const caps = input.caps ?? firstImportBatchDryRunCaps;
  const hospitalRelations = input.hospitalRelations ?? emptyImportBatchDryRunHospitalRelationSummary();
  const localSuggestions = input.localSuggestions ?? emptyImportBatchDryRunLocalSuggestionSummary();
  return {
    schemaVersion: importBatchDryRunSchemaVersion,
    rehearsalId: input.rehearsalId,
    generatedAt: input.generatedAt,
    commitSha: input.commitSha ?? null,
    decision: decideImportBatchDryRunReport({
      checks: input.checks,
      sitemap: input.sitemap,
      byFamily: input.byFamily,
      hospitalRelations,
      localSuggestions,
      caps,
    }),
    caps,
    checks: input.checks,
    sitemap: input.sitemap,
    byFamily: input.byFamily,
    hospitalRelations,
    localSuggestions,
    notes: input.notes ?? [],
  };
}
