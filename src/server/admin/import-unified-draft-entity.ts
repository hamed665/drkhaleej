import "server-only";

import { isImportEntityType, resolveImportEntityDomain, type ImportEntityDomain, type ImportEntityType } from "./import-entity-domain";
import { type ImportCanonicalGeo } from "./import-canonical-geo";

export type ImportDraftEntitySource = "manual" | "csv" | "excel" | "api" | "ai_assisted";
export type ImportDraftEntityStatus = "draft" | "needs_review" | "blocked" | "ready_for_validation";

export type ImportDraftEntitySourceEvidence = {
  source: ImportDraftEntitySource;
  sourceId: string | null;
  sourceName: string | null;
  importedBy: string | null;
  importedAt: string | null;
};

export type ImportDraftEntityContact = {
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
};

export type ImportUnifiedDraftEntity = {
  draftId: string;
  source: ImportDraftEntitySource;
  status: ImportDraftEntityStatus;
  entityType: ImportEntityType | null;
  entityDomain: ImportEntityDomain | null;
  name: string | null;
  legalName: string | null;
  slugCandidate: string | null;
  description: string | null;
  services: readonly string[];
  specialties: readonly string[];
  contact: ImportDraftEntityContact;
  canonicalGeo: ImportCanonicalGeo | null;
  sourceEvidence: ImportDraftEntitySourceEvidence;
  rawPayloadHash: string | null;
  duplicateCandidateIds: readonly string[];
  requiresManualReview: boolean;
};

export type ImportUnifiedDraftEntityInput = {
  draftId: string | null;
  source: string | null;
  entityType: string | null;
  name: string | null;
  legalName?: string | null;
  slugCandidate?: string | null;
  description?: string | null;
  services?: readonly string[] | null;
  specialties?: readonly string[] | null;
  contact?: Partial<ImportDraftEntityContact> | null;
  canonicalGeo?: ImportCanonicalGeo | null;
  sourceEvidence?: Partial<ImportDraftEntitySourceEvidence> | null;
  rawPayloadHash?: string | null;
  duplicateCandidateIds?: readonly string[] | null;
  requiresManualReview?: boolean | null;
};

export type ImportUnifiedDraftEntityBlocker =
  | "draft_id_missing"
  | "source_missing"
  | "source_unsupported"
  | "entity_type_missing"
  | "entity_type_unsupported"
  | "entity_domain_unresolved"
  | "name_missing"
  | "source_evidence_missing"
  | "manual_review_required"
  | "duplicate_candidates_present"
  | "canonical_geo_missing";

export const IMPORT_DRAFT_ENTITY_SOURCES = ["manual", "csv", "excel", "api", "ai_assisted"] as const satisfies readonly ImportDraftEntitySource[];

const importDraftEntitySourceSet = new Set<ImportDraftEntitySource>(IMPORT_DRAFT_ENTITY_SOURCES);

export function isImportDraftEntitySource(value: string | null | undefined): value is ImportDraftEntitySource {
  return importDraftEntitySourceSet.has(value as ImportDraftEntitySource);
}

export function resolveImportDraftEntitySource(value: string | null | undefined): ImportDraftEntitySource | null {
  return isImportDraftEntitySource(value) ? value : null;
}

function toReadonlyList(value: readonly string[] | null | undefined): readonly string[] {
  return value?.filter((item) => item.trim().length > 0) ?? [];
}

function buildContact(contact: Partial<ImportDraftEntityContact> | null | undefined): ImportDraftEntityContact {
  return {
    phone: contact?.phone ?? null,
    email: contact?.email ?? null,
    website: contact?.website ?? null,
    whatsapp: contact?.whatsapp ?? null,
  };
}

function buildSourceEvidence(
  source: ImportDraftEntitySource,
  evidence: Partial<ImportDraftEntitySourceEvidence> | null | undefined,
): ImportDraftEntitySourceEvidence {
  return {
    source,
    sourceId: evidence?.sourceId ?? null,
    sourceName: evidence?.sourceName ?? null,
    importedBy: evidence?.importedBy ?? null,
    importedAt: evidence?.importedAt ?? null,
  };
}

export function buildUnifiedDraftEntity(input: ImportUnifiedDraftEntityInput): ImportUnifiedDraftEntity {
  const source = resolveImportDraftEntitySource(input.source) ?? "manual";
  const domainResolution = resolveImportEntityDomain(input.entityType);
  const duplicateCandidateIds = input.duplicateCandidateIds ?? [];
  const requiresManualReview =
  input.requiresManualReview ??
  (source === "ai_assisted" || duplicateCandidateIds.length > 0);

  return {
    draftId: input.draftId ?? "",
    source,
    status: requiresManualReview ? "needs_review" : "draft",
    entityType: isImportEntityType(input.entityType) ? input.entityType : null,
    entityDomain: domainResolution?.domain ?? null,
    name: input.name,
    legalName: input.legalName ?? null,
    slugCandidate: input.slugCandidate ?? null,
    description: input.description ?? null,
    services: toReadonlyList(input.services),
    specialties: toReadonlyList(input.specialties),
    contact: buildContact(input.contact),
    canonicalGeo: input.canonicalGeo ?? null,
    sourceEvidence: buildSourceEvidence(source, input.sourceEvidence),
    rawPayloadHash: input.rawPayloadHash ?? null,
    duplicateCandidateIds,
    requiresManualReview,
  };
}

export function getUnifiedDraftEntityBlockers(input: ImportUnifiedDraftEntityInput): readonly ImportUnifiedDraftEntityBlocker[] {
  const blockers: ImportUnifiedDraftEntityBlocker[] = [];

  if (input.draftId === null || input.draftId.trim().length === 0) blockers.push("draft_id_missing");

  if (input.source === null) blockers.push("source_missing");
  else if (!isImportDraftEntitySource(input.source)) blockers.push("source_unsupported");

  if (input.entityType === null) blockers.push("entity_type_missing");
  else if (!isImportEntityType(input.entityType)) blockers.push("entity_type_unsupported");
  else if (resolveImportEntityDomain(input.entityType) === null) blockers.push("entity_domain_unresolved");

  if (input.name === null || input.name.trim().length === 0) blockers.push("name_missing");
  if (input.sourceEvidence === null || input.sourceEvidence === undefined) blockers.push("source_evidence_missing");
  if (input.requiresManualReview === true || input.source === "ai_assisted") blockers.push("manual_review_required");
  if ((input.duplicateCandidateIds?.length ?? 0) > 0) blockers.push("duplicate_candidates_present");
  if (input.canonicalGeo === null || input.canonicalGeo === undefined) blockers.push("canonical_geo_missing");

  return [...new Set(blockers)];
}

export function isUnifiedDraftEntityReadyForValidation(input: ImportUnifiedDraftEntityInput): boolean {
  return getUnifiedDraftEntityBlockers(input).length === 0;
}
