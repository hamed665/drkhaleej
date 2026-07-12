import "server-only";

import type { PharmacyPrivateAdminServerActionExecutor } from "./import-pharmacy-private-admin-server-action";
import {
  executePharmacyPrivateAdminWorkflow,
  type PharmacyPrivateAdminWorkflowPorts,
  type PharmacyPrivateAdminWorkflowResult,
} from "./import-pharmacy-private-admin-workflow";

export type PharmacyPrivateAdminRuntimeControlState = {
  readinessPassed: boolean;
  reviewApproved: boolean;
  auditAvailable: boolean;
};

export type PharmacyPrivateAdminRuntimeExecution = {
  ports: PharmacyPrivateAdminWorkflowPorts;
  controlState: PharmacyPrivateAdminRuntimeControlState;
};

export type PharmacyPrivateAdminRuntimeExecutorDependencies = {
  loadExecution(input: {
    actorId: string;
    entityId: string;
  }): Promise<PharmacyPrivateAdminRuntimeExecution | null>;
  timeoutMs?: number;
};

function failedResult(
  operation: Parameters<PharmacyPrivateAdminServerActionExecutor>[0]["operation"],
  entityId: string,
): PharmacyPrivateAdminWorkflowResult {
  return {
    operation,
    status: "failed",
    entityId,
    blockers: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    executionReference: null,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("pharmacy_admin_runtime_timeout")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createPharmacyPrivateAdminRuntimeExecutor(
  dependencies: PharmacyPrivateAdminRuntimeExecutorDependencies,
): PharmacyPrivateAdminServerActionExecutor {
  const timeoutMs = Math.max(1, Math.min(dependencies.timeoutMs ?? 15_000, 30_000));

  return async (input) => {
    try {
      const execution = await withTimeout(
        dependencies.loadExecution({ actorId: input.actorId, entityId: input.entityId }),
        timeoutMs,
      );
      if (!execution) return failedResult(input.operation, input.entityId);

      return await withTimeout(
        executePharmacyPrivateAdminWorkflow(
          {
            operation: input.operation,
            family: "pharmacy",
            actorId: input.actorId,
            entityIds: [input.entityId],
            environment: "preview",
            grantedPermissions: ["imports.validate", "imports.approve", "imports.publish"],
            readinessPassed: execution.controlState.readinessPassed,
            reviewApproved: execution.controlState.reviewApproved,
            confirmation: input.confirmation,
            publishReference: input.publishReference,
            auditAvailable: execution.controlState.auditAvailable,
          },
          execution.ports,
        ),
        timeoutMs,
      );
    } catch {
      return failedResult(input.operation, input.entityId);
    }
  };
}
