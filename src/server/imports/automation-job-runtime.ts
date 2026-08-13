import "server-only";

export const AUTOMATION_JOB_RUNTIME_SCHEMA_VERSION = "drkhaleej.import.automationJobRuntime.v1" as const;
export const AUTOMATION_JOB_CONTRACT_SCHEMA_VERSION = "1.2.2" as const;
export const AUTOMATION_FAMILY = "pharmacy" as const;
export const AUTOMATION_COUNTRY = "om" as const;
export const AUTOMATION_MAX_ATTEMPTS = 3 as const;
export const AUTOMATION_LEASE_SECONDS = 60 as const;
export const AUTOMATION_HEARTBEAT_SECONDS = 20 as const;

export const AUTOMATION_JOB_TYPES = [
  "entity_discovery",
  "entity_fetch",
  "entity_extract",
  "entity_monitor",
  "report",
] as const;

export const AUTOMATION_TERMINAL_RESULTS = [
  "waiting_review",
  "succeeded",
  "failed_retryable",
  "failed_terminal",
  "deferred_budget",
  "cancelled",
] as const;

export type AutomationJobType = (typeof AUTOMATION_JOB_TYPES)[number];
export type AutomationTerminalResult = (typeof AUTOMATION_TERMINAL_RESULTS)[number];

export type AutomationJobCreateInput = {
  runtimeSchemaVersion: typeof AUTOMATION_JOB_RUNTIME_SCHEMA_VERSION;
  contractSchemaVersion: typeof AUTOMATION_JOB_CONTRACT_SCHEMA_VERSION;
  contractPolicyVersion: string;
  jobType: AutomationJobType;
  family: typeof AUTOMATION_FAMILY;
  country: typeof AUTOMATION_COUNTRY;
  sourcePolicyId: string | null;
  targetReferenceHash: string;
  canonicalInputHash: string;
  idempotencyKey: string;
  priority: number;
  maxAttempts: number;
  scheduledFor: string;
  reason: string;
};

export type AutomationLeaseInput = {
  jobId: string;
  workerInstance: string;
  leaseToken: string;
  leaseEpoch: number;
};

export type AutomationJobRuntimeBlocker =
  | "input_invalid"
  | "schema_unsupported"
  | "job_type_not_enabled"
  | "scope_not_enabled"
  | "source_policy_required"
  | "identity_invalid"
  | "lease_invalid"
  | "completion_invalid"
  | "artifact_invalid";

export type AutomationJobCreatePlan = {
  rpcName: "import_automation_create_job";
  params: {
    p_contract_schema_version: string;
    p_contract_policy_version: string;
    p_job_type: AutomationJobType;
    p_family: typeof AUTOMATION_FAMILY;
    p_country: typeof AUTOMATION_COUNTRY;
    p_source_policy_id: string | null;
    p_target_reference_hash: string;
    p_canonical_input_hash: string;
    p_idempotency_key: string;
    p_priority: number;
    p_max_attempts: number;
    p_scheduled_for: string;
    p_reason: string;
  };
  publishAllowed: false;
  rollbackAllowed: false;
  publicPromotionAllowed: false;
  indexPromotionAllowed: false;
  sitemapPromotionAllowed: false;
  aiAllowed: false;
  productionAllowed: false;
};

