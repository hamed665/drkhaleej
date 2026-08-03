import "server-only";

import { isImportEntityType, type ImportEntityType } from "./import-entity-domain";
import type { ImportIntakeEvidenceReference } from "./import-intake-convergence";

export const IMPORT_DUPLICATE_GEO_SCHEMA_VERSION = "drkhaleej.import.duplicateGeo.v1" as const;
export const IMPORT_DUPLICATE_GEO_POLICY_VERSION = "drkhaleej.import.duplicateGeoPolicy.v1" as const;
export const IMPORT_DUPLICATE_GEO_MAX_CANDIDATES = 20;
export const IMPORT_DUPLICATE_GEO_MAX_REASONS = 12;
export const IMPORT_DUPLICATE_GEO_MAX_TEXT_LENGTH = 160;

export const IMPORT_DUPLICATE_GEO_AUTHORITY_MAP = {
  countryId: "geo_countries.id",
  governorateId: "geo_regions.id",
  cityId: "geo_cities.id",
  areaId: "geo_areas.id",
  duplicateCandidates: "import_duplicate_candidates",
} as const;

export type ImportDuplicateCandidateStatus =
  | "candidate"
  | "not_duplicate_candidate"
  | "requires_review";

export type ImportGeoCandidateStatus = "candidate" | "requires_review";

export type ImportDuplicateCandidate = {
  candidateId: string;
  matchedEntityType: ImportEntityType;
  matchedEntityId: string;
  score: number;
  reasons: readonly string[];
  status: ImportDuplicateCandidateStatus;
  evidenceReferenceIds: readonly string[];
};

export type ImportGeoCandidate = {
  countryId: string;
  governorateId: string | null;
  cityId: string | null;
  areaId: string | null;
  latitude: number | null;
  longitude: number | null;
  confidence: number;
  status: ImportGeoCandidateStatus;
  evidenceReferenceIds: readonly string[];
};

export type ImportDuplicateGeoEnvelope = {
  schemaVersion: typeof IMPORT_DUPLICATE_GEO_SCHEMA_VERSION;
  policyVersion: typeof IMPORT_DUPLICATE_GEO_POLICY_VERSION;
  draftId: string;
  draftVersion: number;
  draftHash: string;
  entityType: ImportEntityType;
  intakeEvidenceReferences: readonly ImportIntakeEvidenceReference[];
  sourceEvidenceReferences: readonly ImportIntakeEvidenceReference[];
  duplicateCandidates: readonly ImportDuplicateCandidate[];
  geoCandidate: ImportGeoCandidate | null;
};

export type ImportDuplicateGeoBlocker =
  | "input_invalid"
  | "schema_version_unsupported"
  | "policy_version_unsupported"
  | "authority_claim_forbidden"
  | "draft_binding_invalid"
  | "entity_type_unsupported"
  | "evidence_references_missing"
  | "evidence_reference_invalid"
  | "evidence_reference_duplicate"
  | "evidence_reference_unbound"
  | "duplicate_candidate_invalid"
  | "duplicate_candidate_duplicate"
  | "geo_candidate_invalid"
  | "candidate_output_missing";

export type ImportDuplicateGeoCandidatePlan = {
  schemaVersion: typeof IMPORT_DUPLICATE_GEO_SCHEMA_VERSION;
  policyVersion: typeof IMPORT_DUPLICATE_GEO_POLICY_VERSION;
  draftId: string;
  draftVersion: number;
  draftHash: string;
  entityType: ImportEntityType;
  intakeEvidenceReferences: readonly ImportIntakeEvidenceReference[];
  sourceEvidenceReferences: readonly ImportIntakeEvidenceReference[];
  duplicateCandidates: readonly ImportDuplicateCandidate[];
  geoCandidate: ImportGeoCandidate | null;
  geoAuthorityMap: typeof IMPORT_DUPLICATE_GEO_AUTHORITY_MAP;
  candidatePersistenceAllowed: true;
  duplicateResolutionAllowed: false;
  duplicateMergeAllowed: false;
  geoVerificationAllowed: false;
  directEntityWriteAllowed: false;
  publishAllowed: false;
};

export type ImportDuplicateGeoResult = {
  plan: ImportDuplicateGeoCandidatePlan | null;
  blockers: readonly ImportDuplicateGeoBlocker[];
  accepted: boolean;
  requiresHumanReview: boolean;
};

