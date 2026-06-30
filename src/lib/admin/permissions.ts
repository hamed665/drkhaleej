export const adminPermissionGroups = [
  { label: "Core", permissions: ["admin.access", "admin.control_center.read", "admin.settings.read", "admin.roles.read", "admin.audit.read"] },
  { label: "Provider Leads", permissions: ["provider_leads.read", "provider_leads.update_status", "provider_leads.create_draft_center"] },
  { label: "Draft Centers", permissions: ["draft_centers.read", "draft_centers.create", "draft_centers.update", "draft_centers.taxonomy.update", "draft_centers.workflow.update"] },
  { label: "Active Centers", permissions: ["active_centers.public_state.update"] },
  { label: "Imports", permissions: ["imports.read", "imports.upload", "imports.validate", "imports.review"] },
  { label: "Subscriptions", permissions: ["subscriptions.read", "subscriptions.assign", "subscription_plans.sync"] },
  { label: "Commercial", permissions: ["commercial_addons.read", "commercial_addons.assign"] },
  { label: "Content / CMS", permissions: ["content.inventory.read", "content.read", "content.create", "content.update", "content.submit_review", "content.approve", "content.reject", "content.archive", "content.revisions.read", "content.preview", "faqs.edit", "articles.edit", "seo.edit", "navigation.edit"] },
  { label: "Media", permissions: ["media.read", "media.upload", "media.update", "media.archive"] },
  { label: "Offers / Ads", permissions: ["offers.read", "offers.manage", "sponsored_placements.read", "sponsored_placements.manage"] },
  { label: "Doctors / Services", permissions: ["doctors.read", "doctors.manage", "services.read", "services.manage", "specialties.read", "specialties.manage"] },
] as const;

export type AdminPermissionKey = (typeof adminPermissionGroups)[number]["permissions"][number];

export const adminPermissions = adminPermissionGroups.flatMap((group) => group.permissions) as AdminPermissionKey[];

export const activeAdminPermissions = [
  "admin.access",
  "admin.control_center.read",
  "admin.settings.read",
  "admin.roles.read",
  "admin.audit.read",
  "provider_leads.read",
  "provider_leads.update_status",
  "provider_leads.create_draft_center",
  "draft_centers.read",
  "draft_centers.create",
  "draft_centers.update",
  "draft_centers.taxonomy.update",
  "draft_centers.workflow.update",
  "active_centers.public_state.update",
  "imports.read",
  "imports.upload",
  "imports.validate",
  "imports.review",
  "subscriptions.read",
  "subscriptions.assign",
  "subscription_plans.sync",
  "commercial_addons.read",
  "commercial_addons.assign",
  "media.read",
  "media.upload",
  "media.update",
  "media.archive",
  "content.read",
  "content.create",
  "content.update",
  "content.submit_review",
  "content.approve",
  "content.reject",
  "content.archive",
  "content.revisions.read",
  "content.preview",
] as const satisfies readonly AdminPermissionKey[];

export type AdminRoleKey = "super_admin" | "operations_manager" | "content_editor" | "media_manager" | "commercial_manager" | "auditor";

export const adminRoles: Record<AdminRoleKey, { label: string; permissions: readonly AdminPermissionKey[] }> = {
  super_admin: { label: "Super admin", permissions: activeAdminPermissions },
  operations_manager: { label: "Operations manager", permissions: ["admin.access", "admin.control_center.read", "provider_leads.read", "provider_leads.update_status", "provider_leads.create_draft_center", "draft_centers.read", "draft_centers.create", "draft_centers.update", "draft_centers.taxonomy.update", "draft_centers.workflow.update", "active_centers.public_state.update", "imports.read", "imports.upload", "imports.validate", "imports.review", "subscriptions.read"] },
  content_editor: { label: "Content editor", permissions: ["admin.access", "admin.control_center.read", "content.inventory.read", "content.read", "content.create", "content.update", "content.submit_review", "content.approve", "content.reject", "content.archive", "content.revisions.read", "content.preview", "faqs.edit", "articles.edit", "seo.edit", "navigation.edit"] },
  media_manager: { label: "Media manager", permissions: ["admin.access", "admin.control_center.read", "media.read", "media.upload", "media.update", "media.archive"] },
  commercial_manager: { label: "Commercial manager", permissions: ["admin.access", "admin.control_center.read", "subscriptions.read", "subscriptions.assign", "commercial_addons.read", "commercial_addons.assign", "sponsored_placements.read"] },
  auditor: { label: "Auditor", permissions: ["admin.access", "admin.control_center.read", "admin.audit.read", "provider_leads.read", "draft_centers.read", "imports.read", "subscriptions.read", "commercial_addons.read"] },
};
