import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { automationOperationScope, executeAutomationControlPlaneOperation, type AutomationRpcPort } from "./automation-control-plane";
import type { AutomationServiceIdentity } from "./automation-service-identity";

const workerInstance = "22222222-2222-4222-8222-222222222222";
const jobId = "11111111-1111-4111-8111-111111111111";

function identity(scope: AutomationServiceIdentity["scope"]): AutomationServiceIdentity {
  const jobBound = !["job:create", "job:read", "job:lease"].includes(scope);
  return {
    issuer: scope.startsWith("job:c") && scope === "job:create"
      ? "urn:drkhaleej:service:n8n-preview"
      : "urn:drkhaleej:service:worker-preview",
    subject: scope.startsWith("job:c") && scope === "job:create"
      ? "urn:drkhaleej:service:n8n-preview"
      : "urn:drkhaleej:service:worker-preview",
    keyId: "worker-preview-20260812-01",
    jti: "33333333-3333-4333-8333-333333333333",
    jtiDigest: "a".repeat(64),
    scope,
    requestHash: "b".repeat(64),
    issuedAt: 1,
    expiresAt: 2,
    workerInstance: scope === "job:create" || scope === "job:read" ? null : workerInstance,
    jobId: jobBound ? jobId : null,
    leaseEpoch: jobBound ? 1 : null,
  };
}

function port(result: Record<string, unknown> = { status: "ok" }): AutomationRpcPort {
  return { rpc: vi.fn(async () => ({ data: result, error: null })) };
}

describe("automation control plane", () => {
  it("maps artifact writes to the narrow exact scope", () => {
    expect(automationOperationScope({ operation: "write_artifact", artifact: { kind: "draft" } })).toBe("draft:write");
    expect(automationOperationScope({ operation: "write_artifact", artifact: { kind: "evidence" } })).toBe("evidence:write");
    expect(automationOperationScope({ operation: "write_artifact", artifact: { kind: "report" } })).toBe("report:write");
  });

  it("calls only the fenced heartbeat RPC with the exact lease binding", async () => {
    const rpc = port();
    const result = await executeAutomationControlPlaneOperation({
      operation: "heartbeat_job",
      jobId,
      workerInstance,
      leaseToken: "c".repeat(64),
      leaseEpoch: 1,
    }, identity("job:heartbeat"), rpc);
    expect(result.status).toBe(200);
    expect(rpc.rpc).toHaveBeenCalledWith("import_automation_heartbeat_job", expect.objectContaining({
      p_job_id: jobId,
      p_worker_instance: workerInstance,
      p_lease_epoch: 1,
    }));
  });

  it("rejects identity/body drift before any RPC", async () => {
    const rpc = port();
    const result = await executeAutomationControlPlaneOperation({
      operation: "heartbeat_job",
      jobId,
      workerInstance,
      leaseToken: "c".repeat(64),
      leaseEpoch: 2,
    }, identity("job:heartbeat"), rpc);
    expect(result).toMatchObject({ status: 403, body: { code: "automation_identity_binding_invalid" } });
    expect(rpc.rpc).not.toHaveBeenCalled();
  });

  it("does not expose publish, rollback, promotion or arbitrary operations", async () => {
    expect(automationOperationScope({ operation: "publish" })).toBeNull();
    const rpc = port();
    const result = await executeAutomationControlPlaneOperation({ operation: "publish" }, identity("job:execute"), rpc);
    expect(result.status).toBe(403);
    expect(rpc.rpc).not.toHaveBeenCalled();
  });

  it("rejects an RPC response that contains protected authority material", async () => {
    const rpc = port({ status: "claimed", serviceRole: "forbidden" });
    const result = await executeAutomationControlPlaneOperation(
      { operation: "claim_job", jobTypes: ["report"] }, identity("job:lease"), rpc,
    );
    expect(result).toMatchObject({ status: 500, body: { code: "automation_rpc_response_invalid" } });
  });
});
