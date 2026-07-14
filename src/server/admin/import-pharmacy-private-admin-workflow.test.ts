import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  executePharmacyPrivateAdminWorkflow,
  getPharmacyPrivateAdminBlockers,
  type PharmacyPrivateAdminRequest,
  type PharmacyPrivateAdminWorkflowPorts,
} from "./import-pharmacy-private-admin-workflow";

const baseRequest: PharmacyPrivateAdminRequest = {
  operation: "private_publish",
  family: "pharmacy",
  actorId: "admin-1",
  entityIds: ["pharmacy-1"],
  environment: "preview",
  grantedPermissions: ["imports.publish"],
  readinessPassed: true,
  reviewApproved: true,
  confirmation: "PUBLISH PRIVATE PHARMACY",
  publishReference: null,
  auditAvailable: true,
};

function ports(): PharmacyPrivateAdminWorkflowPorts {
  return {
    dryRun: vi.fn(async () => ({ ok: true, reference: "dry-1" })),
    review: vi.fn(async () => ({ ok: true, reference: "review-1" })),
    reservePrivatePublish: vi.fn(async () => ({ ok: true, reference: "attempt-1" })),
    privatePublish: vi.fn(async () => ({ ok: true, reference: "publish-1" })),
    rollback: vi.fn(async () => ({ ok: true, reference: "rollback-1" })),
    audit: vi.fn(async () => true),
  };
}

describe("pharmacy private admin workflow", () => {
  it("blocks bulk, wrong-family, unreviewed, unconfirmed, and production publish requests", () => {
    const blockers = getPharmacyPrivateAdminBlockers({
      ...baseRequest,
      family: "hospital",
      entityIds: ["a", "b"],
      environment: "production",
      reviewApproved: false,
      confirmation: null,
    });
    expect(blockers).toEqual(expect.arrayContaining(["wrong_family", "bulk_not_allowed", "preview_required", "review_required", "missing_confirmation"]));
  });

  it("dispatches one reviewed Preview reservation without mutation", async () => {
    const workflowPorts = ports();
    const result = await executePharmacyPrivateAdminWorkflow(
      { ...baseRequest, operation: "reserve_private_publish", confirmation: "RESERVE PRIVATE PUBLISH pharmacy-1" },
      workflowPorts,
    );
    expect(result).toMatchObject({ status: "completed", executionReference: "attempt-1", publicVisibility: "private", indexEligible: false, sitemapEligible: false, routeEnabled: false });
    expect(workflowPorts.reservePrivatePublish).toHaveBeenCalledWith({ actorId: "admin-1", entityId: "pharmacy-1" });
    expect(workflowPorts.privatePublish).not.toHaveBeenCalled();
  });

  it("executes exactly one private publish and preserves zero public exposure", async () => {
    const workflowPorts = ports();
    const result = await executePharmacyPrivateAdminWorkflow(baseRequest, workflowPorts);
    expect(result).toMatchObject({ status: "completed", publicVisibility: "private", indexEligible: false, sitemapEligible: false, routeEnabled: false });
    expect(workflowPorts.privatePublish).toHaveBeenCalledTimes(1);
    expect(workflowPorts.audit).toHaveBeenCalledTimes(1);
    expect(workflowPorts.rollback).not.toHaveBeenCalled();
  });

  it("requires the source publish reference before rollback", async () => {
    const workflowPorts = ports();
    const result = await executePharmacyPrivateAdminWorkflow(
      { ...baseRequest, operation: "rollback", confirmation: "ROLLBACK PRIVATE PHARMACY", publishReference: null },
      workflowPorts,
    );
    expect(result.status).toBe("blocked");
    expect(result.blockers).toContain("publish_reference_required");
    expect(workflowPorts.rollback).not.toHaveBeenCalled();
  });

  it("runs rollback only in preview with confirmation and audit", async () => {
    const workflowPorts = ports();
    const result = await executePharmacyPrivateAdminWorkflow(
      { ...baseRequest, operation: "rollback", confirmation: "ROLLBACK PRIVATE PHARMACY", publishReference: "publish-1" },
      workflowPorts,
    );
    expect(result).toMatchObject({ status: "completed", executionReference: "rollback-1", routeEnabled: false });
    expect(workflowPorts.rollback).toHaveBeenCalledWith({ actorId: "admin-1", entityId: "pharmacy-1", publishReference: "publish-1" });
  });

  it("fails honestly when the audit cannot be persisted", async () => {
    const workflowPorts = ports();
    vi.mocked(workflowPorts.audit).mockResolvedValue(false);
    const result = await executePharmacyPrivateAdminWorkflow(baseRequest, workflowPorts);
    expect(result.status).toBe("failed");
    expect(result.blockers).toEqual(["audit_unavailable"]);
  });
});
