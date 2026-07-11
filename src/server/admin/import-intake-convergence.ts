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
  const byFamily = new Map<ImportPublishFamily, ImportFamilyEvidence>(
    evidenceRows.map((row) => [row.family, row]),
  );
  const families: readonly ImportPublishFamily[] = ["doctor", "hospital", "pharmacy"];

  for (const family of families) {
    if (!byFamily.has(family)) blockers.push(`family_evidence_missing:${family}`);
  }

  const scores: Record<ImportPublishFamily, number | null> = {
    doctor: byFamily.has("doctor") ? scoreFamily(byFamily.get("doctor")!) : null,
    hospital: byFamily.has("hospital") ? scoreFamily(byFamily.get("hospital")!) : null,
    pharmacy: byFamily.has("pharmacy") ? scoreFamily(byFamily.get("pharmacy")!) : null,
  };

  const eligibleFamilies = families.filter((family) => scores[family] !== null);
  const ordered = [...eligibleFamilies].sort((left, right) => scores[left]! - scores[right]!);
  const first = ordered.at(0) ?? null;
  const second = ordered.at(1) ?? null;

  if (first === null) blockers.push("no_family_ready");
  if (first !== null && second !== null && scores[first] === scores[second]) {
    blockers.push("family_score_tie");
  }

  return {
    selectedFamily: blockers.length === 0 ? first : null,
    eligibleFamilies,
    scores,
    blockers: [...new Set(blockers)],
  };
}