export type AutomationPlanResult<T> = {
  accepted: boolean;
  plan: T | null;
  blockers: readonly AutomationJobRuntimeBlocker[];
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[a-f0-9]{64}$/;
const leaseTokenPattern = /^[a-f0-9]{64}$/;
const jobTypes = new Set<string>(AUTOMATION_JOB_TYPES);
const terminalResults = new Set<string>(AUTOMATION_TERMINAL_RESULTS);
const createKeys = new Set([
  "runtimeSchemaVersion", "contractSchemaVersion", "contractPolicyVersion", "jobType",
  "family", "country", "sourcePolicyId", "targetReferenceHash", "canonicalInputHash",
  "idempotencyKey", "priority", "maxAttempts", "scheduledFor", "reason",
]);
const leaseKeys = new Set(["jobId", "workerInstance", "leaseToken", "leaseEpoch"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: ReadonlySet<string>): boolean {
  return Object.keys(value).length === expected.size && Object.keys(value).every((key) => expected.has(key));
}

function boundedText(value: unknown, maximum: number, minimum = 1): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function blocked<T>(blocker: AutomationJobRuntimeBlocker): AutomationPlanResult<T> {
  return { accepted: false, plan: null, blockers: [blocker] };
}

export function buildAutomationJobCreatePlan(input: unknown): AutomationPlanResult<AutomationJobCreatePlan> {
  if (!isRecord(input) || !exactKeys(input, createKeys)) return blocked("input_invalid");
  if (input.runtimeSchemaVersion !== AUTOMATION_JOB_RUNTIME_SCHEMA_VERSION ||
    input.contractSchemaVersion !== AUTOMATION_JOB_CONTRACT_SCHEMA_VERSION) return blocked("schema_unsupported");
  if (typeof input.jobType !== "string" || !jobTypes.has(input.jobType)) return blocked("job_type_not_enabled");
  if (input.family !== AUTOMATION_FAMILY || input.country !== AUTOMATION_COUNTRY) return blocked("scope_not_enabled");
  if (!boundedText(input.contractPolicyVersion, 80) || !sha256Pattern.test(String(input.targetReferenceHash)) ||
    !sha256Pattern.test(String(input.canonicalInputHash)) || !boundedText(input.idempotencyKey, 240, 16) ||
    !Number.isInteger(input.priority) || Number(input.priority) < 0 || Number(input.priority) > 100 ||
    input.maxAttempts !== AUTOMATION_MAX_ATTEMPTS || !isDateTime(input.scheduledFor) ||
    !boundedText(input.reason, 500)) return blocked("input_invalid");
  if (input.sourcePolicyId !== null && !boundedText(input.sourcePolicyId, 120)) return blocked("input_invalid");
  if (input.jobType !== "report" && input.sourcePolicyId === null) return blocked("source_policy_required");

  return {
    accepted: true,
    blockers: [],
    plan: {
      rpcName: "import_automation_create_job",
      params: {
        p_contract_schema_version: AUTOMATION_JOB_CONTRACT_SCHEMA_VERSION,
        p_contract_policy_version: input.contractPolicyVersion.trim(),
        p_job_type: input.jobType as AutomationJobType,
        p_family: AUTOMATION_FAMILY,
        p_country: AUTOMATION_COUNTRY,
        p_source_policy_id: input.sourcePolicyId === null ? null : input.sourcePolicyId.trim(),
        p_target_reference_hash: input.targetReferenceHash as string,
        p_canonical_input_hash: input.canonicalInputHash as string,
        p_idempotency_key: input.idempotencyKey.trim(),
        p_priority: Number(input.priority),
        p_max_attempts: AUTOMATION_MAX_ATTEMPTS,
        p_scheduled_for: input.scheduledFor as string,
        p_reason: input.reason.trim(),
      },
      publishAllowed: false,
      rollbackAllowed: false,
      publicPromotionAllowed: false,
      indexPromotionAllowed: false,
      sitemapPromotionAllowed: false,
      aiAllowed: false,
      productionAllowed: false,
    },
  };
}

export function validateAutomationLeaseInput(input: unknown): AutomationPlanResult<AutomationLeaseInput> {
  if (!isRecord(input) || !exactKeys(input, leaseKeys) || !isUuid(input.jobId) ||
    !isUuid(input.workerInstance) || typeof input.leaseToken !== "string" ||
    !leaseTokenPattern.test(input.leaseToken) || !Number.isSafeInteger(input.leaseEpoch) ||
    Number(input.leaseEpoch) < 1) return blocked("lease_invalid");
  return { accepted: true, blockers: [], plan: input as AutomationLeaseInput };
}

export function validateAutomationCompletion(result: unknown, retryDelaySeconds: unknown):
  AutomationPlanResult<{ result: AutomationTerminalResult; retryDelaySeconds: number | null }> {
  if (typeof result !== "string" || !terminalResults.has(result)) return blocked("completion_invalid");
  if (result === "failed_retryable") {
    if (!Number.isInteger(retryDelaySeconds) || Number(retryDelaySeconds) < 5 || Number(retryDelaySeconds) > 300) {
      return blocked("completion_invalid");
    }
    return { accepted: true, blockers: [], plan: { result: result as AutomationTerminalResult, retryDelaySeconds: Number(retryDelaySeconds) } };
  }
  if (retryDelaySeconds !== null) return blocked("completion_invalid");
  return { accepted: true, blockers: [], plan: { result: result as AutomationTerminalResult, retryDelaySeconds: null } };
}

export function validateAutomationArtifact(input: unknown):
  AutomationPlanResult<{ kind: "checkpoint" | "draft" | "evidence" | "report"; payloadHash: string; idempotencyKey: string }> {
  const keys = new Set(["kind", "payloadHash", "idempotencyKey"]);
  if (!isRecord(input) || !exactKeys(input, keys) ||
    !["checkpoint", "draft", "evidence", "report"].includes(String(input.kind)) ||
    !sha256Pattern.test(String(input.payloadHash)) || !boundedText(input.idempotencyKey, 240, 16)) {
    return blocked("artifact_invalid");
  }
  return {
    accepted: true,
    blockers: [],
    plan: {
      kind: input.kind as "checkpoint" | "draft" | "evidence" | "report",
      payloadHash: input.payloadHash as string,
      idempotencyKey: input.idempotencyKey.trim(),
    },
  };
}
