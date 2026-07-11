import "server-only";

export type ImportPublishExecutorInfrastructureBlocker =
  | "controlled_publish_contract_not_ready"
  | "audit_store_unavailable"
  | "idempotency_store_unavailable"
  | "rollback_store_unavailable"
  | "transaction_coordinator_unavailable"
  | "optimistic_lock_unavailable"
  | "audit_event_schema_missing"
  | "idempotency_ttl_invalid"
  | "rollback_retention_invalid"
  | "executor_not_enabled";

export type ImportPublishExecutorInfrastructureInput = {
  controlledPublishContractReady: boolean;
  auditStoreAvailable: boolean;
  idempotencyStoreAvailable: boolean;
  rollbackStoreAvailable: boolean;
  transactionCoordinatorAvailable: boolean;
  optimisticLockAvailable: boolean;
  auditEventSchemaVersion: string;
  idempotencyTtlHours: number;
  rollbackRetentionDays: number;
  executorEnabled: false;
};

export type ImportPublishExecutorInfrastructurePlan = {
  mode: "infrastructure_contract_only";
  infrastructureReady: boolean;
  executionReady: false;
  mutationEnabled: false;
  bulkAllowed: false;
  blockers: readonly ImportPublishExecutorInfrastructureBlocker[];
  auditStoreRequired: true;
  idempotencyStoreRequired: true;
  rollbackStoreRequired: true;
  transactionCoordinatorRequired: true;
  optimisticLockRequired: true;
};

export const IMPORT_PUBLISH_IDEMPOTENCY_TTL_MIN_HOURS = 24;
export const IMPORT_PUBLISH_IDEMPOTENCY_TTL_MAX_HOURS = 168;
export const IMPORT_PUBLISH_ROLLBACK_RETENTION_MIN_DAYS = 30;
export const IMPORT_PUBLISH_ROLLBACK_RETENTION_MAX_DAYS = 365;

export function getImportPublishExecutorInfrastructureBlockers(
  input: ImportPublishExecutorInfrastructureInput,
): readonly ImportPublishExecutorInfrastructureBlocker[] {
  const blockers: ImportPublishExecutorInfrastructureBlocker[] = [];

  if (!input.controlledPublishContractReady) blockers.push("controlled_publish_contract_not_ready");
  if (!input.auditStoreAvailable) blockers.push("audit_store_unavailable");
  if (!input.idempotencyStoreAvailable) blockers.push("idempotency_store_unavailable");
  if (!input.rollbackStoreAvailable) blockers.push("rollback_store_unavailable");
  if (!input.transactionCoordinatorAvailable) blockers.push("transaction_coordinator_unavailable");
  if (!input.optimisticLockAvailable) blockers.push("optimistic_lock_unavailable");
  if (!input.auditEventSchemaVersion.trim()) blockers.push("audit_event_schema_missing");
  if (
    input.idempotencyTtlHours < IMPORT_PUBLISH_IDEMPOTENCY_TTL_MIN_HOURS ||
    input.idempotencyTtlHours > IMPORT_PUBLISH_IDEMPOTENCY_TTL_MAX_HOURS
  ) {
    blockers.push("idempotency_ttl_invalid");
  }
  if (
    input.rollbackRetentionDays < IMPORT_PUBLISH_ROLLBACK_RETENTION_MIN_DAYS ||
    input.rollbackRetentionDays > IMPORT_PUBLISH_ROLLBACK_RETENTION_MAX_DAYS
  ) {
    blockers.push("rollback_retention_invalid");
  }
  if (!input.executorEnabled) blockers.push("executor_not_enabled");

  return Array.from(new Set(blockers));
}

export function getImportPublishExecutorInfrastructurePlan(
  input: ImportPublishExecutorInfrastructureInput,
): ImportPublishExecutorInfrastructurePlan {
  const blockers = getImportPublishExecutorInfrastructureBlockers(input);
  const infrastructureBlockers = blockers.filter((blocker) => blocker !== "executor_not_enabled");

  return {
    mode: "infrastructure_contract_only",
    infrastructureReady: infrastructureBlockers.length === 0,
    executionReady: false,
    mutationEnabled: false,
    bulkAllowed: false,
    blockers,
    auditStoreRequired: true,
    idempotencyStoreRequired: true,
    rollbackStoreRequired: true,
    transactionCoordinatorRequired: true,
    optimisticLockRequired: true,
  };
}

export function isImportPublishExecutorInfrastructureReady(
  input: ImportPublishExecutorInfrastructureInput,
): boolean {
  return getImportPublishExecutorInfrastructurePlan(input).infrastructureReady;
}
