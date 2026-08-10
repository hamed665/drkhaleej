import "server-only";

import { hashImportContractPayload } from "./import-contract-canonical-hash";

export const IMPORT_ENTITY_RESOLUTION_GATE_SCHEMA_VERSION =
  "drkhaleej.import.entityResolutionGate.v1" as const;
export const IMPORT_ENTITY_REVIEW_DECISION_SCHEMA_VERSION = "1.2.2" as const;
export const IMPORT_ENTITY_RESOLUTION_RPC = "import_record_entity_review_decision" as const;

type JsonScalar = string | number | boolean | null;
type ReviewDecision =
  | "approve_for_exact_review"
  | "edit"
  | "reject"
  | "request_refetch"
  | "confirmed_duplicate"
  | "not_duplicate"
  | "defer";

export type ImportEntityReviewDecision = {
  schema_version: typeof IMPORT_ENTITY_REVIEW_DECISION_SCHEMA_VERSION;
  policy_version: string;
  decision_id: string;
  draft_id: string;
  draft_version: number;
  draft_hash: string;
  decision: ReviewDecision;
  reviewer: {
    reviewer_id: string;
    role: "platform_admin";
    session_id: string;
  };
  reason: string;
  evidence_ids: readonly string[];
  duplicate_entity_id?: string;
  field_edits?: readonly {
    path: string;
    expected_value_hash: string;
    replacement_value: JsonScalar;
    reason: string;
  }[];
  decided_at: string;
};

export type ImportEntityResolutionGateInput = {
  resolutionSchemaVersion: typeof IMPORT_ENTITY_RESOLUTION_GATE_SCHEMA_VERSION;
  actorProfileId: string;
  candidateId: string;
  idempotencyKey: string;
  decision: unknown;
};

export type ImportEntityResolutionPlan = {
  rpcName: typeof IMPORT_ENTITY_RESOLUTION_RPC;
  actorProfileId: string;
  candidateId: string;
  idempotencyKey: string;
  requestHash: string;
  decision: ImportEntityReviewDecision;
  decisionRecordingAllowed: true;
  exactReviewApprovalRecorded: boolean;
  duplicateResolutionRecorded: boolean;
  candidateMutationAllowed: false;
  duplicateMergeAllowed: false;
  geoVerificationAllowed: false;
  directEntityWriteAllowed: false;
  publishAllowed: false;
};

export type ImportEntityResolutionBlocker =
  | "input_invalid"
  | "resolution_schema_unsupported"
  | "persistence_identity_invalid"
  | "decision_schema_invalid"
  | "reviewer_role_not_enabled"
  | "reviewer_actor_mismatch"
  | "draft_binding_mismatch"
  | "decision_condition_invalid"
  | "canonical_hash_invalid";

export type ImportEntityResolutionResult = {
  plan: ImportEntityResolutionPlan | null;
  blockers: readonly ImportEntityResolutionBlocker[];
  accepted: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[a-f0-9]{64}$/;
const inputKeys = new Set(["resolutionSchemaVersion", "actorProfileId", "candidateId", "idempotencyKey", "decision"]);
const decisionRequiredKeys = new Set([
  "schema_version", "policy_version", "decision_id", "draft_id", "draft_version", "draft_hash",
  "decision", "reviewer", "reason", "evidence_ids", "decided_at",
]);
const decisionAllowedKeys = new Set([...decisionRequiredKeys, "duplicate_entity_id", "field_edits"]);
const reviewerKeys = new Set(["reviewer_id", "role", "session_id"]);
const fieldEditKeys = new Set(["path", "expected_value_hash", "replacement_value", "reason"]);
const decisions = new Set<ReviewDecision>([
  "approve_for_exact_review", "edit", "reject", "request_refetch",
  "confirmed_duplicate", "not_duplicate", "defer",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, required: ReadonlySet<string> = allowed): boolean {
  return Object.keys(value).every((key) => allowed.has(key)) && [...required].every((key) => key in value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function boundedText(value: unknown, maximum: number, minimum = 1): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function isScalar(value: unknown): value is JsonScalar {
  return value === null || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.length <= 4_000);
}

function validateEvidenceIds(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length <= 200 && value.every(isUuid) && new Set(value).size === value.length;
}

function validateFieldEdits(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) return false;
  const paths = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !exactKeys(item, fieldEditKeys) || !boundedText(item.path, 160) ||
      typeof item.expected_value_hash !== "string" || !sha256Pattern.test(item.expected_value_hash) ||
      !isScalar(item.replacement_value) || !boundedText(item.reason, 500) || paths.has(item.path.trim())) return false;
    paths.add(item.path.trim());
  }
  return true;
}

