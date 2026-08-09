import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { hashImportContractPayload } from "./import-contract-canonical-hash";
import {
  IMPORT_DUPLICATE_GEO_POLICY_VERSION,
  IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
} from "./import-duplicate-geo-contract";
import {
  IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION,
  IMPORT_ENTITY_DRAFT_SCHEMA_VERSION,
  buildImportEntityCandidatePersistencePlan,
} from "./import-entity-candidate-pipeline";
import { IMPORT_INTAKE_SCHEMA_VERSION } from "./import-intake-convergence";
import { SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION } from "./import-source-evidence-ledger";

const actorId = "11111111-1111-4111-8111-111111111111";
const batchId = "22222222-2222-4222-8222-222222222222";
const rowId = "33333333-3333-4333-8333-333333333333";
const observationId = "44444444-4444-4444-8444-444444444444";
const draftId = "55555555-5555-4555-8555-555555555555";
const duplicateEntityId = "66666666-6666-4666-8666-666666666666";
const evidence = [{ referenceId: "evidence-1", fieldPaths: ["contact.phone", "locales.en.official_name"] }];

function candidate(status: "collecting" | "needs_review" = "needs_review") {
  return {
    schema_version: IMPORT_ENTITY_DRAFT_SCHEMA_VERSION,
    policy_version: "entity-policy-2026-01",
    draft_id: draftId,
    entity_family: "pharmacy",
    status,
    locales: {
      en: { official_name: "Pipeline Pharmacy" },
      ar: { official_name: "صيدلية بايبلاين" },
    },
    fields: [{
      path: "contact.phone",
      value: "+96800000000",
      normalized_value: "+96800000000",
      observation_id: observationId,
      source_tier: "T1",
      confidence: 0.99,
      extraction_method: "structured_data",
      evidence_excerpt: "Public contact number",
      conflicts: [],
      observed_at: "2026-08-03T08:00:00.000Z",
      review_status: "pending",
    }],
    duplicate_candidates: [{
      entity_id: duplicateEntityId,
      score: 0.82,
      reasons: ["normalized name and city match"],
      decision: "requires_review",
    }],
    evidence_coverage: 1,
    created_by: { actor_type: "admin", actor_id: actorId },
    version: 1,
    created_at: "2026-08-03T08:00:00.000Z",
    updated_at: "2026-08-03T08:00:00.000Z",
  };
}

function envelope(candidatePayload = candidate()) {
  const hash = hashImportContractPayload("entity-draft", IMPORT_ENTITY_DRAFT_SCHEMA_VERSION, candidatePayload).hash?.digest;
  return {
    pipelineSchemaVersion: IMPORT_ENTITY_CANDIDATE_PIPELINE_SCHEMA_VERSION,
    actorProfileId: actorId,
    batchId,
    rawRowId: rowId,
    idempotencyKey: "candidate-persistence-001",
    intake: {
      schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION,
      draftId,
      entityType: "pharmacy",
      evidenceReferences: evidence,
    },
    sourceEvidence: {
      schemaVersion: SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION,
      observationId,
      policyStatus: "accepted",
      lifecycleStatus: "active",
      evidenceReferences: evidence,
    },
    duplicateGeo: {
      schemaVersion: IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
      policyVersion: IMPORT_DUPLICATE_GEO_POLICY_VERSION,
      draftId,
      draftVersion: 1,
      draftHash: hash,
      entityType: "pharmacy",
      intakeEvidenceReferences: evidence,
      sourceEvidenceReferences: evidence,
      duplicateCandidates: [{
        candidateId: "duplicate-candidate-1",
        matchedEntityType: "pharmacy",
        matchedEntityId: duplicateEntityId,
        score: 0.82,
        reasons: ["normalized name and city match"],
        status: "requires_review",
        evidenceReferenceIds: ["evidence-1"],
      }],
      geoCandidate: {
        countryId: "77777777-7777-4777-8777-777777777777",
        governorateId: "88888888-8888-4888-8888-888888888888",
        cityId: "99999999-9999-4999-8999-999999999999",
        areaId: null,
        latitude: 23.588,
        longitude: 58.3829,
        confidence: 0.9,
        status: "candidate",
        evidenceReferenceIds: ["evidence-1"],
      },
    },
    candidate: candidatePayload,
  };
}

