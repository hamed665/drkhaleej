import "server-only";

import type { ImportAdminCapabilityAction, ImportAdminCapabilityPermission } from "./import-admin-capability-audit";

export type ImportAdminActionTarget = "none" | "import_batch" | "import_row" | "entity" | "blocked_rows_export";
export type ImportAdminActionMutationBoundary = "read_only" | "validation_only" | "generation_only" | "approval_only" | "publish_state" | "archive_state";
export type ImportAdminActionAuditEvent =
  | "none"
  | "admin_geo_revalidated"
  | "admin_seo_revalidated"
  | "admin_schema_regenerated"
  | "admin_internal_links_regenerated"
  | "admin_duplicate_check_rerun"
  | "admin_blocked_rows_exported"
  | "admin_entity_manually_approved"
  | "admin_entity_published"
  | "admin_entity_unpublished"
  | "admin_import_row_archived";

export type ImportAdminActionContract = {
  action: ImportAdminCapabilityAction;
  target: ImportAdminActionTarget;
  requiredPermission: ImportAdminCapabilityPermission;
  mutationBoundary: ImportAdminActionMutationBoundary;
  auditEvent: ImportAdminActionAuditEvent;
  requiresSelectedRow: boolean;
  requiresAuditLog: boolean;
  requiresReadiness: boolean;
  requiresManualPublishFlow: boolean;
};

export const IMPORT_ADMIN_ACTION_CONTRACTS = {
  view_import_queue: {
    action: "view_import_queue",
    target: "none",
    requiredPermission: "imports.read",
    mutationBoundary: "read_only",
    auditEvent: "none",
    requiresSelectedRow: false,
    requiresAuditLog: false,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  view_readiness_panel: {
    action: "view_readiness_panel",
    target: "none",
    requiredPermission: "imports.read",
    mutationBoundary: "read_only",
    auditEvent: "none",
    requiresSelectedRow: false,
    requiresAuditLog: false,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  revalidate_geo: {
    action: "revalidate_geo",
    target: "entity",
    requiredPermission: "imports.validate",
    mutationBoundary: "validation_only",
    auditEvent: "admin_geo_revalidated",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  revalidate_seo: {
    action: "revalidate_seo",
    target: "entity",
    requiredPermission: "imports.validate",
    mutationBoundary: "validation_only",
    auditEvent: "admin_seo_revalidated",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  regenerate_schema: {
    action: "regenerate_schema",
    target: "entity",
    requiredPermission: "imports.generate",
    mutationBoundary: "generation_only",
    auditEvent: "admin_schema_regenerated",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  regenerate_internal_links: {
    action: "regenerate_internal_links",
    target: "entity",
    requiredPermission: "imports.generate",
    mutationBoundary: "generation_only",
    auditEvent: "admin_internal_links_regenerated",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  rerun_duplicate_check: {
    action: "rerun_duplicate_check",
    target: "entity",
    requiredPermission: "imports.validate",
    mutationBoundary: "validation_only",
    auditEvent: "admin_duplicate_check_rerun",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  export_blocked_rows: {
    action: "export_blocked_rows",
    target: "blocked_rows_export",
    requiredPermission: "imports.export",
    mutationBoundary: "read_only",
    auditEvent: "admin_blocked_rows_exported",
    requiresSelectedRow: false,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  manual_approve: {
    action: "manual_approve",
    target: "entity",
    requiredPermission: "imports.approve",
    mutationBoundary: "approval_only",
    auditEvent: "admin_entity_manually_approved",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: true,
    requiresManualPublishFlow: false,
  },
  publish_entity: {
    action: "publish_entity",
    target: "entity",
    requiredPermission: "imports.publish",
    mutationBoundary: "publish_state",
    auditEvent: "admin_entity_published",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: true,
    requiresManualPublishFlow: true,
  },
  unpublish_entity: {
    action: "unpublish_entity",
    target: "entity",
    requiredPermission: "imports.publish",
    mutationBoundary: "publish_state",
    auditEvent: "admin_entity_unpublished",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
  archive_import_row: {
    action: "archive_import_row",
    target: "import_row",
    requiredPermission: "imports.archive",
    mutationBoundary: "archive_state",
    auditEvent: "admin_import_row_archived",
    requiresSelectedRow: true,
    requiresAuditLog: true,
    requiresReadiness: false,
    requiresManualPublishFlow: false,
  },
} as const satisfies Record<ImportAdminCapabilityAction, ImportAdminActionContract>;

export function getImportAdminActionContract(action: ImportAdminCapabilityAction): ImportAdminActionContract {
  return IMPORT_ADMIN_ACTION_CONTRACTS[action];
}

export function isImportAdminActionReadOnly(action: ImportAdminCapabilityAction): boolean {
  return getImportAdminActionContract(action).mutationBoundary === "read_only";
}
