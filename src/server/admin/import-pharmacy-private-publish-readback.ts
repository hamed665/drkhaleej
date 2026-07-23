import "server-only";

import type { PharmacyCanonicalMutationPatch } from "./import-pharmacy-canonical-mutation-patch";
import { IMPORT_PHARMACY_EXECUTION_AUDIT_SCHEMA_VERSION } from "./import-supabase-pharmacy-private-mutation-writer";

export type PharmacyPrivatePublishReadbackExpected = {
  actorId: string;
  entityId: string;
  reservationId: string;
  rollbackSnapshotId: string;
  reservationAuditId: string;
  expectedVersion: string;
  expectedSnapshotHash: string;
  actualVersion: string;
  patch: PharmacyCanonicalMutationPatch;
  protectedMetadata: {
    canonicalGeo: unknown;
    projectionVersion: string;
  };
};

export type PharmacyPrivatePublishReadbackEvidence = {
  reservation: {
    count: number;
    actorId: string | null;
    entityId: string | null;
    expectedVersion: string | null;
    status: string | null;
    terminalActualVersion: string | null;
    terminalVisibility: string | null;
    terminalPublicRouteEnabled: boolean | null;
    terminalIndexable: boolean | null;
    terminalSitemapEligible: boolean | null;
  };
  rollbackSnapshot: {
    count: number;
    id: string | null;
    expectedVersion: string | null;
    snapshotHash: string | null;
  };
  reservationAudit: {
    count: number;
    id: string | null;
    eventType: string | null;
    phase: string | null;
    schemaVersion: string | null;
  };
  executionStarted: {
    count: number;
    phase: string | null;
    schemaVersion: string | null;
  };
  executionSucceeded: {
    count: number;
    schemaVersion: string | null;
    actualVersion: string | null;
  };
  publishReferenceCount: number;
  duplicateExecutionCount: number;
  publicExposureCount: number;
  entity: {
    id: string;
    centerType: string;
    status: string;
    isActive: boolean;
    isFeatured: boolean;
    deletedAt: string | null;
    updatedAt: string;
    nameEn: string | null;
    legalName: string | null;
    slug: string | null;
    descriptionEn: string | null;
    primaryPhone: string | null;
    whatsappPhone: string | null;
    email: string | null;
    websiteUrl: string | null;
    defaultLocale: string;
    defaultCountry: string;
    metadata: Record<string, unknown> | null;
  } | null;
};

export type PharmacyPrivatePublishReadbackBlocker =
  | "reservation_identity_mismatch"
  | "reservation_terminal_state_invalid"
  | "rollback_snapshot_mismatch"
  | "reservation_audit_mismatch"
  | "execution_started_mismatch"
  | "terminal_audit_mismatch"
  | "durable_reference_count_invalid"
  | "duplicate_execution_detected"
  | "entity_identity_invalid"
  | "entity_version_mismatch"
  | "canonical_patch_mismatch"
  | "protected_metadata_mismatch"
  | "private_boundary_invalid"
  | "public_exposure_detected";

