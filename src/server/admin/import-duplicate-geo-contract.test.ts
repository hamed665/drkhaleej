import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  IMPORT_DUPLICATE_GEO_AUTHORITY_MAP,
  IMPORT_DUPLICATE_GEO_POLICY_VERSION,
  IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
  buildImportDuplicateGeoCandidatePlan,
} from "./import-duplicate-geo-contract";

const hash = "a".repeat(64);
const evidence = [{ referenceId: "evidence-1", fieldPaths: ["name", "canonicalGeo.cityId"] }];

function validEnvelope() {
  return {
    schemaVersion: IMPORT_DUPLICATE_GEO_SCHEMA_VERSION,
    policyVersion: IMPORT_DUPLICATE_GEO_POLICY_VERSION,
    draftId: "draft-1",
    draftVersion: 3,
    draftHash: hash,
    entityType: "pharmacy",
    intakeEvidenceReferences: evidence,
    sourceEvidenceReferences: evidence,
    duplicateCandidates: [{
      candidateId: "candidate-1",
      matchedEntityType: "pharmacy",
      matchedEntityId: "entity-1",
      score: 0.82,
      reasons: ["normalized name and city match"],
      status: "requires_review",
      evidenceReferenceIds: ["evidence-1"],
    }],
    geoCandidate: {
      countryId: "country-om",
      governorateId: "region-muscat",
      cityId: "city-muscat",
      areaId: "area-khuwair",
      latitude: 23.588,
      longitude: 58.3829,
      confidence: 0.9,
      status: "candidate",
      evidenceReferenceIds: ["evidence-1"],
    },
  };
}

describe("duplicate / geo candidate contract", () => {
  it("accepts bounded evidence-backed candidates without mutation authority", () => {
    const result = buildImportDuplicateGeoCandidatePlan(validEnvelope());
    expect(result.accepted).toBe(true);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.plan).toMatchObject({
      candidatePersistenceAllowed: true,
      duplicateResolutionAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    });
  });

  it("reconciles governorateId to the existing geo_regions authority", () => {
    const result = buildImportDuplicateGeoCandidatePlan(validEnvelope());
    expect(result.plan?.geoAuthorityMap).toEqual(IMPORT_DUPLICATE_GEO_AUTHORITY_MAP);
    expect(result.plan?.geoAuthorityMap.governorateId).toBe("geo_regions.id");
  });

  it("fails closed on unknown schema and policy versions", () => {
    expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), schemaVersion: "v2" }).blockers).toEqual(["schema_version_unsupported"]);
    expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), policyVersion: "policy-v2" }).blockers).toEqual(["policy_version_unsupported"]);
  });

  it("rejects explicit merge, verification, entity-write and publish claims", () => {
    for (const key of ["mergeAllowed", "geoVerified", "entityWrite", "publishAllowed"]) {
      expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), [key]: true }).blockers).toEqual(["authority_claim_forbidden"]);
    }
  });

  it("rejects confirmed_duplicate as a candidate status", () => {
    const input = validEnvelope();
    input.duplicateCandidates = [{ ...input.duplicateCandidates[0]!, status: "confirmed_duplicate" }];
    expect(buildImportDuplicateGeoCandidatePlan(input).blockers).toEqual(["duplicate_candidate_invalid"]);
  });

  it("requires both P16 intake and P17 source evidence references", () => {
    expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), intakeEvidenceReferences: [] }).blockers).toEqual(["evidence_references_missing"]);
    expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), sourceEvidenceReferences: [] }).blockers).toEqual(["evidence_references_missing"]);
  });

  it("rejects evidence that is not bound across P16, P17 and candidate output", () => {
    expect(buildImportDuplicateGeoCandidatePlan({
      ...validEnvelope(),
      intakeEvidenceReferences: [{ referenceId: "missing", fieldPaths: ["name"] }],
    }).blockers).toEqual(["evidence_reference_unbound"]);
    const input = validEnvelope();
    input.duplicateCandidates = [{ ...input.duplicateCandidates[0]!, evidenceReferenceIds: ["missing"] }];
    expect(buildImportDuplicateGeoCandidatePlan(input).blockers).toEqual(["evidence_reference_unbound"]);
  });

  it("rejects duplicate identities and unsupported entity families", () => {
    const input = validEnvelope();
    input.duplicateCandidates.push({ ...input.duplicateCandidates[0]! });
    expect(buildImportDuplicateGeoCandidatePlan(input).blockers).toEqual(["duplicate_candidate_duplicate"]);
    expect(buildImportDuplicateGeoCandidatePlan({ ...validEnvelope(), entityType: "unknown" }).blockers).toEqual(["entity_type_unsupported"]);
  });

  it("rejects verified or out-of-range geo results", () => {
    const verified = validEnvelope();
    verified.geoCandidate.status = "verified";
    expect(buildImportDuplicateGeoCandidatePlan(verified).blockers).toEqual(["geo_candidate_invalid"]);
    const invalidCoordinates = validEnvelope();
    invalidCoordinates.geoCandidate.latitude = 91;
    expect(buildImportDuplicateGeoCandidatePlan(invalidCoordinates).blockers).toEqual(["geo_candidate_invalid"]);
  });

  it("requires at least one duplicate or geo candidate", () => {
    expect(buildImportDuplicateGeoCandidatePlan({
      ...validEnvelope(),
      duplicateCandidates: [],
      geoCandidate: null,
    }).blockers).toEqual(["candidate_output_missing"]);
  });
});
