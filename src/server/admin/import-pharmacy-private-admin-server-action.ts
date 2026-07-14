import "server-only";

import type {
  PharmacyPrivateAdminOperation,
  PharmacyPrivateAdminWorkflowResult,
} from "./import-pharmacy-private-admin-workflow";

export type PharmacyPrivateAdminServerActionBlocker =
  | "action_disabled"
  | "operation_not_enabled"
  | "invalid_operation"
  | "invalid_entity"
  | "entity_not_allowed"
  | "invalid_confirmation"
  | "invalid_publish_reference"
  | "environment_not_preview";

export type PharmacyPrivateAdminServerActionResult =
  | { ok: true; workflow: PharmacyPrivateAdminWorkflowResult }
  | { ok: false; blockers: readonly PharmacyPrivateAdminServerActionBlocker[] }
  | { ok: false; blockers: readonly []; workflow: PharmacyPrivateAdminWorkflowResult };

export type PharmacyPrivateAdminServerActionExecutor = (input: {
  operation: PharmacyPrivateAdminOperation;
  actorId: string;
  entityId: string;
  confirmation: string | null;
  publishReference: string | null;
}) => Promise<PharmacyPrivateAdminWorkflowResult>;

export type PharmacyPrivateAdminServerActionDependencies = {
  executionEnabled: boolean;
  enabledOperations: readonly PharmacyPrivateAdminOperation[];
  environment: string | undefined;
  allowedEntityIds: readonly string[];
  execute: PharmacyPrivateAdminServerActionExecutor;
};

const operations = new Set<PharmacyPrivateAdminOperation>([
  "dry_run",
  "review",
  "reserve_private_publish",
  "private_publish",
  "rollback",
]);

function readSingle(formData: FormData, key: string): string | null {
  const values = formData.getAll(key);
  if (values.length !== 1 || typeof values[0] !== "string") return null;
  const value = values[0].trim();
  return value.length > 0 ? value : null;
}

function isOperation(value: string | null): value is PharmacyPrivateAdminOperation {
  return value !== null && operations.has(value as PharmacyPrivateAdminOperation);
}

export function createPharmacyPrivateAdminServerAction(
  dependencies: PharmacyPrivateAdminServerActionDependencies,
) {
  const enabledOperations = new Set(dependencies.enabledOperations);

  return async function runPharmacyPrivateAdminServerAction(input: {
    actorId: string;
    formData: FormData;
  }): Promise<PharmacyPrivateAdminServerActionResult> {
    const operationValue = readSingle(input.formData, "operation");
    const entityId = readSingle(input.formData, "entityId");
    const confirmation = readSingle(input.formData, "confirmation");
    const publishReference = readSingle(input.formData, "publishReference");
    const blockers: PharmacyPrivateAdminServerActionBlocker[] = [];

    if (!dependencies.executionEnabled) blockers.push("action_disabled");
    if (!isOperation(operationValue)) blockers.push("invalid_operation");
    if (isOperation(operationValue) && !enabledOperations.has(operationValue)) blockers.push("operation_not_enabled");
    if (!entityId) blockers.push("invalid_entity");
    if (entityId && !dependencies.allowedEntityIds.includes(entityId)) blockers.push("entity_not_allowed");

    const previewOperation = operationValue === "reserve_private_publish" || operationValue === "private_publish" || operationValue === "rollback";
    if (previewOperation && dependencies.environment !== "preview") blockers.push("environment_not_preview");
    if (operationValue === "reserve_private_publish" && entityId && confirmation !== `RESERVE PRIVATE PUBLISH ${entityId}`) {
      blockers.push("invalid_confirmation");
    }
    if (operationValue === "private_publish" && confirmation !== "PUBLISH PRIVATE PHARMACY") blockers.push("invalid_confirmation");
    if (operationValue === "rollback") {
      if (confirmation !== "ROLLBACK PRIVATE PHARMACY") blockers.push("invalid_confirmation");
      if (!publishReference) blockers.push("invalid_publish_reference");
    }

    const uniqueBlockers = [...new Set(blockers)];
    if (uniqueBlockers.length > 0 || !isOperation(operationValue) || !entityId) return { ok: false, blockers: uniqueBlockers };

    const workflow = await dependencies.execute({ operation: operationValue, actorId: input.actorId, entityId, confirmation, publishReference });
    if (workflow.status !== "completed") return { ok: false, blockers: [], workflow };
    return { ok: true, workflow };
  };
}
