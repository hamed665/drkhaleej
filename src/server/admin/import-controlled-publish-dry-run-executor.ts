import "server-only";

import { createHash } from "node:crypto";

export type ImportControlledPublishDryRunBlocker =
  | "controlled_publish_contract_not_ready"
  | "executor_infrastructure_not_ready"
  | "persistence_schema_not_ready"
  | "entity_id_missing"
  | "actor_id_missing"
  | "idempotency_key_missing"
  | "expected_version_missing"
  | "current_version_missing"
  | "version_mismatch"
  | "canonical_route_missing"
  | "projection_version_missing"
  | "snapshot_incomplete";

export type ImportControlledPublishState = {
  visibility: "private" | "public";
  indexPolicy: "noindex" | "index";
  sitemapPolicy: "excluded" | "included";
  publishStatus: string;
  publicReady: boolean;
  projectionVersion: string;
  canonicalRoute: string;
};

export type ImportControlledPublishDryRunInput = {
  controlledPublishContractReady: boolean;
  executorInfrastructureReady: boolean;
  persistenceSchemaReady: boolean;
  entityId: string;
  actorId: string;
  idempotencyKey: string;
  expectedVersion: string;
  currentVersion: string;
  currentState: ImportControlledPublishState;
  desiredState: ImportControlledPublishState;
  auditSchemaVersion: string;
};

export type ImportControlledPublishDryRunPlan = {
  mode: "dry_run_only";
  planReady: boolean;
  executionReady: false;
  mutationEnabled: false;
  bulkAllowed: false;
  requestHash: string;
  blockers: readonly ImportControlledPublishDryRunBlocker[];
  proposedChanges: readonly {
    field: keyof ImportControlledPublishState;
    before: string | boolean;
    after: string | boolean;
  }[];
  rollbackPreview: ImportControlledPublishState;
  auditPreview: {
    eventType: "dry_run_reviewed";
    outcome: "pending";
    schemaVersion: string;
    entityId: string;
    actorId: string;
    idempotencyKey: string;
    expectedVersion: string;
    currentVersion: string;
    requestHash: string;
  };
  databaseOperations: readonly [];
};

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function hasCompleteState(state: ImportControlledPublishState): boolean {
  return Boolean(
    state.publishStatus.trim() &&
      state.projectionVersion.trim() &&
      state.canonicalRoute.trim(),
  );
}

export function getImportControlledPublishDryRunPlan(
  input: ImportControlledPublishDryRunInput,
): ImportControlledPublishDryRunPlan {
  const blockers: ImportControlledPublishDryRunBlocker[] = [];
  if (!input.controlledPublishContractReady) blockers.push("controlled_publish_contract_not_ready");
  if (!input.executorInfrastructureReady) blockers.push("executor_infrastructure_not_ready");
  if (!input.persistenceSchemaReady) blockers.push("persistence_schema_not_ready");
  if (!input.entityId.trim()) blockers.push("entity_id_missing");
  if (!input.actorId.trim()) blockers.push("actor_id_missing");
  if (!input.idempotencyKey.trim()) blockers.push("idempotency_key_missing");
  if (!input.expectedVersion.trim()) blockers.push("expected_version_missing");
  if (!input.currentVersion.trim()) blockers.push("current_version_missing");
  if (input.expectedVersion !== input.currentVersion) blockers.push("version_mismatch");
  if (!input.desiredState.canonicalRoute.trim()) blockers.push("canonical_route_missing");
  if (!input.desiredState.projectionVersion.trim()) blockers.push("projection_version_missing");
  if (!hasCompleteState(input.currentState)) blockers.push("snapshot_incomplete");

  const proposedChanges = (Object.keys(input.currentState) as (keyof ImportControlledPublishState)[])
    .filter((field) => input.currentState[field] !== input.desiredState[field])
    .map((field) => ({
      field,
      before: input.currentState[field],
      after: input.desiredState[field],
    }));

  const requestHash = sha256({
    entityId: input.entityId,
    actorId: input.actorId,
    idempotencyKey: input.idempotencyKey,
    expectedVersion: input.expectedVersion,
    currentVersion: input.currentVersion,
    currentState: input.currentState,
    desiredState: input.desiredState,
    auditSchemaVersion: input.auditSchemaVersion,
  });

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    mode: "dry_run_only",
    planReady: uniqueBlockers.length === 0,
    executionReady: false,
    mutationEnabled: false,
    bulkAllowed: false,
    requestHash,
    blockers: uniqueBlockers,
    proposedChanges,
    rollbackPreview: { ...input.currentState },
    auditPreview: {
      eventType: "dry_run_reviewed",
      outcome: "pending",
      schemaVersion: input.auditSchemaVersion,
      entityId: input.entityId,
      actorId: input.actorId,
      idempotencyKey: input.idempotencyKey,
      expectedVersion: input.expectedVersion,
      currentVersion: input.currentVersion,
      requestHash,
    },
    databaseOperations: [],
  };
}

export function isImportControlledPublishDryRunPlanReady(
  input: ImportControlledPublishDryRunInput,
): boolean {
  return getImportControlledPublishDryRunPlan(input).planReady;
}