export type PharmacyPrivatePublishReadbackResult = {
  verified: boolean;
  actualVersion: string | null;
  blockers: readonly PharmacyPrivatePublishReadbackBlocker[];
  counts: {
    reservation: number;
    rollbackSnapshot: number;
    reservationAudit: number;
    executionStarted: number;
    executionSucceeded: number;
    publishReference: number;
    duplicateExecution: number;
    publicExposure: number;
  };
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  rawIdentifiersExposed: false;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

export function verifyPharmacyPrivatePublishReadback(input: {
  expected: PharmacyPrivatePublishReadbackExpected;
  evidence: PharmacyPrivatePublishReadbackEvidence;
}): PharmacyPrivatePublishReadbackResult {
  const { expected, evidence } = input;
  const blockers: PharmacyPrivatePublishReadbackBlocker[] = [];
  const reservation = evidence.reservation;
  const snapshot = evidence.rollbackSnapshot;
  const entity = evidence.entity;

  if (
    reservation.count !== 1 ||
    reservation.actorId !== expected.actorId ||
    reservation.entityId !== expected.entityId ||
    reservation.expectedVersion !== expected.expectedVersion
  ) blockers.push("reservation_identity_mismatch");

  if (
    reservation.status !== "succeeded" ||
    reservation.terminalActualVersion !== expected.actualVersion ||
    reservation.terminalVisibility !== "private" ||
    reservation.terminalPublicRouteEnabled !== false ||
    reservation.terminalIndexable !== false ||
    reservation.terminalSitemapEligible !== false
  ) blockers.push("reservation_terminal_state_invalid");

  if (
    snapshot.count !== 1 ||
    snapshot.id !== expected.rollbackSnapshotId ||
    snapshot.expectedVersion !== expected.expectedVersion ||
    snapshot.snapshotHash !== expected.expectedSnapshotHash
  ) blockers.push("rollback_snapshot_mismatch");

  if (
    evidence.reservationAudit.count !== 1 ||
    evidence.reservationAudit.id !== expected.reservationAuditId ||
    evidence.reservationAudit.phase !== "reservation" ||
    !(
      (evidence.reservationAudit.eventType === "reservation_created" &&
        evidence.reservationAudit.schemaVersion === "drkhaleej.import.publishAudit.v2") ||
      (evidence.reservationAudit.eventType === "execution_started" &&
        evidence.reservationAudit.schemaVersion !== "drkhaleej.import.publishAudit.v2")
    )
  ) blockers.push("reservation_audit_mismatch");

  if (
    evidence.executionStarted.count !== 1 ||
    evidence.executionStarted.phase !== "mutation" ||
    evidence.executionStarted.schemaVersion !== IMPORT_PHARMACY_EXECUTION_AUDIT_SCHEMA_VERSION
  ) blockers.push("execution_started_mismatch");

  if (
    evidence.executionSucceeded.count !== 1 ||
    evidence.executionSucceeded.schemaVersion !== IMPORT_PHARMACY_EXECUTION_AUDIT_SCHEMA_VERSION ||
    evidence.executionSucceeded.actualVersion !== expected.actualVersion
  ) blockers.push("terminal_audit_mismatch");

  if (evidence.publishReferenceCount !== 1) blockers.push("durable_reference_count_invalid");
  if (evidence.duplicateExecutionCount !== 0) blockers.push("duplicate_execution_detected");
  if (evidence.publicExposureCount !== 0) blockers.push("public_exposure_detected");

  if (!entity || entity.id !== expected.entityId || entity.centerType !== "pharmacy") {
    blockers.push("entity_identity_invalid");
  } else {
    if (entity.updatedAt !== expected.actualVersion) blockers.push("entity_version_mismatch");
    if (
      entity.nameEn !== expected.patch.name_en ||
      entity.legalName !== expected.patch.legal_name ||
      entity.slug !== expected.patch.slug ||
      entity.descriptionEn !== expected.patch.description_en ||
      entity.primaryPhone !== expected.patch.primary_phone ||
      entity.whatsappPhone !== expected.patch.whatsapp_phone ||
      entity.email !== expected.patch.email ||
      entity.websiteUrl !== expected.patch.website_url ||
      !entity.metadata ||
      !same(entity.metadata.source, expected.patch.metadata_patch.source) ||
      !same(entity.metadata.sourceEvidence, expected.patch.metadata_patch.sourceEvidence) ||
      !same(entity.metadata.rawPayloadHash ?? null, expected.patch.metadata_patch.rawPayloadHash)
    ) blockers.push("canonical_patch_mismatch");

    if (
      !entity.metadata ||
      !same(entity.metadata.canonicalGeo, expected.protectedMetadata.canonicalGeo) ||
      entity.metadata.projectionVersion !== expected.protectedMetadata.projectionVersion ||
      entity.defaultCountry !== "om" ||
      (entity.defaultLocale !== "en" && entity.defaultLocale !== "ar")
    ) blockers.push("protected_metadata_mismatch");

    if (
      entity.status !== "draft" ||
      entity.isActive ||
      entity.isFeatured ||
      entity.deletedAt !== null ||
      !entity.metadata ||
      entity.metadata.visibility !== "private" ||
      entity.metadata.publicRouteEnabled !== false ||
      entity.metadata.indexable !== false ||
      entity.metadata.sitemapEligible !== false
    ) blockers.push("private_boundary_invalid");
  }

  const uniqueBlockers = [...new Set(blockers)];
  return {
    verified: uniqueBlockers.length === 0,
    actualVersion: entity?.updatedAt ?? null,
    blockers: uniqueBlockers,
    counts: {
      reservation: reservation.count,
      rollbackSnapshot: snapshot.count,
      reservationAudit: evidence.reservationAudit.count,
      executionStarted: evidence.executionStarted.count,
      executionSucceeded: evidence.executionSucceeded.count,
      publishReference: evidence.publishReferenceCount,
      duplicateExecution: evidence.duplicateExecutionCount,
      publicExposure: evidence.publicExposureCount,
    },
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawIdentifiersExposed: false,
  };
}
