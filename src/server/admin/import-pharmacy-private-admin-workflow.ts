import "server-only";

import type { ImportAdminCapabilityPermission } from "./import-admin-capability-audit";

export type PharmacyPrivateAdminOperation = "dry_run" | "review" | "reserve_private_publish" | "private_publish" | "rollback";
export type PharmacyPrivateAdminEnvironment = "preview" | "production" | "development";
export type PharmacyPrivateAdminWorkflowStatus = "ready" | "blocked" | "completed" | "failed";
export type PharmacyPrivateAdminWorkflowBlocker =
  | "wrong_family"
  | "bulk_not_allowed"
  | "missing_actor"
  | "missing_entity"
  | "missing_permission"
  | "missing_confirmation"
  | "preview_required"
  | "readiness_blocked"
  | "review_required"
  | "audit_unavailable";

export type PharmacyPrivateAdminRequest = {
  operation: PharmacyPrivateAdminOperation;
  family: "pharmacy" | string;
  actorId: string;
  entityIds: readonly string[];
  environment: PharmacyPrivateAdminEnvironment;
  grantedPermissions: readonly ImportAdminCapabilityPermission[];
  readinessPassed: boolean;
  reviewApproved: boolean;
  confirmation: string | null;
  auditAvailable: boolean;
};

export type PharmacyPrivateAdminWorkflowResult = {
  operation: PharmacyPrivateAdminOperation;
  status: PharmacyPrivateAdminWorkflowStatus;
  entityId: string | null;
  blockers: readonly PharmacyPrivateAdminWorkflowBlocker[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  executionReference: string | null;
};

export type PharmacyPrivateAdminWorkflowPorts = {
  dryRun(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  review(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  reservePrivatePublish(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  privatePublish(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  rollback(input: { actorId: string; entityId: string }): Promise<{ ok: boolean; reference: string | null }>;
  audit(input: { actorId: string; entityId: string; operation: PharmacyPrivateAdminOperation; reference: string | null }): Promise<boolean>;
};

const permissionByOperation: Record<PharmacyPrivateAdminOperation, ImportAdminCapabilityPermission> = {
  dry_run: "imports.validate",
  review: "imports.approve",
  reserve_private_publish: "imports.publish",
  private_publish: "imports.publish",
  rollback: "imports.publish",
};

export function getPharmacyPrivateAdminBlockers(input: PharmacyPrivateAdminRequest): readonly PharmacyPrivateAdminWorkflowBlocker[] {
  const blockers: PharmacyPrivateAdminWorkflowBlocker[] = [];
  const entityId = input.entityIds.length === 1 ? input.entityIds[0] ?? null : null;
  if (input.family !== "pharmacy") blockers.push("wrong_family");
  if (input.entityIds.length !== 1) blockers.push("bulk_not_allowed");
  if (input.actorId.trim().length === 0) blockers.push("missing_actor");
  if (input.entityIds[0]?.trim().length !== input.entityIds[0]?.length || !input.entityIds[0]) blockers.push("missing_entity");
  if (!input.grantedPermissions.includes(permissionByOperation[input.operation])) blockers.push("missing_permission");
  if (!input.auditAvailable) blockers.push("audit_unavailable");

  if (input.operation !== "dry_run" && !input.readinessPassed) blockers.push("readiness_blocked");
  if (["reserve_private_publish", "private_publish", "rollback"].includes(input.operation) && input.environment !== "preview") blockers.push("preview_required");
  if ((input.operation === "reserve_private_publish" || input.operation === "private_publish") && !input.reviewApproved) blockers.push("review_required");

  if (
    input.operation === "private_publish" &&
    (entityId === null || input.confirmation !== `EXECUTE PRIVATE PUBLISH ${entityId}`)
  ) blockers.push("missing_confirmation");
  if (
    input.operation === "rollback" &&
    (entityId === null || input.confirmation !== `ROLLBACK PRIVATE PUBLISH ${entityId}`)
  ) blockers.push("missing_confirmation");
  return [...new Set(blockers)];
}

export async function executePharmacyPrivateAdminWorkflow(
  input: PharmacyPrivateAdminRequest,
  ports: PharmacyPrivateAdminWorkflowPorts,
): Promise<PharmacyPrivateAdminWorkflowResult> {
  const blockers = getPharmacyPrivateAdminBlockers(input);
  const entityId = input.entityIds.length === 1 ? input.entityIds[0] ?? null : null;
  const base = {
    operation: input.operation,
    entityId,
    publicVisibility: "private" as const,
    indexEligible: false as const,
    sitemapEligible: false as const,
    routeEnabled: false as const,
  };
  if (blockers.length > 0 || entityId === null) return { ...base, status: "blocked", blockers, executionReference: null };

  try {
    const result = input.operation === "dry_run"
      ? await ports.dryRun({ actorId: input.actorId, entityId })
      : input.operation === "review"
        ? await ports.review({ actorId: input.actorId, entityId })
        : input.operation === "reserve_private_publish"
          ? await ports.reservePrivatePublish({ actorId: input.actorId, entityId })
          : input.operation === "private_publish"
            ? await ports.privatePublish({ actorId: input.actorId, entityId })
            : await ports.rollback({ actorId: input.actorId, entityId });

    if (!result.ok) return { ...base, status: "failed", blockers: [], executionReference: result.reference };
    const audited = await ports.audit({ actorId: input.actorId, entityId, operation: input.operation, reference: result.reference });
    return { ...base, status: audited ? "completed" : "failed", blockers: audited ? [] : ["audit_unavailable"], executionReference: result.reference };
  } catch {
    return { ...base, status: "failed", blockers: [], executionReference: null };
  }
}
