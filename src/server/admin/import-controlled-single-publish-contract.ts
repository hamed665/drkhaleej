import "server-only";

export type ImportControlledSinglePublishBlocker =
  | "entity_id_missing"
  | "multiple_targets_not_allowed"
  | "actor_id_missing"
  | "idempotency_key_missing"
  | "expected_version_missing"
  | "readiness_not_ready"
  | "manual_publish_flow_blocked"
  | "sitemap_not_eligible"
  | "audit_log_unavailable"
  | "rollback_snapshot_missing"
  | "transaction_boundary_missing"
  | "dry_run_not_reviewed"
  | "mutation_not_enabled";

export type ImportControlledSinglePublishRequest = {
  entityIds: readonly string[];
  actorId: string;
  idempotencyKey: string;
  expectedVersion: string;
  readinessReady: boolean;
  manualPublishFlowReady: boolean;
  sitemapEligible: boolean;
  auditLogAvailable: boolean;
  rollbackSnapshotId: string | null;
  transactionBoundary: "single_transaction" | null;
  dryRunReviewed: boolean;
  mutationEnabled: false;
};

export type ImportControlledSinglePublishPlan = {
  mode: "contract_only";
  targetEntityId: string | null;
  contractReady: boolean;
  executionReady: false;
  blockers: readonly ImportControlledSinglePublishBlocker[];
  idempotencyKey: string;
  expectedVersion: string;
  auditRequired: true;
  rollbackRequired: true;
  transactionRequired: true;
  bulkAllowed: false;
};

export function getImportControlledSinglePublishBlockers(
  input: ImportControlledSinglePublishRequest,
): readonly ImportControlledSinglePublishBlocker[] {
  const blockers: ImportControlledSinglePublishBlocker[] = [];

  if (input.entityIds.length === 0 || !input.entityIds[0]?.trim()) blockers.push("entity_id_missing");
  if (input.entityIds.length > 1) blockers.push("multiple_targets_not_allowed");
  if (!input.actorId.trim()) blockers.push("actor_id_missing");
  if (!input.idempotencyKey.trim()) blockers.push("idempotency_key_missing");
  if (!input.expectedVersion.trim()) blockers.push("expected_version_missing");
  if (!input.readinessReady) blockers.push("readiness_not_ready");
  if (!input.manualPublishFlowReady) blockers.push("manual_publish_flow_blocked");
  if (!input.sitemapEligible) blockers.push("sitemap_not_eligible");
  if (!input.auditLogAvailable) blockers.push("audit_log_unavailable");
  if (!input.rollbackSnapshotId?.trim()) blockers.push("rollback_snapshot_missing");
  if (input.transactionBoundary !== "single_transaction") blockers.push("transaction_boundary_missing");
  if (!input.dryRunReviewed) blockers.push("dry_run_not_reviewed");
  if (!input.mutationEnabled) blockers.push("mutation_not_enabled");

  return Array.from(new Set(blockers));
}

export function getImportControlledSinglePublishPlan(
  input: ImportControlledSinglePublishRequest,
): ImportControlledSinglePublishPlan {
  const blockers = getImportControlledSinglePublishBlockers(input);
  const contractBlockers = blockers.filter((blocker) => blocker !== "mutation_not_enabled");

  return {
    mode: "contract_only",
    targetEntityId: input.entityIds.length === 1 ? input.entityIds[0] ?? null : null,
    contractReady: contractBlockers.length === 0,
    executionReady: false,
    blockers,
    idempotencyKey: input.idempotencyKey,
    expectedVersion: input.expectedVersion,
    auditRequired: true,
    rollbackRequired: true,
    transactionRequired: true,
    bulkAllowed: false,
  };
}

export function isImportControlledSinglePublishContractReady(
  input: ImportControlledSinglePublishRequest,
): boolean {
  return getImportControlledSinglePublishPlan(input).contractReady;
}
