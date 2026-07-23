import "server-only";

import type { PharmacyPrivateAdminServerActionExecutor } from "./import-pharmacy-private-admin-server-action";
import type { PharmacyPreviewCanaryActivation } from "./import-pharmacy-preview-canary-activation";

export type PharmacyRealPreviewCanaryReadback = {
  reservationCount: number;
  rollbackSnapshotCount: number;
  executionStartedAuditCount: number;
  terminalSuccessAuditCount: number;
  publishReferenceCount: number;
  duplicateExecutionCount: number;
  entity: {
    id: string;
    centerType: string;
    status: string;
    isActive: boolean;
    isFeatured: boolean;
  } | null;
};

export type PharmacyRealPreviewCanaryReadbackClient = {
  read(input: {
    actorId: string;
    entityId: string;
    publishReference: string;
  }): Promise<{ data: PharmacyRealPreviewCanaryReadback | null; error: { message?: string } | null }>;
};

export type PharmacyRealPreviewCanaryBlocker =
  | "activation_disabled"
  | "publish_failed"
  | "publish_reference_missing"
  | "readback_failed"
  | "reservation_count_invalid"
  | "rollback_snapshot_count_invalid"
  | "execution_started_audit_count_invalid"
  | "terminal_success_audit_count_invalid"
  | "publish_reference_count_invalid"
  | "duplicate_execution_detected"
  | "entity_state_invalid";

export type PharmacyRealPreviewCanaryResult = {
  verified: boolean;
  actorId: string | null;
  entityId: string | null;
  publishReference: string | null;
  readback: PharmacyRealPreviewCanaryReadback | null;
  blockers: readonly PharmacyRealPreviewCanaryBlocker[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
};

function result(input: {
  verified: boolean;
  actorId: string | null;
  entityId: string | null;
  publishReference: string | null;
  readback: PharmacyRealPreviewCanaryReadback | null;
  blockers: readonly PharmacyRealPreviewCanaryBlocker[];
}): PharmacyRealPreviewCanaryResult {
  return {
    ...input,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
  };
}

export async function runPharmacyRealPreviewCanary(input: {
  activation: PharmacyPreviewCanaryActivation;
  executor: PharmacyPrivateAdminServerActionExecutor;
  readbackClient: PharmacyRealPreviewCanaryReadbackClient;
}): Promise<PharmacyRealPreviewCanaryResult> {
  if (!input.activation.enabled) {
    return result({ verified: false, actorId: null, entityId: null, publishReference: null, readback: null, blockers: ["activation_disabled"] });
  }

  const { actorId, entityId } = input.activation;
  const execution = await input.executor({
    operation: "private_publish",
    actorId,
    entityId,
    confirmation: `EXECUTE PRIVATE PUBLISH ${entityId}`,
    publishReference: null,
  });

  if (execution.status !== "completed") {
    return result({ verified: false, actorId, entityId, publishReference: null, readback: null, blockers: ["publish_failed"] });
  }
  if (!execution.executionReference) {
    return result({ verified: false, actorId, entityId, publishReference: null, readback: null, blockers: ["publish_reference_missing"] });
  }

  const publishReference = execution.executionReference;
  const read = await input.readbackClient.read({ actorId, entityId, publishReference });
  if (read.error || !read.data) {
    return result({ verified: false, actorId, entityId, publishReference, readback: null, blockers: ["readback_failed"] });
  }

  const data = read.data;
  const blockers: PharmacyRealPreviewCanaryBlocker[] = [];
  if (data.reservationCount !== 1) blockers.push("reservation_count_invalid");
  if (data.rollbackSnapshotCount !== 1) blockers.push("rollback_snapshot_count_invalid");
  if (data.executionStartedAuditCount !== 1) blockers.push("execution_started_audit_count_invalid");
  if (data.terminalSuccessAuditCount !== 1) blockers.push("terminal_success_audit_count_invalid");
  if (data.publishReferenceCount !== 1) blockers.push("publish_reference_count_invalid");
  if (data.duplicateExecutionCount !== 0) blockers.push("duplicate_execution_detected");
  if (
    !data.entity ||
    data.entity.id !== entityId ||
    data.entity.centerType !== "pharmacy" ||
    data.entity.status !== "draft" ||
    data.entity.isActive ||
    data.entity.isFeatured
  ) blockers.push("entity_state_invalid");

  return result({
    verified: blockers.length === 0,
    actorId,
    entityId,
    publishReference,
    readback: data,
    blockers: [...new Set(blockers)],
  });
}
