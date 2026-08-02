import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  IMPORT_INTAKE_MAX_EVIDENCE_REFERENCES,
  IMPORT_INTAKE_SCHEMA_VERSION,
  convergeImportIntake,
  normalizeAiAssistedImport,
  normalizeApiImport,
  normalizeCsvImport,
  normalizeExcelImport,
  normalizeManualImport,
  selectFirstPrivatePublishFamily,
  type ImportFamilyEvidence,
  type ImportIntakeEvidenceReference,
  type ImportIntakePayload,
} from "./import-intake-convergence";

function validPayload(): ImportIntakePayload {
  return {
    draftId: "draft-001",
    entityType: "pharmacy",
    name: "Canary Pharmacy",
    canonicalGeo: {
      country_code: "om",
      governorate_id: "gov-muscat",
      city_id: "city-muscat",
      area_id: "area-bausher",
      latitude: 23.58,
      longitude: 58.42,
      geo_confidence_score: 100,
      geo_source: "controlled-canary",
      geo_resolution_status: "manually_verified",
      geo_validated: true,
    },
    sourceEvidence: {
      sourceId: "source-001",
      sourceName: "controlled-canary",
      importedBy: "actor-001",
      importedAt: "2026-08-02T01:00:00.000Z",
    },
    duplicateCandidateIds: [],
    requiresManualReview: false,
  };
}

function evidenceReferences(): readonly ImportIntakeEvidenceReference[] {
  return [{ referenceId: "evidence-001", fieldPaths: ["name", "canonicalGeo"] }];
}

function comparable(result: ReturnType<typeof normalizeManualImport>) {
  return Object.fromEntries(
    Object.entries(result.draft!).map(([key, value]) => [
      key,
      key === "source"
        ? "<converged-source>"
        : key === "sourceEvidence"
          ? { ...result.draft!.sourceEvidence, source: "<converged-source>" }
          : value,
    ]),
  );
}

describe("import intake convergence", () => {
  it("normalizes all five entrypoints through the same versioned unified draft shape", () => {
    const payload = validPayload();
    const references = evidenceReferences();
    const results = [
      normalizeManualImport(payload, references),
      normalizeCsvImport(payload, references),
      normalizeExcelImport(payload, references),
      normalizeApiImport(payload, references),
      normalizeAiAssistedImport(payload, references),
    ];

    for (const result of results) {
      expect(result.schemaVersion).toBe(IMPORT_INTAKE_SCHEMA_VERSION);
      expect(result.converged).toBe(true);
      expect(result.directEntityWriteAllowed).toBe(false);
      expect(result.evidenceReferences).toEqual(references);
    }
    expect(comparable(results[1]!)).toEqual(comparable(results[0]!));
    expect(results.map((result) => result.source)).toEqual(["manual", "csv", "excel", "api", "ai_assisted"]);
  });

  it("keeps an incomplete but contract-valid intake as a reviewable draft", () => {
    const result = normalizeManualImport({ ...validPayload(), canonicalGeo: null }, evidenceReferences());

    expect(result.converged).toBe(true);
    expect(result.readyForValidation).toBe(false);
    expect(result.draft).not.toBeNull();
    expect(result.draftBlockers).toEqual(["canonical_geo_missing"]);
  });

  it("rejects an unknown schema version or source without manufacturing a fallback draft", () => {
    const base = { schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION, source: "manual", payload: validPayload(), evidenceReferences: evidenceReferences() };
    const unknownVersion = convergeImportIntake({ ...base, schemaVersion: "drkhaleej.import.intake.v2" });
    const unknownSource = convergeImportIntake({ ...base, source: "crawler" });

    expect(unknownVersion.draft).toBeNull();
    expect(unknownVersion.blockers).toEqual(["schema_version_unsupported"]);
    expect(unknownSource.draft).toBeNull();
    expect(unknownSource.blockers).toEqual(["source_unsupported"]);
    expect(convergeImportIntake({ ...base, payload: { ...validPayload(), draftId: 123 } }).blockers).toEqual(["payload_invalid"]);
  });

  it("rejects missing, unbounded, duplicate, and structurally invalid evidence references", () => {
    const base = { schemaVersion: IMPORT_INTAKE_SCHEMA_VERSION, source: "manual", payload: validPayload() };
    const tooMany = Array.from({ length: IMPORT_INTAKE_MAX_EVIDENCE_REFERENCES + 1 }, (_, index) => ({ referenceId: `evidence-${index}`, fieldPaths: ["name"] }));

    expect(convergeImportIntake({ ...base, evidenceReferences: [] }).blockers).toEqual(["evidence_references_missing"]);
    expect(convergeImportIntake({ ...base, evidenceReferences: tooMany }).blockers).toEqual(["evidence_reference_count_exceeded"]);
    expect(convergeImportIntake({ ...base, evidenceReferences: [{ referenceId: "same", fieldPaths: ["name"] }, { referenceId: "same", fieldPaths: ["legalName"] }] }).blockers).toEqual(["evidence_reference_duplicate"]);
    expect(convergeImportIntake({ ...base, evidenceReferences: [{ referenceId: "raw", fieldPaths: ["name"], rawBody: "forbidden" }] }).blockers).toEqual(["evidence_reference_invalid"]);
  });

  it("forces AI-assisted intake into needs_review even when the producer requests otherwise", () => {
    const result = normalizeAiAssistedImport({ ...validPayload(), requiresManualReview: false }, evidenceReferences());

    expect(result.draft?.status).toBe("needs_review");
    expect(result.draft?.requiresManualReview).toBe(true);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.readyForValidation).toBe(false);
    expect(result.blockers).toContain("manual_review_required");
  });

  it("does not treat draft convergence as publish, approval, or persistence authority", () => {
    const result = normalizeApiImport(validPayload(), evidenceReferences());

    expect(result.converged).toBe(true);
    expect(result.readyForValidation).toBe(true);
    expect(result.draft?.status).toBe("draft");
    expect(result.directEntityWriteAllowed).toBe(false);
  });
});

describe("private publish family selection", () => {
  it("selects the unique lowest-complexity ready family", () => {
    const rows: ImportFamilyEvidence[] = [
      { family: "doctor", schemaReady: true, fixtureReady: true, privateRouteReady: true, projectionReady: true, rollbackShapeReady: true, requiredRelationCount: 4, mutableFieldCount: 16, unresolvedBlockers: [] },
      { family: "hospital", schemaReady: true, fixtureReady: true, privateRouteReady: true, projectionReady: true, rollbackShapeReady: true, requiredRelationCount: 2, mutableFieldCount: 14, unresolvedBlockers: [] },
      { family: "pharmacy", schemaReady: true, fixtureReady: true, privateRouteReady: true, projectionReady: true, rollbackShapeReady: true, requiredRelationCount: 1, mutableFieldCount: 12, unresolvedBlockers: [] },
    ];

    const result = selectFirstPrivatePublishFamily(rows);
    expect(result.selectedFamily).toBe("pharmacy");
    expect(result.blockers).toEqual([]);
  });

  it("fails closed when evidence is missing", () => {
    const result = selectFirstPrivatePublishFamily([]);
    expect(result.selectedFamily).toBeNull();
    expect(result.blockers).toContain("family_evidence_missing:doctor");
    expect(result.blockers).toContain("no_family_ready");
  });
});
