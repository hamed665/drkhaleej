import "server-only";

import {
  getImportControlledPublishDryRunPlan,
  type ImportControlledPublishDryRunInput,
  type ImportControlledPublishDryRunPlan,
} from "./import-controlled-publish-dry-run-executor";
import type {
  ImportPrivatePublishPersistenceAdapter,
  ImportPublishPersistenceTransactionRequest,
  ImportPublishPersistenceTransactionResult,
} from "./import-private-persistence-adapter";

export const IMPORT_CONTROLLED_PUBLISH_EXECUTOR_ENABLED = false as const;

export type ImportControlledPublishOrchestratorBlocker =
  | "dry_run_plan_not_ready"
  | "executor_disabled"
  | "reservation_expiry_missing"
  | "rollback_expiry_missing";

export type ImportControlledPublishOrchestratorInput = {
  dryRunInput: ImportControlledPublishDryRunInput;
  reservationExpiresAt: string;
  rollbackExpiresAt: string;
};

export type ImportControlledPublishOrchestratorResult = {
  mode: "disabled_orchestration";
  dryRunPlan: ImportControlledPublishDryRunPlan;
  orchestrationReady: boolean;
  reservationAttempted: boolean;
  reservationResult: ImportPublishPersistenceTransactionResult | null;
  executionReady: false;
  mutationEnabled: false;
  terminalPersistenceAllowed: false;
  bulkAllowed: false;
  blockers: readonly ImportControlledPublishOrchestratorBlocker[];
  entityOperations: readonly [];
};

function buildReservationRequest(
  input: ImportControlledPublishOrchestratorInput,
  plan: ImportControlledPublishDryRunPlan,
): ImportPublishPersistenceTransactionRequest {
  return {
    entityId: input.dryRunInput.entityId,
    actorId: input.dryRunInput.actorId,
    idempotencyKey: input.dryRunInput.idempotencyKey,
    requestHash: plan.requestHash,
    expectedVersion: input.dryRunInput.expectedVersion,
    rollbackSnapshot: plan.rollbackPreview,
    auditSchemaVersion: input.dryRunInput.auditSchemaVersion,
    reservationExpiresAt: input.reservationExpiresAt,
    rollbackExpiresAt: input.rollbackExpiresAt,
  };
}

export async function orchestrateControlledSinglePublish(
  input: ImportControlledPublishOrchestratorInput,
  adapter: ImportPrivatePublishPersistenceAdapter,
): Promise<ImportControlledPublishOrchestratorResult> {
  const dryRunPlan = getImportControlledPublishDryRunPlan(input.dryRunInput);
  const blockers: ImportControlledPublishOrchestratorBlocker[] = [];

  if (!dryRunPlan.planReady) blockers.push("dry_run_plan_not_ready");
  if (!input.reservationExpiresAt.trim()) blockers.push("reservation_expiry_missing");
  if (!input.rollbackExpiresAt.trim()) blockers.push("rollback_expiry_missing");
  if (!IMPORT_CONTROLLED_PUBLISH_EXECUTOR_ENABLED) blockers.push("executor_disabled");

  const uniqueBlockers = [...new Set(blockers)];
  const orchestrationReady = uniqueBlockers.every((blocker) => blocker === "executor_disabled");

  if (!dryRunPlan.planReady || !input.reservationExpiresAt.trim() || !input.rollbackExpiresAt.trim()) {
    return {
      mode: "disabled_orchestration",
      dryRunPlan,
      orchestrationReady: false,
      reservationAttempted: false,
      reservationResult: null,
      executionReady: false,
      mutationEnabled: false,
      terminalPersistenceAllowed: false,
      bulkAllowed: false,
      blockers: uniqueBlockers,
      entityOperations: [],
    };
  }

  if (!IMPORT_CONTROLLED_PUBLISH_EXECUTOR_ENABLED) {
    return {
      mode: "disabled_orchestration",
      dryRunPlan,
      orchestrationReady,
      reservationAttempted: false,
      reservationResult: null,
      executionReady: false,
      mutationEnabled: false,
      terminalPersistenceAllowed: false,
      bulkAllowed: false,
      blockers: uniqueBlockers,
      entityOperations: [],
    };
  }

  const reservationResult = await adapter.runReservationSnapshotAuditTransaction(
    buildReservationRequest(input, dryRunPlan),
  );

  return {
    mode: "disabled_orchestration",
    dryRunPlan,
    orchestrationReady,
    reservationAttempted: true,
    reservationResult,
    executionReady: false,
    mutationEnabled: false,
    terminalPersistenceAllowed: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
    entityOperations: [],
  };
}
