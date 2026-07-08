import "server-only";

import type { ImportAdminCapabilityAction, ImportAdminCapabilityBlocker } from "./import-admin-capability-audit";
import type { ImportAdminActionAuditEvent, ImportAdminActionMutationBoundary } from "./import-admin-action-contract";

export type ImportAdminActionResultStatus = "success" | "blocked" | "failed";
export type ImportAdminActionRetryPolicy = "retry_allowed" | "retry_after_fix" | "retry_not_allowed";

export type ImportAdminActionResultCode =
  | "ok"
  | "blocked_by_capability"
  | "blocked_by_contract"
  | "audit_log_unavailable"
  | "validation_failed"
  | "generation_failed"
  | "publish_failed"
  | "archive_failed"
  | "unexpected_error";

export type ImportAdminActionAuditPayload = {
  event: ImportAdminActionAuditEvent;
  action: ImportAdminCapabilityAction;
  actor_id: string;
  target_id: string | null;
  mutation_boundary: ImportAdminActionMutationBoundary;
  created_at: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type ImportAdminActionResult = {
  action: ImportAdminCapabilityAction;
  status: ImportAdminActionResultStatus;
  code: ImportAdminActionResultCode;
  message: string;
  blockers: readonly ImportAdminCapabilityBlocker[];
  retryPolicy: ImportAdminActionRetryPolicy;
  auditPayload: ImportAdminActionAuditPayload | null;
};

export type ImportAdminActionResultInput = {
  action: ImportAdminCapabilityAction;
  actor_id: string;
  target_id: string | null;
  mutation_boundary: ImportAdminActionMutationBoundary;
  audit_event: ImportAdminActionAuditEvent;
  blockers: readonly ImportAdminCapabilityBlocker[];
  now: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export function buildBlockedAdminActionResult(input: ImportAdminActionResultInput): ImportAdminActionResult {
  return {
    action: input.action,
    status: "blocked",
    code: input.blockers.includes("audit_log_required") ? "audit_log_unavailable" : "blocked_by_capability",
    message: "Admin action is blocked by capability guards.",
    blockers: input.blockers,
    retryPolicy: "retry_after_fix",
    auditPayload: null,
  };
}

export function buildSuccessfulAdminActionResult(input: ImportAdminActionResultInput): ImportAdminActionResult {
  return {
    action: input.action,
    status: "success",
    code: "ok",
    message: "Admin action completed successfully.",
    blockers: [],
    retryPolicy: "retry_not_allowed",
    auditPayload: buildAdminActionAuditPayload(input),
  };
}

export function buildFailedAdminActionResult(
  input: ImportAdminActionResultInput,
  code: Exclude<ImportAdminActionResultCode, "ok" | "blocked_by_capability" | "blocked_by_contract" | "audit_log_unavailable">,
): ImportAdminActionResult {
  return {
    action: input.action,
    status: "failed",
    code,
    message: "Admin action failed before completion.",
    blockers: input.blockers,
    retryPolicy: code === "unexpected_error" ? "retry_allowed" : "retry_after_fix",
    auditPayload: buildAdminActionAuditPayload(input),
  };
}

export function buildAdminActionAuditPayload(input: ImportAdminActionResultInput): ImportAdminActionAuditPayload | null {
  if (input.audit_event === "none") return null;

  return {
    event: input.audit_event,
    action: input.action,
    actor_id: input.actor_id,
    target_id: input.target_id,
    mutation_boundary: input.mutation_boundary,
    created_at: input.now,
    metadata: input.metadata ?? {},
  };
}
