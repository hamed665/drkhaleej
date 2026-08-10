import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  IMPORT_ENTITY_RESOLUTION_GATE_SCHEMA_VERSION,
  buildImportEntityResolutionPlan,
} from "./import-entity-resolution-gate";

const actorId = "11111111-1111-4111-8111-111111111111";
const draftId = "22222222-2222-4222-8222-222222222222";
const evidenceId = "33333333-3333-4333-8333-333333333333";

function envelope(decision = "approve_for_exact_review") {
  return {
    resolutionSchemaVersion: IMPORT_ENTITY_RESOLUTION_GATE_SCHEMA_VERSION,
    actorProfileId: actorId,
    candidateId: draftId,
    idempotencyKey: `resolution-${decision}`,
    decision: {
      schema_version: "1.2.2",
      policy_version: "entity-policy-2026-01",
      decision_id: "44444444-4444-4444-8444-444444444444",
      draft_id: draftId,
      draft_version: 1,
      draft_hash: "a".repeat(64),
      decision,
      reviewer: { reviewer_id: actorId, role: "platform_admin", session_id: "review-session-proof-001" },
      reason: "Evidence supports the bounded human decision.",
      evidence_ids: [evidenceId],
      decided_at: "2026-08-10T08:00:00.000Z",
    },
  };
}

describe("entity resolution decision gate", () => {
  it("records exact-review approval without mutation, geo, canonical or publish authority", () => {
    const result = buildImportEntityResolutionPlan(envelope());
    expect(result.accepted).toBe(true);
    expect(result.plan).toMatchObject({
      rpcName: "import_record_entity_review_decision",
      decisionRecordingAllowed: true,
      exactReviewApprovalRecorded: true,
      duplicateResolutionRecorded: false,
      candidateMutationAllowed: false,
      duplicateMergeAllowed: false,
      geoVerificationAllowed: false,
      directEntityWriteAllowed: false,
      publishAllowed: false,
    });
    expect(result.plan?.requestHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("accepts an edit as an immutable decision but never edits the Candidate", () => {
    const input = envelope("edit");
    (input.decision as typeof input.decision & { field_edits: unknown[] }).field_edits = [{
      path: "contact.phone",
      expected_value_hash: "b".repeat(64),
      replacement_value: "+96811111111",
      reason: "Corrected against reviewed evidence.",
    }];
    expect(buildImportEntityResolutionPlan(input)).toMatchObject({
      accepted: true,
      plan: { candidateMutationAllowed: false },
    });
  });

  it("requires explicit evidence and an exact entity binding for confirmed duplicates", () => {
    const input = envelope("confirmed_duplicate");
    (input.decision as typeof input.decision & { duplicate_entity_id: string }).duplicate_entity_id =
      "55555555-5555-4555-8555-555555555555";
    expect(buildImportEntityResolutionPlan(input)).toMatchObject({
      accepted: true,
      plan: { duplicateResolutionRecorded: true, duplicateMergeAllowed: false },
    });
    input.decision.evidence_ids = [];
    expect(buildImportEntityResolutionPlan(input).blockers).toEqual(["decision_condition_invalid"]);
  });

  it("fails closed for unimplemented reviewer roles and actor mismatch", () => {
    const role = envelope();
    role.decision.reviewer.role = "entity_reviewer";
    expect(buildImportEntityResolutionPlan(role).blockers).toEqual(["reviewer_role_not_enabled"]);

    const actor = envelope();
    actor.decision.reviewer.reviewer_id = "66666666-6666-4666-8666-666666666666";
    expect(buildImportEntityResolutionPlan(actor).blockers).toEqual(["reviewer_actor_mismatch"]);
  });

  it("rejects conditional payload drift and unknown authority fields", () => {
    const edit = envelope("edit");
    expect(buildImportEntityResolutionPlan(edit).blockers).toEqual(["decision_condition_invalid"]);

    const unknown = { ...envelope(), publishAllowed: true };
    expect(buildImportEntityResolutionPlan(unknown).blockers).toEqual(["input_invalid"]);
  });
});
