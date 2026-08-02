import "server-only";

import type { ImportIntakeEvidenceReference } from "./import-intake-convergence";

export const SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION =
  "drkhaleej.import.sourceEvidenceLedger.v1" as const;
export const SOURCE_EVIDENCE_STANDARD_RETENTION_DAYS = 30;
export const SOURCE_EVIDENCE_DISPUTE_RETENTION_DAYS = 90;
export const SOURCE_EVIDENCE_MAX_ITEMS = 32;
export const SOURCE_EVIDENCE_MAX_REFERENCE_LENGTH = 128;
export const SOURCE_EVIDENCE_MAX_FIELD_PATHS = 32;
export const SOURCE_EVIDENCE_MAX_FIELD_PATH_LENGTH = 160;
export const SOURCE_EVIDENCE_MAX_EXCERPT_LENGTH = 1_000;

export type SourceEvidencePolicyStatus = "accepted" | "denied" | "needs_review";
export type SourceEvidenceRetentionClass = "standard" | "dispute";
export type SourceEvidenceSource = "manual" | "csv" | "excel" | "api" | "ai_assisted";

export type SourceEvidenceItemInput = {
  referenceId: string;
  fieldPaths: readonly string[];
  excerpt: string;
  excerptHash: string;
};

export type SourceEvidenceObservationInput = {
  schemaVersion: typeof SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION;
  idempotencyKey: string;
  requestHash: string;
  source: SourceEvidenceSource;
  sourceIdentity: string;
  policyStatus: SourceEvidencePolicyStatus;
  storageReference: string | null;
  contentHash: string | null;
  selectedHash: string | null;
  observedAt: string;
  parserVersion: string;
  retentionClass: SourceEvidenceRetentionClass;
  retainUntil: string;
  retentionReason: string | null;
  evidence: readonly SourceEvidenceItemInput[];
};

export type SourceEvidenceLedgerBlocker =
  | "input_invalid"
  | "schema_version_unsupported"
  | "source_unsupported"
  | "policy_status_unsupported"
  | "observation_identity_invalid"
  | "observation_time_invalid"
  | "retention_invalid"
  | "raw_storage_required"
  | "raw_storage_forbidden"
  | "evidence_required"
  | "evidence_forbidden"
  | "evidence_invalid"
  | "evidence_duplicate";

export type SourceEvidencePersistencePlan = {
  schemaVersion: typeof SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION;
  idempotencyKey: string;
  requestHash: string;
  source: SourceEvidenceSource;
  sourceIdentity: string;
  policyStatus: SourceEvidencePolicyStatus;
  storageReference: string | null;
  contentHash: string | null;
  selectedHash: string | null;
  observedAt: string;
  parserVersion: string;
  retentionClass: SourceEvidenceRetentionClass;
  retainUntil: string;
  retentionReason: string | null;
  evidence: readonly SourceEvidenceItemInput[];
  intakeEvidenceReferences: readonly ImportIntakeEvidenceReference[];
  persistenceAllowed: true;
  directEntityWriteAllowed: false;
  publishAllowed: false;
  rawPayloadInCanonicalDatabaseAllowed: false;
};

export type SourceEvidenceLedgerResult = {
  plan: SourceEvidencePersistencePlan | null;
  blockers: readonly SourceEvidenceLedgerBlocker[];
  accepted: boolean;
  requiresHumanReview: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

function isHash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isSource(value: unknown): value is SourceEvidenceSource {
  return value === "manual" || value === "csv" || value === "excel" || value === "api" || value === "ai_assisted";
}

function isPolicyStatus(value: unknown): value is SourceEvidencePolicyStatus {
  return value === "accepted" || value === "denied" || value === "needs_review";
}

function isRetentionClass(value: unknown): value is SourceEvidenceRetentionClass {
  return value === "standard" || value === "dispute";
}

function normalizedDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function validateEvidence(value: unknown): SourceEvidenceLedgerBlocker | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > SOURCE_EVIDENCE_MAX_ITEMS) {
    return "evidence_invalid";
  }
  const references = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || Object.keys(item).some((key) => !["referenceId", "fieldPaths", "excerpt", "excerptHash"].includes(key))) {
      return "evidence_invalid";
    }
    if (!boundedText(item.referenceId, SOURCE_EVIDENCE_MAX_REFERENCE_LENGTH)) return "evidence_invalid";
    const referenceId = item.referenceId.trim();
    if (references.has(referenceId)) return "evidence_duplicate";
    references.add(referenceId);
    if (
      !Array.isArray(item.fieldPaths) ||
      item.fieldPaths.length === 0 ||
      item.fieldPaths.length > SOURCE_EVIDENCE_MAX_FIELD_PATHS ||
      item.fieldPaths.some((path) => !boundedText(path, SOURCE_EVIDENCE_MAX_FIELD_PATH_LENGTH)) ||
      !boundedText(item.excerpt, SOURCE_EVIDENCE_MAX_EXCERPT_LENGTH) ||
      !isHash(item.excerptHash)
    ) return "evidence_invalid";
  }
  return null;
}

