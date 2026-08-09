import "server-only";

import {
  IMPORT_CONTRACT_CANONICALIZATION_VERSION,
  hashImportContractPayload,
} from "./import-contract-canonical-hash";
import {
  IMPORT_DUPLICATE_GEO_POLICY_VERSION,
  IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
  buildImportDuplicateGeoCandidatePlan,
  type ImportDuplicateCandidate,
  type ImportDuplicateGeoCandidatePlan,
  type ImportGeoCandidate,
} from "./import-duplicate-geo-contract";
import { isImportEntityType, type ImportEntityType } from "./import-entity-domain";
import {
  IMPORT_INTAKE_SCHEMA_VERSION,
  type ImportIntakeEvidenceReference,
} from "./import-intake-convergence";
import { SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION } from "./import-source-evidence-ledger";

export const IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION =
  "drkhaleej.import.entityCandidatePipeline.v1" as const;
export const IMPORT_ENTITY_DRAFT_SCHEMA_VERSION = "1.2.2" as const;
export const IMPORT_ENTITY_CANDIDATE_RPC = "import_persist_entity_candidate" as const;

type JsonScalar = string | number | boolean | null;
type JsonValue = JsonScalar | readonly JsonScalar[] | Readonly<Record<string, JsonScalar>>;

export type ImportEntityCandidateDraft = {
  schema_version: typeof IMPORT_ENTITY_DRAFT_SCHEMA_VERSION;
  policy_version: string;
  draft_id: string;
  entity_family: ImportEntityType;
  candidate_entity_id?: string | null;
  operator_type?: "private" | "government" | "charity" | "nonprofit" | "public_private" | "unknown";
  status: "collecting" | "needs_review";
  locales: {
    en: { official_name: string | null; short_description?: string | null };
    ar: { official_name: string | null; short_description?: string | null };
  };
  fields: readonly {
    path: string;
    value: JsonValue;
    normalized_value: JsonValue;
    observation_id: string;
    source_tier: "T1" | "T2" | "T3" | "T4" | "T5";
    confidence: number;
    extraction_method: "structured_data" | "selector" | "regex" | "small_model" | "strong_model" | "manual";
    evidence_excerpt: string;
    conflicts: readonly {
      observation_id: string;
      reason: string;
      status: "open" | "requires_review";
      value?: JsonValue;
    }[];
    observed_at: string;
    review_status: "pending";
  }[];
  duplicate_candidates: readonly {
    entity_id: string;
    score: number;
    reasons: readonly string[];
    decision: "candidate" | "not_duplicate_candidate" | "requires_review";
  }[];
  evidence_coverage: number;
  created_by: {
    actor_type: "admin" | "manual_import" | "api_import";
    actor_id: string;
  };
  version: number;
  created_at: string;
  updated_at: string;
};

export type ImportEntityCandidatePipelineInput = {
  pipelineSchemaVersion: typeof IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION;
  actorProfileId: string;
  batchId: string;
  rawRowId: string;
  idempotencyKey: string;
  intake: {
    schemaVersion: typeof IMPORT_INTAKE_SCHEMA_VERSION;
    draftId: string;
    entityType: ImportEntityType;
    evidenceReferences: readonly ImportIntakeEvidenceReference[];
  };
  sourceEvidence: {
    schemaVersion: typeof SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION;
    observationId: string;
    policyStatus: "accepted";
    lifecycleStatus: "active";
    evidenceReferences: readonly ImportIntakeEvidenceReference[];
  };
  duplicateGeo: unknown;
  candidate: unknown;
};

export type ImportEntityCandidatePersistenceEnvelope = {
  pipelineSchemaVersion: typeof IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION;
  intakeSchemaVersion: typeof IMPORT_INTAKE_SCHEMA_VERSION;
  sourceEvidenceSchemaVersion: typeof SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION;
  duplicateGeoSchemaVersion: typeof IMPORT_DUPLICATE_GEO_SCHEMA_VERSION;
  duplicateGeoPolicyVersion: typeof IMPORT_DUPLICATE_GEO_POLICY_VERSION;
  canonicalizationVersion: typeof IMPORT_CONTRACT_CANONICALIZATION_VERSION;
  contractSchemaVersion: typeof IMPORT_ENTITY_DRAFT_SCHEMA_VERSION;
  contractPolicyVersion: string;
  draftHash: string;
  sourceEvidenceReferenceIds: readonly string[];
  candidatePayload: ImportEntityCandidateDraft;
  duplicateCandidates: readonly ImportDuplicateCandidate[];
  geoCandidate: ImportGeoCandidate | null;
};

