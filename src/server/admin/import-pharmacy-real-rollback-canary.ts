import "server-only";

import type { PharmacyPrivateAdminServerActionExecutor } from "./import-pharmacy-private-admin-server-action";
import {
  hashPharmacyRollbackLogicalSnapshot,
  type PharmacyRollbackExactRecoveryReport,
  type PharmacyRollbackLogicalSnapshot,
} from "./import-pharmacy-rollback-exact-recovery";
import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";

export type PharmacyRealRollbackCanaryReadback = {
  rolledBackAuditCount: number;
  rollbackReplayCount: number;
  duplicateRollbackCount: number;
  referenceCount: number;
  referenceConsumed: boolean;
  exactRecovery: PharmacyRollbackExactRecoveryReport;
  entity: {
    id: string;
    centerType: string;
    status: string;
    isActive: boolean;
    isFeatured: boolean;
  } | null;
};

export type PharmacyRealRollbackCanaryReadbackClient = {
  read(input: {
    actorId: string;
    entityId: string;
    expectedOriginalSnapshot: PharmacyRollbackLogicalSnapshot;
  }): Promise<{ data: PharmacyRealRollbackCanaryReadback | null; error: { message?: string } | null }>;
};

export type PharmacyRealRollbackCanaryBlocker =
  | "publish_canary_not_verified"
  | "publish_reference_missing"
  | "expected_original_snapshot_missing"
  | "rollback_failed"
  | "rollback_authority_result_invalid"
  | "rollback_readback_failed"
  | "rolled_back_audit_count_invalid"
  | "rollback_replay_count_invalid"
  | "duplicate_rollback_detected"
  | "publish_reference_count_invalid"
  | "publish_reference_not_consumed"
  | "entity_state_invalid"
  | "exact_recovery_diagnostics_invalid"
  | "exact_recovery_mismatch_detected";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSha256(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function exactRecoveryDiagnosticsValid(
  report: PharmacyRollbackExactRecoveryReport,
  expectedHash: string,
): boolean {
  if (
    report.rawValuesExposed !== false ||
    !isSha256(report.expectedHash) ||
    !isSha256(report.actualHash) ||
    report.expectedHash !== expectedHash ||
    !Number.isInteger(report.mismatchCount) ||
    report.mismatchCount < 0 ||
    report.mismatches.length > 24 ||
    report.diagnosticsTruncated !== (report.mismatchCount > report.mismatches.length)
  ) {
    return false;
  }

  if (
    report.mismatches.some(
      (mismatch) =>
        !mismatch.path ||
        mismatch.path.length > 180 ||
        !isSha256(mismatch.expectedHash) ||
        !isSha256(mismatch.actualHash),
    )
  ) {
    return false;
  }

  return report.verified
    ? report.mismatchCount === 0 &&
        report.mismatches.length === 0 &&
        report.expectedHash === report.actualHash
    : report.mismatchCount > 0 && report.expectedHash !== report.actualHash;
}

export async function runPharmacyRealRollbackCanary(input: {
  publishCanary: PharmacyRealPreviewCanaryResult;
  expectedOriginalSnapshot: PharmacyRollbackLogicalSnapshot;
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
  if (!isRecord(input.expectedOriginalSnapshot) || Object.keys(input.expectedOriginalSnapshot).length === 0) {
    return buildResult({ verified: false, actorId: publish.actorId, entityId: publish.entityId, publishReference: publish.publishReference, readback: null, blockers: ["expected_original_snapshot_missing"] });
  }

  const actorId = publish.actorId;
  const entityId = publish.entityId;
  const publishReference = publish.publishReference;
  const expectedSnapshotHash = hashPharmacyRollbackLogicalSnapshot(input.expectedOriginalSnapshot);
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

  const read = await input.readbackClient.read({
    actorId,
    entityId,
    expectedOriginalSnapshot: input.expectedOriginalSnapshot,
  });
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
  if (!exactRecoveryDiagnosticsValid(data.exactRecovery, expectedSnapshotHash)) {
    blockers.push("exact_recovery_diagnostics_invalid");
  } else if (!data.exactRecovery.verified) {
    blockers.push("exact_recovery_mismatch_detected");
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