function blocked(blocker: SourceEvidenceLedgerBlocker): SourceEvidenceLedgerResult {
  return { plan: null, blockers: [blocker], accepted: false, requiresHumanReview: false };
}

export function buildSourceEvidencePersistencePlan(input: unknown): SourceEvidenceLedgerResult {
  if (!isRecord(input)) return blocked("input_invalid");
  const allowedKeys = new Set([
    "schemaVersion", "idempotencyKey", "requestHash", "source", "sourceIdentity", "policyStatus",
    "storageReference", "contentHash", "selectedHash", "observedAt", "parserVersion",
    "retentionClass", "retainUntil", "retentionReason", "evidence",
  ]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) return blocked("input_invalid");
  if (input.schemaVersion !== SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION) return blocked("schema_version_unsupported");
  if (!isSource(input.source)) return blocked("source_unsupported");
  if (!isPolicyStatus(input.policyStatus)) return blocked("policy_status_unsupported");
  if (
    !boundedText(input.idempotencyKey, 240) ||
    !isHash(input.requestHash) ||
    !boundedText(input.sourceIdentity, 160) ||
    !boundedText(input.parserVersion, 80)
  ) return blocked("observation_identity_invalid");

  const observedAt = normalizedDate(input.observedAt);
  const retainUntil = normalizedDate(input.retainUntil);
  if (!observedAt || !retainUntil) return blocked("observation_time_invalid");
  if (!isRetentionClass(input.retentionClass)) return blocked("retention_invalid");
  const maximumDays = input.retentionClass === "standard"
    ? SOURCE_EVIDENCE_STANDARD_RETENTION_DAYS
    : SOURCE_EVIDENCE_DISPUTE_RETENTION_DAYS;
  const duration = Date.parse(retainUntil) - Date.parse(observedAt);
  const retentionReason = typeof input.retentionReason === "string" ? input.retentionReason.trim() : null;
  if (
    duration <= 0 ||
    duration > maximumDays * 86_400_000 ||
    (input.retentionClass === "dispute" && !boundedText(retentionReason, 500)) ||
    (input.retentionClass === "standard" && retentionReason !== null && retentionReason.length > 500)
  ) return blocked("retention_invalid");

  const isAccepted = input.policyStatus === "accepted";
  const storageReference = boundedText(input.storageReference, 500) ? input.storageReference.trim() : null;
  const contentHash = isHash(input.contentHash) ? input.contentHash : null;
  const selectedHash = isHash(input.selectedHash) ? input.selectedHash : null;
  const hasStorage = storageReference !== null && contentHash !== null && selectedHash !== null;
  const hasAnyStorage = input.storageReference !== null || input.contentHash !== null || input.selectedHash !== null;
  const hasAnyEvidence = Array.isArray(input.evidence) && input.evidence.length > 0;
  if (isAccepted && !hasStorage) return blocked("raw_storage_required");
  if (!isAccepted && hasAnyStorage) return blocked("raw_storage_forbidden");
  if (isAccepted && !hasAnyEvidence) return blocked("evidence_required");
  if (!isAccepted && hasAnyEvidence) return blocked("evidence_forbidden");

  const evidenceBlocker = isAccepted ? validateEvidence(input.evidence) : null;
  if (evidenceBlocker) return blocked(evidenceBlocker);
  const evidence = (isAccepted ? input.evidence : []) as readonly SourceEvidenceItemInput[];
  const normalizedEvidence = evidence.map((item) => ({
    referenceId: item.referenceId.trim(),
    fieldPaths: item.fieldPaths.map((path) => path.trim()),
    excerpt: item.excerpt.trim(),
    excerptHash: item.excerptHash,
  }));

  return {
    plan: {
      schemaVersion: SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION,
      idempotencyKey: input.idempotencyKey.trim(),
      requestHash: input.requestHash,
      source: input.source,
      sourceIdentity: input.sourceIdentity.trim(),
      policyStatus: input.policyStatus,
      storageReference: isAccepted ? storageReference : null,
      contentHash: isAccepted ? contentHash : null,
      selectedHash: isAccepted ? selectedHash : null,
      observedAt,
      parserVersion: input.parserVersion.trim(),
      retentionClass: input.retentionClass,
      retainUntil,
      retentionReason,
      evidence: normalizedEvidence,
      intakeEvidenceReferences: normalizedEvidence.map(({ referenceId, fieldPaths }) => ({ referenceId, fieldPaths })),
      persistenceAllowed: true,
      directEntityWriteAllowed: false,
      publishAllowed: false,
      rawPayloadInCanonicalDatabaseAllowed: false,
    },
    blockers: [],
    accepted: isAccepted,
    requiresHumanReview: input.policyStatus === "needs_review" || input.source === "ai_assisted",
  };
}
