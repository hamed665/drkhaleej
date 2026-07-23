import "server-only";

import type { PharmacyPrivateAdminServerActionExecutor } from "./import-pharmacy-private-admin-server-action";
import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";

export type PharmacyRealRollbackCanaryReadback = {
  rolledBackAuditCount: number;
  rollbackReplayCount: number;
  duplicateRollbackCount: number;
  referenceCount: number;
  referenceConsumed: boolean;
  entity: {
    id: string;
    centerType: string;
    status: string;
    isActive: boolean;
    isFeatured: boolean;
    logicalSnapshotHash: string;
  } | null;
};

export type PharmacyRealRollbackCanaryReadbackClient = {
  read(input: {
    actorId: string;
    entityId: string;
  }): Promise<{ data: PharmacyRealRollbackCanaryReadback | null; error: { message?: string } | null }>;
};

export type PharmacyRealRollbackCanaryBlocker =
  | "publish_canary_not_verified"
  | "publish_reference_missing"
  | "expected_snapshot_hash_missing"
  | "rollback_failed"
  | "rollback_authority_result_invalid"
  | "rollback_readback_failed"
  | "rolled_back_audit_count_invalid"
  | "rollback_replay_count_invalid"
  | "duplicate_rollback_detected"
  | "publish_reference_count_invalid"
  | "publish_reference_not_consumed"
  | "entity_state_invalid"
  | "entity_snapshot_mismatch";

export type PharmacyRealRollbackCanaryResult = {
  verified: boolean;
  actorId: string | null;
  entityId: string | null;
  publishReference: string | null;
  readback: PharmacyRealRollbackCanaryReadback | null;
  blockers: readonly PharmacyRealRollbackCanaryBlocker[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  rawReferenceExposed: false;
};

function buildResult(input: Omit<PharmacyRealRollbackCanaryResult, "publicVisibility" | "indexEligible" | "sitemapEligible" | "routeEnabled" | "rawReferenceExposed">): PharmacyRealRollbackCanaryResult {
  return {
    ...input,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
  };
}

function isSha256(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export async function runPharmacyRealRollbackCanary(input: {
  publishCanary: PharmacyRealPreviewCanaryResult;
  expectedOriginalSnapshotHash: string;
  executor: PharmacyPrivateAdminServerActionExecutor;
  readbackClient: PharmacyRealRollbackCanaryReadbackClient;
}): Promise<PharmacyRealRollbackCanaryResult> {
  const publish = input.publishCanary;
  if (!publish.verified || !publish.actorId || !publish.entityId) {
    return buildResult({ verified: false, actorId: publish.actorId, entityId: publish.entityId, publishReference: publish.publishReference, readback: null, blockers: ["publish_canary_not_verified"] });
  }
  if (!publish.publishReference) {
    return buildResult({ verified: false, actorId: publish.actorId, entityId: publish.entityId, publishReference: null, readback: null, blockers: ["publish_reference_missing"] });
  }
  if (!isSha256(input.expectedOriginalSnapshotHash)) {
    return buildResult({ verified: false, actorId: publish.actorId, entityId: publish.entityId, publishReference: publish.publishReference, readback: null, blockers: ["expected_snapshot_hash_missing"] });
  }

  const actorId = publish.actorId;
  const entityId = publish.entityId;
  const publishReference = publish.publishReference;
  const execution = await input.executor({
    operation: "rollback",
    actorId,
    entityId,
    confirmation: `ROLLBACK PRIVATE PUBLISH ${entityId}`,
  });

  if (execution.status !== "completed") {
    return buildResult({ verified: false, actorId, entityId, publishReference, readback: null, blockers: ["rollback_failed"] });
  }
  if (
    execution.executionReference !== "rollback-authority-consumed" &&
    execution.executionReference !== "rollback-authority-replayed"
  ) {
    return buildResult({ verified: false, actorId, entityId, publishReference, readback: null, blockers: ["rollback_authority_result_invalid"] });
  }

  const read = await input.readbackClient.read({ actorId, entityId });
  if (read.error || !read.data) {
    return buildResult({ verified: false, actorId, entityId, publishReference, readback: null, blockers: ["rollback_readback_failed"] });
  }

  const data = read.data;
  const blockers: PharmacyRealRollbackCanaryBlocker[] = [];
  if (data.rolledBackAuditCount !== 1) blockers.push("rolled_back_audit_count_invalid");
  if (data.rollbackReplayCount < 0 || data.rollbackReplayCount > 1) blockers.push("rollback_replay_count_invalid");
  if (data.duplicateRollbackCount !== 0) blockers.push("duplicate_rollback_detected");
  if (data.referenceCount !== 1) blockers.push("publish_reference_count_invalid");
  if (!data.referenceConsumed) blockers.push("publish_reference_not_consumed");
  if (
    !data.entity ||
    data.entity.id !== entityId ||
    data.entity.centerType !== "pharmacy" ||
    data.entity.status !== "draft" ||
    data.entity.isActive ||
    data.entity.isFeatured
  ) blockers.push("entity_state_invalid");
  if (!data.entity || data.entity.logicalSnapshotHash !== input.expectedOriginalSnapshotHash) {
    blockers.push("entity_snapshot_mismatch");
  }

  return buildResult({
    verified: blockers.length === 0,
    actorId,
    entityId,
    publishReference,
    readback: data,
    blockers: [...new Set(blockers)],
  });
}
