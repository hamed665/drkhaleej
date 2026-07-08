import "server-only";

import type { ImportManualPublishFlowResult } from "./import-manual-publish-flow";
import type { ImportQueueDashboardRow } from "./import-queue-dashboard";
import type { ImportEntityReadiness } from "./import-readiness-engine";

export type ImportAdminCapabilityAction =
  | "view_import_queue"
  | "view_readiness_panel"
  | "revalidate_geo"
  | "revalidate_seo"
  | "regenerate_schema"
  | "regenerate_internal_links"
  | "rerun_duplicate_check"
  | "export_blocked_rows"
  | "manual_approve"
  | "publish_entity"
  | "unpublish_entity"
  | "archive_import_row";

export type ImportAdminCapabilityPermission =
  | "imports.read"
  | "imports.validate"
  | "imports.generate"
  | "imports.export"
  | "imports.approve"
  | "imports.publish"
  | "imports.archive";

export type ImportAdminCapabilityState = "enabled" | "disabled";

export type ImportAdminCapabilityBlocker =
  | "missing_permission"
  | "readiness_blocked"
  | "manual_publish_flow_blocked"
  | "row_not_selected"
  | "row_already_published"
  | "row_archived"
  | "no_blocked_rows_to_export"
  | "audit_log_required";

export type ImportAdminCapabilityContext = {
  selectedRow: ImportQueueDashboardRow | null;
  readiness: ImportEntityReadiness | null;
  manualPublishFlow: ImportManualPublishFlowResult | null;
  grantedPermissions: readonly ImportAdminCapabilityPermission[];
  blockedRowCount: number;
  auditLogAvailable: boolean;
};

export type ImportAdminCapability = {
  action: ImportAdminCapabilityAction;
  requiredPermission: ImportAdminCapabilityPermission;
  state: ImportAdminCapabilityState;
  blockers: readonly ImportAdminCapabilityBlocker[];
  requiresAuditLog: boolean;
};

export const IMPORT_ADMIN_ACTION_PERMISSIONS = {
  view_import_queue: "imports.read",
  view_readiness_panel: "imports.read",
  revalidate_geo: "imports.validate",
  revalidate_seo: "imports.validate",
  regenerate_schema: "imports.generate",
  regenerate_internal_links: "imports.generate",
  rerun_duplicate_check: "imports.validate",
  export_blocked_rows: "imports.export",
  manual_approve: "imports.approve",
  publish_entity: "imports.publish",
  unpublish_entity: "imports.publish",
  archive_import_row: "imports.archive",
} as const satisfies Record<ImportAdminCapabilityAction, ImportAdminCapabilityPermission>;

const auditRequiredActions = new Set<ImportAdminCapabilityAction>([
  "revalidate_geo",
  "revalidate_seo",
  "regenerate_schema",
  "regenerate_internal_links",
  "rerun_duplicate_check",
  "manual_approve",
  "publish_entity",
  "unpublish_entity",
  "archive_import_row",
]);

export function buildImportAdminCapabilities(context: ImportAdminCapabilityContext): readonly ImportAdminCapability[] {
  return (Object.keys(IMPORT_ADMIN_ACTION_PERMISSIONS) as ImportAdminCapabilityAction[]).map((action) =>
    buildImportAdminCapability(action, context),
  );
}

export function buildImportAdminCapability(
  action: ImportAdminCapabilityAction,
  context: ImportAdminCapabilityContext,
): ImportAdminCapability {
  const requiredPermission = IMPORT_ADMIN_ACTION_PERMISSIONS[action];
  const blockers = getImportAdminCapabilityBlockers(action, context);

  return {
    action,
    requiredPermission,
    state: blockers.length === 0 ? "enabled" : "disabled",
    blockers,
    requiresAuditLog: auditRequiredActions.has(action),
  };
}

export function getImportAdminCapabilityBlockers(
  action: ImportAdminCapabilityAction,
  context: ImportAdminCapabilityContext,
): readonly ImportAdminCapabilityBlocker[] {
  const blockers: ImportAdminCapabilityBlocker[] = [];
  const permission = IMPORT_ADMIN_ACTION_PERMISSIONS[action];

  if (!context.grantedPermissions.includes(permission)) blockers.push("missing_permission");
  if (auditRequiredActions.has(action) && !context.auditLogAvailable) blockers.push("audit_log_required");

  if (requiresSelectedRow(action) && context.selectedRow === null) blockers.push("row_not_selected");
  if (context.selectedRow?.row_status === "archived") blockers.push("row_archived");
  if (context.selectedRow?.row_status === "published" && action === "publish_entity") blockers.push("row_already_published");

  if (action === "export_blocked_rows" && context.blockedRowCount === 0) blockers.push("no_blocked_rows_to_export");
  if (action === "manual_approve" && context.readiness?.publishReady !== true) blockers.push("readiness_blocked");
  if (action === "publish_entity" && context.manualPublishFlow?.canPublish !== true) blockers.push("manual_publish_flow_blocked");

  return [...new Set(blockers)];
}

function requiresSelectedRow(action: ImportAdminCapabilityAction): boolean {
  return !["view_import_queue", "view_readiness_panel", "export_blocked_rows"].includes(action);
}
