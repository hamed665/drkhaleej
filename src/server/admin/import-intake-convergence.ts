import "server-only";

import {
  buildUnifiedDraftEntity,
  getUnifiedDraftEntityBlockers,
  type ImportDraftEntitySource,
  type ImportUnifiedDraftEntity,
  type ImportUnifiedDraftEntityInput,
} from "./import-unified-draft-entity";

export const IMPORT_INTAKE_SCHEMA_VERSION = "drkhaleej.import.intake.v1" as const;
export const IMPORT_INTAKE_MAX_EVIDENCE_REFERENCES = 20;
export const IMPORT_INTAKE_MAX_REFERENCE_ID_LENGTH = 128;
export const IMPORT_INTAKE_MAX_FIELD_PATHS = 32;
export const IMPORT_INTAKE_MAX_FIELD_PATH_LENGTH = 160;

export type ImportConvergedSource = ImportDraftEntitySource;
export type ImportIntakePayload = Omit<ImportUnifiedDraftEntityInput, "source">;

export type ImportIntakeEvidenceReference = {
  referenceId: string;
  fieldPaths: readonly string[];
};

export type ImportIntakeEnvelope = {
  schemaVersion: typeof IMPORT_INTAKE_SCHEMA_VERSION;
  source: ImportConvergedSource;
  payload: ImportIntakePayload;
  evidenceReferences: readonly ImportIntakeEvidenceReference[];
};

export type ImportIntakeContractBlocker =
  | "envelope_invalid"
  | "schema_version_unsupported"
  | "source_unsupported"
  | "payload_invalid"
  | "evidence_references_missing"
  | "evidence_reference_count_exceeded"
  | "evidence_reference_invalid"
  | "evidence_reference_duplicate";

export type ImportIntakeConvergenceResult = {
  schemaVersion: typeof IMPORT_INTAKE_SCHEMA_VERSION;
  source: ImportConvergedSource | null;
  draft: ImportUnifiedDraftEntity | null;
  evidenceReferences: readonly ImportIntakeEvidenceReference[];
  contractBlockers: readonly ImportIntakeContractBlocker[];
  draftBlockers: ReturnType<typeof getUnifiedDraftEntityBlockers>;
  blockers: readonly string[];
  converged: boolean;
  readyForValidation: boolean;
  requiresHumanReview: boolean;
  directEntityWriteAllowed: false;
};