export type ImportEntityCandidatePersistencePlan = {
  rpcName: typeof IMPORT_ENTITY_CANDIDATE_RPC;
  actorProfileId: string;
  batchId: string;
  rawRowId: string;
  sourceObservationId: string;
  idempotencyKey: string;
  requestHash: string;
  pipeline: ImportEntityCandidatePersistenceEnvelope;
  duplicateGeoPlan: ImportDuplicateGeoCandidatePlan;
  candidatePersistenceAllowed: true;
  duplicateResolutionAllowed: false;
  duplicateMergeAllowed: false;
  geoVerificationAllowed: false;
  reviewDecisionAllowed: false;
  directEntityWriteAllowed: false;
  publishAllowed: false;
};

export type ImportEntityCandidatePipelineBlocker =
  | "input_invalid"
  | "pipeline_schema_unsupported"
  | "persistence_identity_invalid"
  | "intake_binding_invalid"
  | "source_evidence_binding_invalid"
  | "duplicate_geo_invalid"
  | "candidate_schema_invalid"
  | "candidate_actor_not_enabled"
  | "candidate_actor_mismatch"
  | "candidate_evidence_unbound"
  | "candidate_duplicate_binding_invalid"
  | "candidate_status_invalid"
  | "draft_binding_mismatch"
  | "canonical_hash_invalid";

export type ImportEntityCandidatePipelineResult = {
  plan: ImportEntityCandidatePersistencePlan | null;
  blockers: readonly ImportEntityCandidatePipelineBlocker[];
  accepted: boolean;
  requiresHumanReview: boolean;
};

const inputKeys = new Set([
  "pipelineSchemaVersion", "actorProfileId", "batchId", "rawRowId", "idempotencyKey",
  "intake", "sourceEvidence", "duplicateGeo", "candidate",
]);
const candidateRequiredKeys = new Set([
  "schema_version", "policy_version", "draft_id", "entity_family", "status", "locales",
  "fields", "duplicate_candidates", "evidence_coverage", "created_by", "version",
  "created_at", "updated_at",
]);
const candidateAllowedKeys = new Set([...candidateRequiredKeys, "candidate_entity_id", "operator_type"]);
const fieldKeys = new Set([
  "path", "value", "normalized_value", "observation_id", "source_tier", "confidence",
  "extraction_method", "evidence_excerpt", "conflicts", "observed_at", "review_status",
]);
const conflictKeys = new Set(["observation_id", "reason", "status", "value"]);
const duplicateKeys = new Set(["entity_id", "score", "reasons", "decision"]);
const actorTypes = new Set(["admin", "manual_import", "api_import"]);
const sourceTiers = new Set(["T1", "T2", "T3", "T4", "T5"]);
const extractionMethods = new Set(["structured_data", "selector", "regex", "small_model", "strong_model", "manual"]);
const operatorTypes = new Set(["private", "government", "charity", "nonprofit", "public_private", "unknown"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, required: ReadonlySet<string> = allowed): boolean {
  const keys = Object.keys(value);
  return keys.every((key) => allowed.has(key)) && [...required].every((key) => key in value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function boundedText(value: unknown, maximum: number, allowEmpty = false): value is string {
  return typeof value === "string" && value.length <= maximum && (allowEmpty || value.trim().length > 0);
}

function boundedNullableText(value: unknown, maximum: number, requireNonempty: boolean): value is string | null {
  return value === null || boundedText(value, maximum, !requireNonempty);
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function isUnitNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isJsonScalar(value: unknown): value is JsonScalar {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value));
}

function isBoundedValue(value: unknown): value is JsonValue {
  if (isJsonScalar(value)) return typeof value !== "string" || value.length <= 4_000;
  if (Array.isArray(value)) return value.length <= 100 && value.every(isJsonScalar) &&
    value.every((item) => typeof item !== "string" || item.length <= 4_000);
  if (!isRecord(value) || Object.keys(value).length > 50) return false;
  return Object.entries(value).every(([key, item]) =>
    key.length >= 1 && key.length <= 120 && isJsonScalar(item) &&
    (typeof item !== "string" || item.length <= 4_000));
}

function isReferenceList(value: unknown): value is readonly ImportIntakeEvidenceReference[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 32) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !exactKeys(item, new Set(["referenceId", "fieldPaths"]))) return false;
    if (!boundedText(item.referenceId, 128) || ids.has(item.referenceId.trim())) return false;
    if (!Array.isArray(item.fieldPaths) || item.fieldPaths.length === 0 || item.fieldPaths.length > 32 ||
      item.fieldPaths.some((path) => !boundedText(path, 160))) return false;
    ids.add(item.referenceId.trim());
  }
  return true;
}