const allowedEnvelopeKeys = new Set([
  "schemaVersion", "policyVersion", "draftId", "draftVersion", "draftHash", "entityType",
  "intakeEvidenceReferences", "sourceEvidenceReferences", "duplicateCandidates", "geoCandidate",
]);
const forbiddenAuthorityKeys = new Set([
  "confirmedDuplicate", "confirmed_duplicate", "duplicateResolution", "merge", "mergeAllowed",
  "geoVerified", "geoVerification", "canonicalEntity", "entityWrite", "publish", "publishAllowed",
]);
const duplicateCandidateKeys = new Set([
  "candidateId", "matchedEntityType", "matchedEntityId", "score", "reasons", "status",
  "evidenceReferenceIds",
]);
const geoCandidateKeys = new Set([
  "countryId", "governorateId", "cityId", "areaId", "latitude", "longitude", "confidence",
  "status", "evidenceReferenceIds",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= IMPORT_DUPLICATE_GEO_MAX_TEXT_LENGTH;
}

function isHash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function normalizeReferences(value: unknown): { references: ImportIntakeEvidenceReference[]; blocker: ImportDuplicateGeoBlocker | null } {
  if (!Array.isArray(value) || value.length === 0 || value.length > 32) {
    return { references: [], blocker: "evidence_references_missing" };
  }
  const ids = new Set<string>();
  const references: ImportIntakeEvidenceReference[] = [];
  for (const item of value) {
    if (!isRecord(item) || Object.keys(item).some((key) => key !== "referenceId" && key !== "fieldPaths")) {
      return { references: [], blocker: "evidence_reference_invalid" };
    }
    if (!boundedText(item.referenceId) || !Array.isArray(item.fieldPaths) || item.fieldPaths.length === 0 || item.fieldPaths.length > 32) {
      return { references: [], blocker: "evidence_reference_invalid" };
    }
    const referenceId = item.referenceId.trim();
    if (ids.has(referenceId)) return { references: [], blocker: "evidence_reference_duplicate" };
    if (item.fieldPaths.some((path) => !boundedText(path))) {
      return { references: [], blocker: "evidence_reference_invalid" };
    }
    ids.add(referenceId);
    references.push({ referenceId, fieldPaths: item.fieldPaths.map((path) => path.trim()) });
  }
  return { references, blocker: null };
}

function normalizeEvidenceIds(value: unknown, availableIds: ReadonlySet<string>): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 32) return null;
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!boundedText(item)) return null;
    const id = item.trim();
    if (seen.has(id) || !availableIds.has(id)) return null;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function normalizeDuplicateCandidates(value: unknown, evidenceIds: ReadonlySet<string>): { candidates: ImportDuplicateCandidate[]; blocker: ImportDuplicateGeoBlocker | null } {
  if (!Array.isArray(value) || value.length > IMPORT_DUPLICATE_GEO_MAX_CANDIDATES) {
    return { candidates: [], blocker: "duplicate_candidate_invalid" };
  }
  const candidateIds = new Set<string>();
  const candidates: ImportDuplicateCandidate[] = [];
  for (const item of value) {
    if (!isRecord(item) || Object.keys(item).some((key) => !duplicateCandidateKeys.has(key))) {
      return { candidates: [], blocker: "duplicate_candidate_invalid" };
    }
    if (!boundedText(item.candidateId) || candidateIds.has(item.candidateId.trim())) {
      return { candidates: [], blocker: candidateIds.has(String(item.candidateId).trim()) ? "duplicate_candidate_duplicate" : "duplicate_candidate_invalid" };
    }
    if (typeof item.matchedEntityType !== "string" || !isImportEntityType(item.matchedEntityType) || !boundedText(item.matchedEntityId)) {
      return { candidates: [], blocker: "duplicate_candidate_invalid" };
    }
    if (typeof item.score !== "number" || !Number.isFinite(item.score) || item.score < 0 || item.score > 1) {
      return { candidates: [], blocker: "duplicate_candidate_invalid" };
    }
    if (!Array.isArray(item.reasons) || item.reasons.length === 0 || item.reasons.length > IMPORT_DUPLICATE_GEO_MAX_REASONS || item.reasons.some((reason) => !boundedText(reason))) {
      return { candidates: [], blocker: "duplicate_candidate_invalid" };
    }
    if (item.status !== "candidate" && item.status !== "not_duplicate_candidate" && item.status !== "requires_review") {
      return { candidates: [], blocker: "duplicate_candidate_invalid" };
    }
    const boundEvidenceIds = normalizeEvidenceIds(item.evidenceReferenceIds, evidenceIds);
    if (!boundEvidenceIds) return { candidates: [], blocker: "evidence_reference_unbound" };
    const matchedEntityType = item.matchedEntityType;
    candidateIds.add(item.candidateId.trim());
    candidates.push({
      candidateId: item.candidateId.trim(),
      matchedEntityType,
      matchedEntityId: item.matchedEntityId.trim(),
      score: item.score,
      reasons: item.reasons.map((reason) => reason.trim()),
      status: item.status,
      evidenceReferenceIds: boundEvidenceIds,
    });
  }
  return { candidates, blocker: null };
}

