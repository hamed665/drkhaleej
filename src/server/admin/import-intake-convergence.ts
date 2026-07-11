import "server-only";

import {
  buildUnifiedDraftEntity,
  getUnifiedDraftEntityBlockers,
  type ImportDraftEntitySource,
  type ImportUnifiedDraftEntity,
  type ImportUnifiedDraftEntityInput,
} from "./import-unified-draft-entity";

export type ImportConvergedSource = Extract<ImportDraftEntitySource, "manual" | "csv" | "excel">;

export type ImportIntakePayload = Omit<ImportUnifiedDraftEntityInput, "source">;

export type ImportIntakeConvergenceResult = {
  source: ImportConvergedSource;
  draft: ImportUnifiedDraftEntity;
  blockers: ReturnType<typeof getUnifiedDraftEntityBlockers>;
  converged: boolean;
  directEntityWriteAllowed: false;
};

function converge(source: ImportConvergedSource, payload: ImportIntakePayload): ImportIntakeConvergenceResult {
  const input: ImportUnifiedDraftEntityInput = { ...payload, source };
  const blockers = getUnifiedDraftEntityBlockers(input);
  return {
    source,
    draft: buildUnifiedDraftEntity(input),
    blockers,
    converged: blockers.length === 0,
    directEntityWriteAllowed: false,
  };
}

export function normalizeManualImport(payload: ImportIntakePayload): ImportIntakeConvergenceResult {
  return converge("manual", payload);
}

export function normalizeCsvImport(payload: ImportIntakePayload): ImportIntakeConvergenceResult {
  return converge("csv", payload);
}

export function normalizeExcelImport(payload: ImportIntakePayload): ImportIntakeConvergenceResult {
  return converge("excel", payload);
}

export type ImportPublishFamily = "doctor" | "hospital" | "pharmacy";

export type ImportFamilyEvidence = {
  family: ImportPublishFamily;
  schemaReady: boolean;
  fixtureReady: boolean;
  privateRouteReady: boolean;
  projectionReady: boolean;
  rollbackShapeReady: boolean;
  requiredRelationCount: number;
  mutableFieldCount: number;
  unresolvedBlockers: readonly string[];
};

export type ImportFamilySelectionResult = {
  selectedFamily: ImportPublishFamily | null;
  eligibleFamilies: readonly ImportPublishFamily[];
  scores: Readonly<Record<ImportPublishFamily, number | null>>;
  blockers: readonly string[];
};

function scoreFamily(evidence: ImportFamilyEvidence): number | null {
  if (
    !evidence.schemaReady ||
    !evidence.fixtureReady ||
    !evidence.privateRouteReady ||
    !evidence.projectionReady ||
    !evidence.rollbackShapeReady ||
    evidence.unresolvedBlockers.length > 0 ||
    evidence.requiredRelationCount < 0 ||
    evidence.mutableFieldCount < 1
  ) {
    return null;
  }

  return evidence.requiredRelationCount * 10 + evidence.mutableFieldCount;
}

export function selectFirstPrivatePublishFamily(
  evidenceRows: readonly ImportFamilyEvidence[],
): ImportFamilySelectionResult {
  const blockers: string[] = [];
  const byFamily = new Map(evidenceRows.map((row) => [row.family, row]));
  const families: readonly ImportPublishFamily[] = ["doctor", "hospital", "pharmacy"];

  for (const family of families) {
    if (!byFamily.has(family)) blockers.push(`family_evidence_missing:${family}`);
  }

  const scores = Object.fromEntries(
    families.map((family) => [family, byFamily.has(family) ? scoreFamily(byFamily.get(family)!) : null]),
  ) as Record<ImportPublishFamily, number | null>;

  const eligibleFamilies = families.filter((family) => scores[family] !== null);
  const ordered = [...eligibleFamilies].sort((left, right) => scores[left]! - scores[right]!);

  if (ordered.length === 0) blockers.push("no_family_ready");
  if (ordered.length > 1 && scores[ordered[0]] === scores[ordered[1]]) blockers.push("family_score_tie");

  return {
    selectedFamily: blockers.length === 0 ? ordered[0] ?? null : null,
    eligibleFamilies,
    scores,
    blockers: [...new Set(blockers)],
  };
}
