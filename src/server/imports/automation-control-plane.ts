import "server-only";

import type { AutomationServiceIdentity, AutomationServiceScope } from "./automation-service-identity";
import {
  buildAutomationJobCreatePlan,
  validateAutomationArtifact,
  validateAutomationCompletion,
  validateAutomationLeaseInput,
} from "./automation-job-runtime";

export type AutomationRpcResponse = { data: unknown; error: { code?: string; message?: string } | null };
export type AutomationRpcPort = { rpc(name: string, params: Record<string, unknown>): Promise<AutomationRpcResponse> };

export type AutomationControlPlaneResult = {
  status: number;
  body: Record<string, unknown>;
};

const operationScopes = {
  create_job: "job:create",
  read_job: "job:read",
  claim_job: "job:lease",
  start_job: "job:execute",
  heartbeat_job: "job:heartbeat",
  write_artifact: "job:execute",
  complete_job: "job:complete",
} as const satisfies Record<string, AutomationServiceScope>;

type AutomationOperation = keyof typeof operationScopes;

const sha256Pattern = /^[a-f0-9]{64}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, maximum: number, minimum = 1): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length && Object.keys(value).every((key) => expected.includes(key));
}

function rejected(code: string, status = 400): AutomationControlPlaneResult {
  return { status, body: { ok: false, code } };
}

function boundedRpcResult(data: unknown): Record<string, unknown> | null {
  if (!isRecord(data)) return null;
  const serialized = JSON.stringify(data);
  if (serialized.length > 16_000 || /leaseTokenDigest|serviceRole|authorization|privateKey/i.test(serialized)) return null;
  return data;
}

export function automationOperationScope(body: unknown): AutomationServiceScope | null {
  if (!isRecord(body) || typeof body.operation !== "string" || !(body.operation in operationScopes)) return null;
  if (body.operation === "write_artifact" && isRecord(body.artifact)) {
    if (body.artifact.kind === "draft") return "draft:write";
    if (body.artifact.kind === "evidence") return "evidence:write";
    if (body.artifact.kind === "report") return "report:write";
  }
  return operationScopes[body.operation as AutomationOperation];
}

function assertIdentityBinding(body: Record<string, unknown>, identity: AutomationServiceIdentity): boolean {
  if (["start_job", "heartbeat_job", "write_artifact", "complete_job"].includes(String(body.operation))) {
    return body.jobId === identity.jobId && body.workerInstance === identity.workerInstance &&
      body.leaseEpoch === identity.leaseEpoch;
  }
  return body.operation !== "claim_job" || identity.workerInstance !== null;
}

function leaseEnvelope(body: Record<string, unknown>) {
  return {
    jobId: body.jobId,
    workerInstance: body.workerInstance,
    leaseToken: body.leaseToken,
    leaseEpoch: body.leaseEpoch,
  };
}

async function callRpc(port: AutomationRpcPort, name: string, params: Record<string, unknown>): Promise<AutomationControlPlaneResult> {
  const response = await port.rpc(name, params);
  if (response.error) return rejected("automation_rpc_rejected", 409);
  const data = boundedRpcResult(response.data);
  if (data === null) return rejected("automation_rpc_response_invalid", 500);
  const status = data.status;
  if (status === "rejected" || status === "conflict" || status === "stale_lease") return rejected(String(data.reason ?? status), 409);
  return { status: 200, body: { ok: true, result: data } };
}

export async function acceptAutomationServiceRequest(
  port: AutomationRpcPort,
  identity: AutomationServiceIdentity,
  method: string,
  normalizedPath: string,
): Promise<AutomationControlPlaneResult | null> {
  const accepted = await callRpc(port, "import_automation_accept_service_request", {
    p_issuer: identity.issuer,
    p_subject: identity.subject,
    p_key_id: identity.keyId,
    p_jti_digest: identity.jtiDigest,
    p_scope: identity.scope,
    p_method: method,
    p_path: normalizedPath,
    p_request_hash: identity.requestHash,
    p_worker_instance: identity.workerInstance,
    p_job_id: identity.jobId,
    p_lease_epoch: identity.leaseEpoch,
    p_token_expires_at: new Date(identity.expiresAt * 1_000).toISOString(),
  });
  return accepted.status === 200 ? null : accepted;
}