const allowedEnvelopeKeys = new Set(["schemaVersion", "source", "payload", "evidenceReferences"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isConvergedSource(value: unknown): value is ImportConvergedSource {
  return value === "manual" || value === "csv" || value === "excel" || value === "api" || value === "ai_assisted";
}

function isBoundedText(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximumLength;
}

function isNullableText(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === "string";
}

function isNullableTextList(value: unknown): value is readonly string[] | null | undefined {
  return value === null || value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function hasNullableTextValues(value: unknown, allowedKeys: readonly string[]): boolean {
  return value === null || value === undefined || (
    isRecord(value) &&
    Object.entries(value).every(([key, item]) => allowedKeys.includes(key) && isNullableText(item))
  );
}

function isIntakePayload(value: unknown): value is ImportIntakePayload {
  if (!isRecord(value)) return false;
  if (!isNullableText(value.draftId) || !isNullableText(value.entityType) || !isNullableText(value.name)) return false;
  if (!isNullableText(value.legalName) || !isNullableText(value.slugCandidate) || !isNullableText(value.description)) return false;
  if (!isNullableText(value.rawPayloadHash)) return false;
  if (!isNullableTextList(value.services) || !isNullableTextList(value.specialties) || !isNullableTextList(value.duplicateCandidateIds)) return false;
  if (value.requiresManualReview !== null && value.requiresManualReview !== undefined && typeof value.requiresManualReview !== "boolean") return false;
  if (value.canonicalGeo !== null && value.canonicalGeo !== undefined && !isRecord(value.canonicalGeo)) return false;
  if (!hasNullableTextValues(value.contact, ["phone", "email", "website", "whatsapp"])) return false;
  return hasNullableTextValues(value.sourceEvidence, ["source", "sourceId", "sourceName", "importedBy", "importedAt"]);
}

function validateEvidenceReferences(value: unknown): readonly ImportIntakeContractBlocker[] {
  if (!Array.isArray(value) || value.length === 0) return ["evidence_references_missing"];
  if (value.length > IMPORT_INTAKE_MAX_EVIDENCE_REFERENCES) return ["evidence_reference_count_exceeded"];

  const referenceIds = new Set<string>();
  for (const reference of value) {
    if (!isRecord(reference) || Object.keys(reference).some((key) => key !== "referenceId" && key !== "fieldPaths")) {
      return ["evidence_reference_invalid"];
    }
    if (!isBoundedText(reference.referenceId, IMPORT_INTAKE_MAX_REFERENCE_ID_LENGTH)) {
      return ["evidence_reference_invalid"];
    }
    const normalizedReferenceId = reference.referenceId.trim();
    if (referenceIds.has(normalizedReferenceId)) return ["evidence_reference_duplicate"];
    referenceIds.add(normalizedReferenceId);

    if (
      !Array.isArray(reference.fieldPaths) ||
      reference.fieldPaths.length === 0 ||
      reference.fieldPaths.length > IMPORT_INTAKE_MAX_FIELD_PATHS ||
      reference.fieldPaths.some((fieldPath) => !isBoundedText(fieldPath, IMPORT_INTAKE_MAX_FIELD_PATH_LENGTH))
    ) {
      return ["evidence_reference_invalid"];
    }
  }
  return [];
}

function blockedResult(
  contractBlockers: readonly ImportIntakeContractBlocker[],
  source: ImportConvergedSource | null = null,
): ImportIntakeConvergenceResult {
  return {
    schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION,
    source,
    draft: null,
    evidenceReferences: [],
    contractBlockers,
    draftBlockers: [],
    blockers: contractBlockers,
    converged: false,
    readyForValidation: false,
    requiresHumanReview: false,
    directEntityWriteAllowed: false,
  };
}

export function convergeImportIntake(envelope: unknown): ImportIntakeConvergenceResult {
  if (!isRecord(envelope) || Object.keys(envelope).some((key) => !allowedEnvelopeKeys.has(key))) {
    return blockedResult(["envelope_invalid"]);
  }
  if (envelope.schemaVersion !== IMPORT_INTAKE_SCHEMA_VERSION) {
    return blockedResult(["schema_version_unsupported"]);
  }
  if (!isConvergedSource(envelope.source)) return blockedResult(["source_unsupported"]);
  const source = envelope.source;
  if (!isIntakePayload(envelope.payload)) return blockedResult(["payload_invalid"], source);

  const contractBlockers = validateEvidenceReferences(envelope.evidenceReferences);
  if (contractBlockers.length > 0) return blockedResult(contractBlockers, source);

  const payload = envelope.payload;
  const requiresHumanReview = source === "ai_assisted" || payload.requiresManualReview === true;
  const input: ImportUnifiedDraftEntityInput = {
    ...payload,
    source,
    requiresManualReview: requiresHumanReview,
  };
  const draftBlockers = getUnifiedDraftEntityBlockers(input);
  const evidenceReferences = (envelope.evidenceReferences as readonly ImportIntakeEvidenceReference[]).map(
    (reference) => ({
      referenceId: reference.referenceId.trim(),
      fieldPaths: reference.fieldPaths.map((fieldPath) => fieldPath.trim()),
    }),
  );

  return {
    schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION,
    source,
    draft: buildUnifiedDraftEntity(input),
    evidenceReferences,
    contractBlockers: [],
    draftBlockers,
    blockers: draftBlockers,
    converged: true,
    readyForValidation: draftBlockers.length === 0,
    requiresHumanReview,
    directEntityWriteAllowed: false,
  };
}

function converge(
  source: ImportConvergedSource,
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return convergeImportIntake({
    schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION,
    source,
    payload,
    evidenceReferences,
  });
}

export function normalizeManualImport(
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return converge("manual", payload, evidenceReferences);
}

export function normalizeCsvImport(
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return converge("csv", payload, evidenceReferences);
}

export function normalizeExcelImport(
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return converge("excel", payload, evidenceReferences);
}

export function normalizeApiImport(
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return converge("api", payload, evidenceReferences);
}

export function normalizeAiAssistedImport(
  payload: ImportIntakePayload,
  evidenceReferences: readonly ImportIntakeEvidenceReference[],
): ImportIntakeConvergenceResult {
  return converge("ai_assisted", payload, evidenceReferences);
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
  ) return null;

  return evidence.requiredRelationCount * 10 + evidence.mutableFieldCount;
}

export function selectFirstPrivatePublishFamily(
  evidenceRows: readonly ImportFamilyEvidence[],
): ImportFamilySelectionResult {
  const blockers: string[] = [];
  const byFamily = new Map<ImportPublishFamily, ImportFamilyEvidence>(
    evidenceRows.map((row): [ImportPublishFamily, ImportFamilyEvidence] => [row.family, row]),
  );
  const families: readonly ImportPublishFamily[] = ["doctor", "hospital", "pharmacy"];

  for (const family of families) {
    if (!byFamily.has(family)) blockers.push(`family_evidence_missing:${family}`);
  }

  const doctorEvidence = byFamily.get("doctor");
  const hospitalEvidence = byFamily.get("hospital");
  const pharmacyEvidence = byFamily.get("pharmacy");
  const scores: Record<ImportPublishFamily, number | null> = {
    doctor: doctorEvidence ? scoreFamily(doctorEvidence) : null,
    hospital: hospitalEvidence ? scoreFamily(hospitalEvidence) : null,
    pharmacy: pharmacyEvidence ? scoreFamily(pharmacyEvidence) : null,
  };

  const eligibleFamilies = families.filter((family) => scores[family] !== null);
  const ordered = [...eligibleFamilies].sort((left, right) => scores[left]! - scores[right]!);
  const first: ImportPublishFamily | null = ordered[0] ?? null;
  const second: ImportPublishFamily | null = ordered[1] ?? null;

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
