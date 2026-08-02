import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  SOURCE_EVIDENCE_DISPUTE_RETENTION_DAYS,
  SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION,
  SOURCE_EVIDENCE_MAX_EXCERPT_LENGTH,
  buildSourceEvidencePersistencePlan,
  type SourceEvidenceObservationInput,
} from "./import-source-evidence-ledger";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);

function validInput(): SourceEvidenceObservationInput {
  return {
    schemaVersion: SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION,
    idempotencyKey: "observation-proof-001",
    requestHash: HASH_A,
    source: "api",
    sourceIdentity: "licensed-source-001",
    policyStatus: "accepted",
    storageReference: "private-observations/2026/08/observation-001.json",
    contentHash: HASH_A,
    selectedHash: HASH_B,
    observedAt: "2026-08-02T00:00:00.000Z",
    parserVersion: "entity-parser-v1",
    retentionClass: "standard",
    retainUntil: "2026-09-01T00:00:00.000Z",
    retentionReason: null,
    evidence: [{ referenceId: "evidence-001", fieldPaths: ["name", "contact.phone"], excerpt: "Canary Pharmacy", excerptHash: HASH_C }],
  };
}

describe("source evidence ledger contract", () => {
  it("builds a bounded persistence plan and P16-compatible evidence references", () => {
    const result = buildSourceEvidencePersistencePlan(validInput());
    expect(result.blockers).toEqual([]);
    expect(result.accepted).toBe(true);
    expect(result.plan?.intakeEvidenceReferences).toEqual([{ referenceId: "evidence-001", fieldPaths: ["name", "contact.phone"] }]);
    expect(result.plan?.rawPayloadInCanonicalDatabaseAllowed).toBe(false);
  });

  it("allows denied and needs-review policy metadata only", () => {
    for (const policyStatus of ["denied", "needs_review"] as const) {
      const result = buildSourceEvidencePersistencePlan({ ...validInput(), policyStatus, storageReference: null, contentHash: null, selectedHash: null, evidence: [] });
      expect(result.blockers).toEqual([]);
      expect(result.accepted).toBe(false);
      expect(result.plan?.intakeEvidenceReferences).toEqual([]);
    }
  });

  it("rejects raw storage or evidence for denied and needs-review observations", () => {
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), policyStatus: "denied" }).blockers).toEqual(["raw_storage_forbidden"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), policyStatus: "needs_review", storageReference: null, contentHash: null, selectedHash: null }).blockers).toEqual(["evidence_forbidden"]);
  });

  it("requires an object-storage reference and hashes for accepted observations", () => {
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), storageReference: null }).blockers).toEqual(["raw_storage_required"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), contentHash: "not-a-hash" }).blockers).toEqual(["raw_storage_required"]);
  });

  it("enforces standard and dispute retention windows", () => {
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), retainUntil: "2026-09-01T00:00:00.001Z" }).blockers).toEqual(["retention_invalid"]);
    const dispute = buildSourceEvidencePersistencePlan({ ...validInput(), retentionClass: "dispute", retainUntil: "2026-10-31T00:00:00.000Z", retentionReason: "active source dispute" });
    expect(dispute.blockers).toEqual([]);
    expect(SOURCE_EVIDENCE_DISPUTE_RETENTION_DAYS).toBe(90);
  });

  it("rejects duplicate, unbounded, and malformed evidence", () => {
    const item = validInput().evidence[0]!;
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), evidence: [item, item] }).blockers).toEqual(["evidence_duplicate"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), evidence: [{ ...item, excerpt: "x".repeat(SOURCE_EVIDENCE_MAX_EXCERPT_LENGTH + 1) }] }).blockers).toEqual(["evidence_invalid"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), evidence: [{ ...item, rawBody: "forbidden" }] }).blockers).toEqual(["evidence_invalid"]);
  });

  it("fails closed for unknown versions, sources, and policy states", () => {
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), schemaVersion: "v2" }).blockers).toEqual(["schema_version_unsupported"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), source: "crawler" }).blockers).toEqual(["source_unsupported"]);
    expect(buildSourceEvidencePersistencePlan({ ...validInput(), policyStatus: "approved" }).blockers).toEqual(["policy_status_unsupported"]);
  });

  it("forces AI-assisted observations to remain human-review work", () => {
    const result = buildSourceEvidencePersistencePlan({ ...validInput(), source: "ai_assisted" });
    expect(result.requiresHumanReview).toBe(true);
    expect(result.plan?.directEntityWriteAllowed).toBe(false);
    expect(result.plan?.publishAllowed).toBe(false);
  });

  it("canonicalizes bounded identifiers without accepting raw payloads", () => {
    const input = validInput();
    const result = buildSourceEvidencePersistencePlan({ ...input, idempotencyKey: ` ${input.idempotencyKey} `, sourceIdentity: ` ${input.sourceIdentity} ` });
    expect(result.plan?.idempotencyKey).toBe(input.idempotencyKey);
    expect(result.plan?.sourceIdentity).toBe(input.sourceIdentity);
    expect("rawPayload" in (result.plan ?? {})).toBe(false);
  });

  it("never turns accepted evidence into canonical entity or publication authority", () => {
    const result = buildSourceEvidencePersistencePlan(validInput());
    expect(result.plan?.persistenceAllowed).toBe(true);
    expect(result.plan?.directEntityWriteAllowed).toBe(false);
    expect(result.plan?.publishAllowed).toBe(false);
  });
});