function blocked(blocker: ImportEntityResolutionBlocker): ImportEntityResolutionResult {
  return { plan: null, blockers: [blocker], accepted: false };
}

export function buildImportEntityResolutionPlan(input: unknown): ImportEntityResolutionResult {
  if (!isRecord(input) || !exactKeys(input, inputKeys)) return blocked("input_invalid");
  if (input.resolutionSchemaVersion !== IMPORT_ENTITY_RESOLUTION_GATE_SCHEMA_VERSION) {
    return blocked("resolution_schema_unsupported");
  }
  if (!isUuid(input.actorProfileId) || !isUuid(input.candidateId) ||
    !boundedText(input.idempotencyKey, 240, 8)) return blocked("persistence_identity_invalid");
  if (!isRecord(input.decision) || !exactKeys(input.decision, decisionAllowedKeys, decisionRequiredKeys) ||
    input.decision.schema_version !== IMPORT_ENTITY_REVIEW_DECISION_SCHEMA_VERSION ||
    !boundedText(input.decision.policy_version, 80) || !isUuid(input.decision.decision_id) ||
    !isUuid(input.decision.draft_id) || !Number.isSafeInteger(input.decision.draft_version) ||
    Number(input.decision.draft_version) < 1 || typeof input.decision.draft_hash !== "string" ||
    !sha256Pattern.test(input.decision.draft_hash) || typeof input.decision.decision !== "string" ||
    !decisions.has(input.decision.decision as ReviewDecision) || !boundedText(input.decision.reason, 2_000) ||
    !validateEvidenceIds(input.decision.evidence_ids) || !isDateTime(input.decision.decided_at) ||
    !isRecord(input.decision.reviewer) || !exactKeys(input.decision.reviewer, reviewerKeys) ||
    !isUuid(input.decision.reviewer.reviewer_id) || !boundedText(input.decision.reviewer.session_id, 240, 16)) {
    return blocked("decision_schema_invalid");
  }
  if (input.decision.reviewer.role !== "platform_admin") return blocked("reviewer_role_not_enabled");
  if (input.decision.reviewer.reviewer_id !== input.actorProfileId) return blocked("reviewer_actor_mismatch");
  if (input.decision.draft_id !== input.candidateId) return blocked("draft_binding_mismatch");

  const decision = input.decision.decision as ReviewDecision;
  const hasDuplicate = "duplicate_entity_id" in input.decision;
  const hasEdits = "field_edits" in input.decision;
  if ((decision === "confirmed_duplicate") !== hasDuplicate ||
    (hasDuplicate && !isUuid(input.decision.duplicate_entity_id)) ||
    (decision === "edit") !== hasEdits || (hasEdits && !validateFieldEdits(input.decision.field_edits)) ||
    ((decision === "approve_for_exact_review" || decision === "confirmed_duplicate") && input.decision.evidence_ids.length === 0)) {
    return blocked("decision_condition_invalid");
  }

  const typedDecision = input.decision as ImportEntityReviewDecision;
  const requestHash = hashImportContractPayload(
    "entity-review-decision",
    IMPORT_ENTITY_REVIEW_DECISION_SCHEMA_VERSION,
    { actorProfileId: input.actorProfileId, candidateId: input.candidateId, decision: typedDecision },
  );
  if (!requestHash.accepted || requestHash.hash === null) return blocked("canonical_hash_invalid");

  return {
    plan: {
      rpcName: IMPORT_ENTITY_RESOLUTION_RPC,
      actorProfileId: input.actorProfileId,
      candidateId: input.candidateId,
      idempotencyKey: input.idempotencyKey.trim(),
      requestHash: requestHash.hash.digest,
      decision: typedDecision,
      decisionRecordingAllowed: true,
      exactReviewApprovalRecorded: decision === "approve_for_exact_review",
      duplicateResolutionRecorded: decision === "confirmed_duplicate" || decision === "not_duplicate",
      candidateMutationAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    },
    blockers: [],
    accepted: true,
  };
}