function normalizeReferences(value: readonly ImportIntakeEvidenceReference[]): readonly ImportIntakeEvidenceReference[] {
  return value.map((reference) => ({
    referenceId: reference.referenceId.trim(),
    fieldPaths: reference.fieldPaths.map((path) => path.trim()),
  }));
}

function referencesEqual(left: readonly ImportIntakeEvidenceReference[], right: readonly ImportIntakeEvidenceReference[]): boolean {
  const normalize = (references: readonly ImportIntakeEvidenceReference[]) => references
    .map((reference) => ({ referenceId: reference.referenceId, fieldPaths: [...reference.fieldPaths].sort() }))
    .sort((a, b) => a.referenceId.localeCompare(b.referenceId));
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function validLocale(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const allowed = new Set(["official_name", "short_description"]);
  if (!exactKeys(value, allowed, new Set(["official_name"]))) return false;
  return boundedNullableText(value.official_name, 240, true) &&
    (value.short_description === undefined || boundedNullableText(value.short_description, 1_200, false));
}

function validConflict(value: unknown): boolean {
  if (!isRecord(value) || !exactKeys(value, conflictKeys, new Set(["observation_id", "reason", "status"]))) return false;
  return isUuid(value.observation_id) && boundedText(value.reason, 500) &&
    (value.status === "open" || value.status === "requires_review") &&
    (value.value === undefined || isBoundedValue(value.value));
}

function validField(value: unknown, observationId: string): boolean {
  if (!isRecord(value) || !exactKeys(value, fieldKeys)) return false;
  return boundedText(value.path, 240) && /^[a-zA-Z0-9_.-]+$/.test(value.path) &&
    isBoundedValue(value.value) && isBoundedValue(value.normalized_value) &&
    value.observation_id === observationId && sourceTiers.has(String(value.source_tier)) &&
    isUnitNumber(value.confidence) && extractionMethods.has(String(value.extraction_method)) &&
    boundedText(value.evidence_excerpt, 1_000, true) && Array.isArray(value.conflicts) &&
    value.conflicts.length <= 20 && value.conflicts.every(validConflict) &&
    isDateTime(value.observed_at) && value.review_status === "pending";
}

function validContractDuplicate(value: unknown): boolean {
  if (!isRecord(value) || !exactKeys(value, duplicateKeys)) return false;
  return isUuid(value.entity_id) && isUnitNumber(value.score) && Array.isArray(value.reasons) &&
    value.reasons.length >= 1 && value.reasons.length <= 20 &&
    value.reasons.every((reason) => boundedText(reason, 300)) &&
    (value.decision === "candidate" || value.decision === "not_duplicate_candidate" || value.decision === "requires_review");
}

function validateCandidate(value: unknown, observationId: string): ImportEntityCandidateDraft | null {
  if (!isRecord(value) || !exactKeys(value, candidateAllowedKeys, candidateRequiredKeys)) return null;
  if (value.schema_version !== IMPORT_ENTITY_DRAFT_SCHEMA_VERSION || !boundedText(value.policy_version, 80) ||
    !isUuid(value.draft_id) || typeof value.entity_family !== "string" || !isImportEntityType(value.entity_family) ||
    (value.status !== "collecting" && value.status !== "needs_review")) return null;
  if (value.candidate_entity_id !== undefined && value.candidate_entity_id !== null && !isUuid(value.candidate_entity_id)) return null;
  if (value.operator_type !== undefined && !operatorTypes.has(String(value.operator_type))) return null;
  if (!isRecord(value.locales) || !exactKeys(value.locales, new Set(["en", "ar"])) ||
    !validLocale(value.locales.en) || !validLocale(value.locales.ar)) return null;
  if (!Array.isArray(value.fields) || value.fields.length < 1 || value.fields.length > 200 ||
    !value.fields.every((field) => validField(field, observationId))) return null;
  if (!Array.isArray(value.duplicate_candidates) || value.duplicate_candidates.length > 20 ||
    !value.duplicate_candidates.every(validContractDuplicate)) return null;
  if (!isUnitNumber(value.evidence_coverage) || !isRecord(value.created_by) ||
    !exactKeys(value.created_by, new Set(["actor_type", "actor_id"])) ||
    !boundedText(value.created_by.actor_id, 120) ||
    (value.created_by.actor_type === "agent") || !actorTypes.has(String(value.created_by.actor_type))) return null;
  if (!Number.isSafeInteger(value.version) || Number(value.version) < 1 ||
    !isDateTime(value.created_at) || !isDateTime(value.updated_at) ||
    Date.parse(value.updated_at) < Date.parse(value.created_at)) return null;
  return value as ImportEntityCandidateDraft;
}

function duplicateBindingsMatch(candidate: ImportEntityCandidateDraft, duplicatePlan: ImportDuplicateGeoCandidatePlan): boolean {
  if (candidate.duplicate_candidates.length !== duplicatePlan.duplicateCandidates.length) return false;
  return candidate.duplicate_candidates.every((item) => duplicatePlan.duplicateCandidates.some((source) =>
    source.matchedEntityId === item.entity_id && source.score === item.score && source.status === item.decision &&
    JSON.stringify(source.reasons) === JSON.stringify(item.reasons)));
}

function blocked(blocker: ImportEntityCandidatePipelineBlocker): ImportEntityCandidatePipelineResult {
  return { plan: null, blockers: [blocker], accepted: false, requiresHumanReview: false };
}

export function buildImportEntityCandidatePersistencePlan(input: unknown): ImportEntityCandidatePipelineResult {
  if (!isRecord(input) || !exactKeys(input, inputKeys)) return blocked("input_invalid");
  if (input.pipelineSchemaVersion !== IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION) {
    return blocked("pipeline_schema_unsupported");
  }
  if (!isUuid(input.actorProfileId) || !isUuid(input.batchId) || !isUuid(input.rawRowId) ||
    !boundedText(input.idempotencyKey, 240) || input.idempotencyKey.trim().length < 8) {
    return blocked("persistence_identity_invalid");
  }
  if (!isRecord(input.intake) || !exactKeys(input.intake, new Set(["schemaVersion", "draftId", "entityType", "evidenceReferences"])) ||
    input.intake.schemaVersion !== IMPORT_INTAKE_SCHEMA_VERSION || !isUuid(input.intake.draftId) ||
    typeof input.intake.entityType !== "string" || !isImportEntityType(input.intake.entityType) ||
    !isReferenceList(input.intake.evidenceReferences)) return blocked("intake_binding_invalid");
  if (!isRecord(input.sourceEvidence) || !exactKeys(input.sourceEvidence, new Set([
    "schemaVersion", "observationId", "policyStatus", "lifecycleStatus", "evidenceReferences",
  ])) || input.sourceEvidence.schemaVersion !== SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION ||
    !isUuid(input.sourceEvidence.observationId) || input.sourceEvidence.policyStatus !== "accepted" ||
    input.sourceEvidence.lifecycleStatus !== "active" || !isReferenceList(input.sourceEvidence.evidenceReferences)) {
    return blocked("source_evidence_binding_invalid");
  }

  const intakeReferences = normalizeReferences(input.intake.evidenceReferences);
  const sourceReferences = normalizeReferences(input.sourceEvidence.evidenceReferences);
  const sourceIds = new Set(sourceReferences.map((reference) => reference.referenceId));
  if (intakeReferences.some((reference) => !sourceIds.has(reference.referenceId))) {
    return blocked("source_evidence_binding_invalid");
  }

  const duplicateGeoResult = buildImportDuplicateGeoCandidatePlan(input.duplicateGeo);
  if (!duplicateGeoResult.accepted || duplicateGeoResult.plan === null) return blocked("duplicate_geo_invalid");
  const duplicateGeoPlan = duplicateGeoResult.plan;
  if (!referencesEqual(intakeReferences, duplicateGeoPlan.intakeEvidenceReferences) ||
    !referencesEqual(sourceReferences, duplicateGeoPlan.sourceEvidenceReferences)) {
    return blocked("source_evidence_binding_invalid");
  }

  const candidate = validateCandidate(input.candidate, input.sourceEvidence.observationId);
  if (candidate === null) {
    if (isRecord(input.candidate) && isRecord(input.candidate.created_by) && input.candidate.created_by.actor_type === "agent") {
      return blocked("candidate_actor_not_enabled");
    }
    return blocked("candidate_schema_invalid");
  }
  if (candidate.created_by.actor_type === "admin" && candidate.created_by.actor_id !== input.actorProfileId) {
    return blocked("candidate_actor_mismatch");
  }
  const sourcePaths = new Set(sourceReferences.flatMap((reference) => reference.fieldPaths));
  if (candidate.fields.some((field) => !sourcePaths.has(field.path))) return blocked("candidate_evidence_unbound");
  if (!duplicateBindingsMatch(candidate, duplicateGeoPlan)) return blocked("candidate_duplicate_binding_invalid");
  if (candidate.draft_id !== input.intake.draftId || candidate.draft_id !== duplicateGeoPlan.draftId ||
    candidate.version !== duplicateGeoPlan.draftVersion || candidate.entity_family !== input.intake.entityType ||
    candidate.entity_family !== duplicateGeoPlan.entityType) return blocked("draft_binding_mismatch");
  if ((duplicateGeoResult.requiresHumanReview || candidate.duplicate_candidates.some((item) => item.decision === "requires_review")) &&
    candidate.status !== "needs_review") return blocked("candidate_status_invalid");

  const candidateHash = hashImportContractPayload("entity-draft", IMPORT_ENTITY_DRAFT_SCHEMA_VERSION, candidate);
  if (!candidateHash.accepted || candidateHash.hash === null || candidateHash.hash.digest !== duplicateGeoPlan.draftHash) {
    return blocked("canonical_hash_invalid");
  }

  const pipeline: ImportEntityCandidatePersistenceEnvelope = {
    pipelineSchemaVersion: IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION,
    intakeSchemaVersion: IMPORT_INTAKE_SCHEMA_VERSION,
    sourceEvidenceSchemaVersion: SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION,
    duplicateGeoSchemaVersion: IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
    duplicateGeoPolicyVersion: IMPORT_DUPLICATE_GEO_POLICY_VERSION,
    canonicalizationVersion: IMPORT_CONTRACT_CANONICALIZATION_VERSION,
    contractSchemaVersion: IMPORT_ENTITY_DRAFT_SCHEMA_VERSION,
    contractPolicyVersion: candidate.policy_version,
    draftHash: candidateHash.hash.digest,
    sourceEvidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
    candidatePayload: candidate,
    duplicateCandidates: duplicateGeoPlan.duplicateCandidates,
    geoCandidate: duplicateGeoPlan.geoCandidate,
  };
  const requestHashResult = hashImportContractPayload(
    "entity-candidate-persistence",
    IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION,
    {
      actorProfileId: input.actorProfileId,
      batchId: input.batchId,
      rawRowId: input.rawRowId,
      sourceObservationId: input.sourceEvidence.observationId,
      pipeline,
    },
  );
  if (!requestHashResult.accepted || requestHashResult.hash === null) return blocked("canonical_hash_invalid");

  return {
    plan: {
      rpcName: IMPORT_ENTITY_CANDIDATE_RPC,
      actorProfileId: input.actorProfileId,
      batchId: input.batchId,
      rawRowId: input.rawRowId,
      sourceObservationId: input.sourceEvidence.observationId,
      idempotencyKey: input.idempotencyKey.trim(),
      requestHash: requestHashResult.hash.digest,
      pipeline,
      duplicateGeoPlan,
      candidatePersistenceAllowed: true,
      duplicateResolutionAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      reviewDecisionAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    },
    blockers: [],
    accepted: true,
    requiresHumanReview: candidate.status === "needs_review",
  };
}