function normalizeGeoCandidate(value: unknown, evidenceIds: ReadonlySet<string>): ImportGeoCandidate | null | undefined {
  if (value === null) return null;
  if (!isRecord(value) || Object.keys(value).some((key) => !geoCandidateKeys.has(key))) return undefined;
  if (!boundedText(value.countryId)) return undefined;
  for (const key of ["governorateId", "cityId", "areaId"] as const) {
    if (value[key] !== null && !boundedText(value[key])) return undefined;
  }
  for (const key of ["latitude", "longitude"] as const) {
    if (value[key] !== null && (typeof value[key] !== "number" || !Number.isFinite(value[key]))) return undefined;
  }
  if (typeof value.latitude === "number" && (value.latitude < -90 || value.latitude > 90)) return undefined;
  if (typeof value.longitude === "number" && (value.longitude < -180 || value.longitude > 180)) return undefined;
  if (typeof value.confidence !== "number" || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) return undefined;
  if (value.status !== "candidate" && value.status !== "requires_review") return undefined;
  const boundEvidenceIds = normalizeEvidenceIds(value.evidenceReferenceIds, evidenceIds);
  if (!boundEvidenceIds) return undefined;
  const countryId = value.countryId;
  const governorateId = value.governorateId as string | null;
  const cityId = value.cityId as string | null;
  const areaId = value.areaId as string | null;
  const latitude = value.latitude as number | null;
  const longitude = value.longitude as number | null;
  return {
    countryId: countryId.trim(),
    governorateId: governorateId === null ? null : governorateId.trim(),
    cityId: cityId === null ? null : cityId.trim(),
    areaId: areaId === null ? null : areaId.trim(),
    latitude,
    longitude,
    confidence: value.confidence,
    status: value.status,
    evidenceReferenceIds: boundEvidenceIds,
  };
}

function blocked(blocker: ImportDuplicateGeoBlocker): ImportDuplicateGeoResult {
  return { plan: null, blockers: [blocker], accepted: false, requiresHumanReview: false };
}

export function buildImportDuplicateGeoCandidatePlan(input: unknown): ImportDuplicateGeoResult {
  if (!isRecord(input)) return blocked("input_invalid");
  if (Object.keys(input).some((key) => forbiddenAuthorityKeys.has(key))) return blocked("authority_claim_forbidden");
  if (Object.keys(input).some((key) => !allowedEnvelopeKeys.has(key))) return blocked("input_invalid");
  if (input.schemaVersion !== IMPORT_DUPLICATE_GEO_SCHEMA_VERSION) return blocked("schema_version_unsupported");
  if (input.policyVersion !== IMPORT_DUPLICATE_GEO_POLICY_VERSION) return blocked("policy_version_unsupported");
  if (!boundedText(input.draftId) || !Number.isSafeInteger(input.draftVersion) || Number(input.draftVersion) < 1 || !isHash(input.draftHash)) {
    return blocked("draft_binding_invalid");
  }
  if (typeof input.entityType !== "string" || !isImportEntityType(input.entityType)) return blocked("entity_type_unsupported");
  const entityType = input.entityType;

  const intake = normalizeReferences(input.intakeEvidenceReferences);
  if (intake.blocker) return blocked(intake.blocker);
  const source = normalizeReferences(input.sourceEvidenceReferences);
  if (source.blocker) return blocked(source.blocker);
  const sourceIds = new Set(source.references.map((reference) => reference.referenceId));
  if (intake.references.some((reference) => !sourceIds.has(reference.referenceId))) return blocked("evidence_reference_unbound");

  const duplicates = normalizeDuplicateCandidates(input.duplicateCandidates, sourceIds);
  if (duplicates.blocker) return blocked(duplicates.blocker);
  const geoCandidate = normalizeGeoCandidate(input.geoCandidate, sourceIds);
  if (geoCandidate === undefined) return blocked("geo_candidate_invalid");
  if (duplicates.candidates.length === 0 && geoCandidate === null) return blocked("candidate_output_missing");

  return {
    plan: {
      schemaVersion: IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
      policyVersion: IMPORT_DUPLICATE_GEO_POLICY_VERSION,
      draftId: input.draftId.trim(),
      draftVersion: Number(input.draftVersion),
      draftHash: input.draftHash,
      entityType,
      intakeEvidenceReferences: intake.references,
      sourceEvidenceReferences: source.references,
      duplicateCandidates: duplicates.candidates,
      geoCandidate,
      geoAuthorityMap: IMPORT_DUPLICATE_GEO_AUTHORITY_MAP,
      candidatePersistenceAllowed: true,
      duplicateResolutionAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    },
    blockers: [],
    accepted: true,
    requiresHumanReview:
      duplicates.candidates.some((candidate) => candidate.status === "requires_review") ||
      geoCandidate?.status === "requires_review",
  };
}