describe("entity candidate persistence pipeline", () => {
  it("binds P16, P17, P18 and the canonical Entity Draft hash into one RPC plan", () => {
    const result = buildImportEntityCandidatePersistencePlan(envelope());
    expect(result.accepted).toBe(true);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.plan).toMatchObject({
      rpcName: "import_persist_entity_candidate",
      candidatePersistenceAllowed: true,
      duplicateResolutionAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      reviewDecisionAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    });
    expect(result.plan?.requestHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.plan?.pipeline.draftHash).toBe((envelope().duplicateGeo as { draftHash: string }).draftHash);
  });

  it("accepts collecting only when no candidate output requires review", () => {
    const input = envelope(candidate("collecting"));
    const duplicateGeo = input.duplicateGeo as ReturnType<typeof envelope>["duplicateGeo"];
    duplicateGeo.duplicateCandidates[0]!.status = "candidate";
    (input.candidate as ReturnType<typeof candidate>).duplicate_candidates[0]!.decision = "candidate";
    duplicateGeo.draftHash = hashImportContractPayload("entity-draft", IMPORT_ENTITY_DRAFT_SCHEMA_VERSION, input.candidate).hash!.digest;
    expect(buildImportEntityCandidatePersistencePlan(input)).toMatchObject({ accepted: true, requiresHumanReview: false });
  });

  it("rejects collecting when P18 requires human review", () => {
    expect(buildImportEntityCandidatePersistencePlan(envelope(candidate("collecting"))).blockers)
      .toEqual(["candidate_status_invalid"]);
  });

  it("rejects stale draft hashes and binding drift", () => {
    const stale = envelope();
    (stale.duplicateGeo as { draftHash: string }).draftHash = "a".repeat(64);
    expect(buildImportEntityCandidatePersistencePlan(stale).blockers).toEqual(["canonical_hash_invalid"]);

    const drift = envelope();
    drift.intake.draftId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    expect(buildImportEntityCandidatePersistencePlan(drift).blockers).toEqual(["draft_binding_mismatch"]);
  });

  it("rejects evidence paths or references not bound across P16/P17/P18", () => {
    const pathDrift = envelope();
    pathDrift.sourceEvidence.evidenceReferences = [{ referenceId: "evidence-1", fieldPaths: ["other.path"] }];
    expect(buildImportEntityCandidatePersistencePlan(pathDrift).blockers).toEqual(["source_evidence_binding_invalid"]);

    const fieldDrift = envelope();
    fieldDrift.intake.evidenceReferences = [{ referenceId: "evidence-1", fieldPaths: ["other.path"] }];
    fieldDrift.sourceEvidence.evidenceReferences = [{ referenceId: "evidence-1", fieldPaths: ["other.path"] }];
    const duplicateGeo = fieldDrift.duplicateGeo as { intakeEvidenceReferences: typeof evidence; sourceEvidenceReferences: typeof evidence };
    duplicateGeo.intakeEvidenceReferences = fieldDrift.intake.evidenceReferences;
    duplicateGeo.sourceEvidenceReferences = fieldDrift.sourceEvidence.evidenceReferences;
    expect(buildImportEntityCandidatePersistencePlan(fieldDrift).blockers).toEqual(["candidate_evidence_unbound"]);
  });

  it("rejects duplicate material that differs from the Entity Draft contract", () => {
    const input = envelope();
    (input.candidate as ReturnType<typeof candidate>).duplicate_candidates[0]!.score = 0.5;
    (input.duplicateGeo as { draftHash: string }).draftHash = hashImportContractPayload(
      "entity-draft", IMPORT_ENTITY_DRAFT_SCHEMA_VERSION, input.candidate,
    ).hash!.digest;
    expect(buildImportEntityCandidatePersistencePlan(input).blockers).toEqual(["candidate_duplicate_binding_invalid"]);
  });

  it("keeps Agent/Worker authorship closed in this phase", () => {
    const input = envelope();
    (input.candidate as ReturnType<typeof candidate>).created_by = { actor_type: "agent", actor_id: "entity-agent" } as never;
    (input.duplicateGeo as { draftHash: string }).draftHash = hashImportContractPayload(
      "entity-draft", IMPORT_ENTITY_DRAFT_SCHEMA_VERSION, input.candidate,
    ).hash!.digest;
    expect(buildImportEntityCandidatePersistencePlan(input).blockers).toEqual(["candidate_actor_not_enabled"]);
  });

  it("rejects reviewer, approval, merge, entity-write and publish fields through closed schemas", () => {
    for (const key of ["reviewDecision", "approved", "mergeAllowed", "canonicalEntity", "publishAllowed"]) {
      expect(buildImportEntityCandidatePersistencePlan({ ...envelope(), [key]: true }).blockers)
        .toEqual(["input_invalid"]);
    }
  });
});