export async function executeAutomationControlPlaneOperation(
  body: unknown,
  identity: AutomationServiceIdentity,
  port: AutomationRpcPort,
): Promise<AutomationControlPlaneResult> {
  if (!isRecord(body) || !assertIdentityBinding(body, identity)) return rejected("automation_identity_binding_invalid", 403);
  const expectedScope = automationOperationScope(body);
  if (expectedScope === null || expectedScope !== identity.scope) return rejected("automation_scope_invalid", 403);

  switch (body.operation) {
    case "create_job": {
      if (!exactKeys(body, ["operation", "job"])) return rejected("automation_request_invalid");
      const result = buildAutomationJobCreatePlan(body.job);
      if (!result.accepted || result.plan === null) return rejected(result.blockers[0] ?? "automation_request_invalid");
      return callRpc(port, "import_automation_create_job", {
        p_request_subject: identity.subject,
        ...result.plan.params,
      });
    }
    case "read_job": {
      if (!exactKeys(body, ["operation", "jobId"]) || typeof body.jobId !== "string" || !uuidPattern.test(body.jobId)) {
        return rejected("automation_request_invalid");
      }
      return callRpc(port, "import_automation_job_readback", { p_job_id: body.jobId });
    }
    case "claim_job": {
      if (!exactKeys(body, ["operation", "jobTypes"]) || identity.workerInstance === null ||
        !Array.isArray(body.jobTypes) || body.jobTypes.length !== 1 || body.jobTypes[0] !== "report") {
        return rejected("automation_request_invalid");
      }
      return callRpc(port, "import_automation_claim_job", {
        p_worker_subject: identity.subject,
        p_worker_instance: identity.workerInstance,
        p_job_types: ["report"],
      });
    }
    case "start_job":
    case "heartbeat_job": {
      if (!exactKeys(body, ["operation", "jobId", "workerInstance", "leaseToken", "leaseEpoch"])) {
        return rejected("automation_request_invalid");
      }
      const lease = validateAutomationLeaseInput(leaseEnvelope(body));
      if (!lease.accepted || lease.plan === null) return rejected("automation_lease_invalid");
      return callRpc(port, body.operation === "start_job" ? "import_automation_start_job" : "import_automation_heartbeat_job", {
        p_job_id: lease.plan.jobId,
        p_worker_subject: identity.subject,
        p_worker_instance: lease.plan.workerInstance,
        p_lease_token: lease.plan.leaseToken,
        p_lease_epoch: lease.plan.leaseEpoch,
      });
    }
    case "write_artifact": {
      if (!exactKeys(body, ["operation", "jobId", "workerInstance", "leaseToken", "leaseEpoch", "artifact"])) {
        return rejected("automation_request_invalid");
      }
      const lease = validateAutomationLeaseInput(leaseEnvelope(body));
      const artifact = validateAutomationArtifact(body.artifact);
      if (!lease.accepted || lease.plan === null || !artifact.accepted || artifact.plan === null) {
        return rejected("automation_artifact_invalid");
      }
      return callRpc(port, "import_automation_write_job_artifact", {
        p_job_id: lease.plan.jobId,
        p_worker_subject: identity.subject,
        p_worker_instance: lease.plan.workerInstance,
        p_lease_token: lease.plan.leaseToken,
        p_lease_epoch: lease.plan.leaseEpoch,
        p_scope: identity.scope,
        p_artifact_kind: artifact.plan.kind,
        p_payload_hash: artifact.plan.payloadHash,
        p_idempotency_key: artifact.plan.idempotencyKey,
      });
    }
    case "complete_job": {
      if (!exactKeys(body, [
        "operation", "jobId", "workerInstance", "leaseToken", "leaseEpoch", "result",
        "retryDelaySeconds", "completionIdempotencyKey", "outputHash",
      ])) return rejected("automation_request_invalid");
      const lease = validateAutomationLeaseInput(leaseEnvelope(body));
      const completion = validateAutomationCompletion(body.result, body.retryDelaySeconds);
      if (!lease.accepted || lease.plan === null || !completion.accepted || completion.plan === null ||
        !boundedText(body.completionIdempotencyKey, 240, 16) || typeof body.outputHash !== "string" ||
        !sha256Pattern.test(body.outputHash)) return rejected("automation_completion_invalid");
      return callRpc(port, "import_automation_complete_job", {
        p_job_id: lease.plan.jobId,
        p_worker_subject: identity.subject,
        p_worker_instance: lease.plan.workerInstance,
        p_lease_token: lease.plan.leaseToken,
        p_lease_epoch: lease.plan.leaseEpoch,
        p_result: completion.plan.result,
        p_retry_delay_seconds: completion.plan.retryDelaySeconds,
        p_completion_idempotency_key: body.completionIdempotencyKey.trim(),
        p_output_hash: body.outputHash,
      });
    }
    default:
      return rejected("automation_operation_not_enabled", 403);
  }
}
