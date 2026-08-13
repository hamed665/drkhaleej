import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AUTOMATION_JOB_RUNTIME_SCHEMA_VERSION,
  buildAutomationJobCreatePlan,
  validateAutomationArtifact,
  validateAutomationCompletion,
  validateAutomationLeaseInput,
} from "./automation-job-runtime";

const hash = "a".repeat(64);

function createInput() {
  return {
    runtimeSchemaVersion: AUTOMATION_JOB_RUNTIME_SCHEMA_VERSION,
    contractSchemaVersion: "1.2.2",
    contractPolicyVersion: "automation-policy-2026-08",
    jobType: "entity_fetch",
    family: "pharmacy",
    country: "om",
    sourcePolicyId: "source-policy-preview-001",
    targetReferenceHash: hash,
    canonicalInputHash: "b".repeat(64),
    idempotencyKey: "automation-job-preview-0001",
    priority: 50,
    maxAttempts: 3,
    scheduledFor: "2026-08-12T20:00:00.000Z",
    reason: "Preview-only bounded fetch candidate.",
  };
}

describe("automation job runtime contract", () => {
  it("creates only the Pharmacy/OM fail-closed RPC plan and carries no downstream authority", () => {
    const result = buildAutomationJobCreatePlan(createInput());
    expect(result).toMatchObject({
      accepted: true,
      plan: {
        rpcName: "import_automation_create_job",
        publishAllowed: false,
        rollbackAllowed: false,
        publicPromotionAllowed: false,
        indexPromotionAllowed: false,
        sitemapPromotionAllowed: false,
        aiAllowed: false,
        productionAllowed: false,
      },
    });
  });

  it("rejects Content jobs, future families, hidden fields and missing source policy", () => {
    expect(buildAutomationJobCreatePlan({ ...createInput(), jobType: "content_draft" }).blockers)
      .toEqual(["job_type_not_enabled"]);
    expect(buildAutomationJobCreatePlan({ ...createInput(), family: "hospital" }).blockers)
      .toEqual(["scope_not_enabled"]);
    expect(buildAutomationJobCreatePlan({ ...createInput(), publishAllowed: true }).blockers)
      .toEqual(["input_invalid"]);
    expect(buildAutomationJobCreatePlan({ ...createInput(), sourcePolicyId: null }).blockers)
      .toEqual(["source_policy_required"]);
  });

  it("requires a 256-bit lease token, boot-unique Worker UUID and monotonic epoch", () => {
    const lease = {
      jobId: "11111111-1111-4111-8111-111111111111",
      workerInstance: "22222222-2222-4222-8222-222222222222",
      leaseToken: "c".repeat(64),
      leaseEpoch: 1,
    };
    expect(validateAutomationLeaseInput(lease).accepted).toBe(true);
    expect(validateAutomationLeaseInput({ ...lease, leaseEpoch: 0 }).blockers).toEqual(["lease_invalid"]);
    expect(validateAutomationLeaseInput({ ...lease, leaseToken: "raw-token" }).blockers).toEqual(["lease_invalid"]);
  });

  it("bounds retry backoff and never accepts an implicit terminal state", () => {
    expect(validateAutomationCompletion("failed_retryable", 20).accepted).toBe(true);
    expect(validateAutomationCompletion("failed_retryable", 0).blockers).toEqual(["completion_invalid"]);
    expect(validateAutomationCompletion("published", null).blockers).toEqual(["completion_invalid"]);
    expect(validateAutomationCompletion("succeeded", 20).blockers).toEqual(["completion_invalid"]);
  });

  it("stores only bounded artifact hashes, never raw payloads", () => {
    expect(validateAutomationArtifact({ kind: "evidence", payloadHash: hash, idempotencyKey: "artifact-preview-0001" }).accepted)
      .toBe(true);
    expect(validateAutomationArtifact({ kind: "evidence", payloadHash: hash, idempotencyKey: "artifact-preview-0001", raw: "secret" }).blockers)
      .toEqual(["artifact_invalid"]);
  });
});
