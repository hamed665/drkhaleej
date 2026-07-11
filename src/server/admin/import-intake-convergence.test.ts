import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  normalizeCsvImport,
  normalizeExcelImport,
  normalizeManualImport,
  selectFirstPrivatePublishFamily,
  type ImportFamilyEvidence,
  type ImportIntakePayload,
} from "./import-intake-convergence";

function validPayload(): ImportIntakePayload {
  return {
    draftId: "draft-001",
    entityType: "pharmacy",
    name: "Canary Pharmacy",
    canonicalGeo: {} as ImportIntakePayload["canonicalGeo"],
    sourceEvidence: {
      sourceId: "source-001",
      sourceName: "controlled-canary",
      importedBy: "actor-001",
      importedAt: "2026-07-11T18:00:00.000Z",
    },
    duplicateCandidateIds: [],
    requiresManualReview: false,
  };
}

function comparable(result: ReturnType<typeof normalizeManualImport>) {
  return {
    ...result.draft,
    source: undefined,
    sourceEvidence: { ...result.draft.sourceEvidence, source: undefined },
  };
}

describe("import intake convergence", () => {
  it("normalizes manual, CSV, and Excel through the same unified draft shape", () => {
    const payload = validPayload();
    const manual = normalizeManualImport(payload);
    const csv = normalizeCsvImport(payload);
    const excel = normalizeExcelImport(payload);

    expect(manual.converged).toBe(true);
    expect(csv.converged).toBe(true);
    expect(excel.converged).toBe(true);
    expect(comparable(csv)).toEqual(comparable(manual));
    expect(comparable(excel)).toEqual(comparable(manual));
    expect([manual, csv, excel].every((result) => result.directEntityWriteAllowed === false)).toBe(true);
    expect(manual.draft.source).toBe("manual");
    expect(csv.draft.source).toBe("csv");
    expect(excel.draft.source).toBe("excel");
  });

  it("returns the same blockers for equivalent invalid payloads", () => {
    const payload = { ...validPayload(), canonicalGeo: null };
    expect(normalizeManualImport(payload).blockers).toEqual(["canonical_geo_missing"]);
    expect(normalizeCsvImport(payload).blockers).toEqual(["canonical_geo_missing"]);
    expect(normalizeExcelImport(payload).blockers).toEqual(["canonical_geo_missing"]);
  });
});

describe("private publish family selection", () => {
  it("selects the unique lowest-complexity ready family", () => {
    const rows: ImportFamilyEvidence[] = [
      {
        family: "doctor",
        schemaReady: true,
        fixtureReady: true,
        privateRouteReady: true,
        projectionReady: true,
        rollbackShapeReady: true,
        requiredRelationCount: 4,
        mutableFieldCount: 16,
        unresolvedBlockers: [],
      },
      {
        family: "hospital",
        schemaReady: true,
        fixtureReady: true,
        privateRouteReady: true,
        projectionReady: true,
        rollbackShapeReady: true,
        requiredRelationCount: 2,
        mutableFieldCount: 14,
        unresolvedBlockers: [],
      },
      {
        family: "pharmacy",
        schemaReady: true,
        fixtureReady: true,
        privateRouteReady: true,
        projectionReady: true,
        rollbackShapeReady: true,
        requiredRelationCount: 1,
        mutableFieldCount: 12,
        unresolvedBlockers: [],
      },
    ];

    const result = selectFirstPrivatePublishFamily(rows);
    expect(result.selectedFamily).toBe("pharmacy");
    expect(result.blockers).toEqual([]);
  });

  it("fails closed when evidence is missing or tied", () => {
    const result = selectFirstPrivatePublishFamily([]);
    expect(result.selectedFamily).toBeNull();
    expect(result.blockers).toContain("family_evidence_missing:doctor");
    expect(result.blockers).toContain("no_family_ready");
  });
});
