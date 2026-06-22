import "server-only";

import type { AdminPermissionKey } from "@/lib/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database, Json } from "@/lib/supabase/types";
import { requireAdminPermission, type CurrentAdminContext } from "@/server/admin/permissions";

export type AdminAuditAction =
  | "provider_lead.status_priority_updated"
  | "provider_lead.draft_center_created"
  | "draft_center.details_updated"
  | "draft_center.taxonomy_updated"
  | "draft_center.workflow_updated"
  | "subscription.assigned"
  | "subscription_plan_catalog.synced"
  | "commercial_addon.assigned"
  | "media_asset.uploaded"
  | "media_asset.metadata_updated"
  | "media_asset.archived"
  | "media_asset.restored"
  | "cms_content.entry_created"
  | "cms_content.entry_updated"
  | "cms_content.revision_created"
  | "cms_content.revision_updated"
  | "cms_content.submitted_for_review"
  | "cms_content.revision_approved"
  | "cms_content.revision_rejected"
  | "cms_content.entry_archived"
  | "cms_content.entry_restored";

type JsonRecord = Record<string, Json>;
type AdminAuditEventRow = Database["public"]["Tables"]["admin_audit_events"]["Row"];
type AdminAuditEventInsert = Database["public"]["Tables"]["admin_audit_events"]["Insert"];

export type WriteAdminAuditEventInput = {
  admin: CurrentAdminContext;
  permissionKey: AdminPermissionKey;
  action: AdminAuditAction;
  entityType: string;
  entityId?: string | null;
  targetTable?: string | null;
  summary: string;
  reason?: string | null;
  oldValues?: JsonRecord;
  newValues?: JsonRecord;
  metadata?: JsonRecord;
};

export type AdminAuditEvent = {
  id: string;
  createdAt: string;
  actorProfileId: string | null;
  actorAuthUserId: string | null;
  actorEmail: string | null;
  permissionKey: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  reason: string | null;
};

export type AdminAuditFilters = {
  action?: string | undefined;
  entityType?: string | undefined;
  actorEmail?: string | undefined;
  createdFrom?: string | undefined;
  createdTo?: string | undefined;
};

export async function writeAdminAuditEvent(input: WriteAdminAuditEventInput): Promise<void> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const event: AdminAuditEventInsert = {
      actor_profile_id: input.admin.profile.id,
      actor_auth_user_id: input.admin.profile.auth_user_id,
      actor_email: input.admin.profile.email,
      permission_key: input.permissionKey,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      target_table: input.targetTable ?? null,
      summary: input.summary,
      reason: input.reason ?? null,
      old_values: input.oldValues ?? {},
      new_values: input.newValues ?? {},
      metadata: input.metadata ?? {},
      request_source: "admin",
    };

    await supabase.from("admin_audit_events").insert(event);
  } catch {
    // Audit failures must not expose database details or block the already-completed admin action.
  }
}

/**
 * Lists audit events for the read-only admin audit page.
 *
 * This helper intentionally performs its own permission check so it cannot be
 * reused by another admin surface without the `admin.audit.read` gate.
 */
export async function listAdminAuditEvents(
  filters: AdminAuditFilters = {},
): Promise<{ ok: true; items: AdminAuditEvent[] } | { ok: false }> {
  await requireAdminPermission("admin.audit.read");

  try {
    const supabase = createSupabaseServiceRoleClient();
    let query = supabase
      .from("admin_audit_events")
      .select(
        "id, created_at, actor_profile_id, actor_auth_user_id, actor_email, permission_key, action, entity_type, entity_id, summary, reason",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters.action) {
      query = query.eq("action", filters.action);
    }

    if (filters.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters.actorEmail) {
      query = query.ilike("actor_email", `%${filters.actorEmail}%`);
    }

    if (filters.createdFrom) {
      query = query.gte("created_at", filters.createdFrom);
    }

    if (filters.createdTo) {
      query = query.lte("created_at", filters.createdTo);
    }

    const { data, error } = await query;

    if (error !== null || data === null) {
      return { ok: false };
    }

    return {
      ok: true,
      items: data.map(mapAdminAuditEvent),
    };
  } catch {
    return { ok: false };
  }
}

type AdminAuditEventListRow = Pick<
  AdminAuditEventRow,
  | "id"
  | "created_at"
  | "actor_profile_id"
  | "actor_auth_user_id"
  | "actor_email"
  | "permission_key"
  | "action"
  | "entity_type"
  | "entity_id"
  | "summary"
  | "reason"
>;

function mapAdminAuditEvent(row: AdminAuditEventListRow): AdminAuditEvent {
  return {
    id: row.id,
    createdAt: row.created_at,
    actorProfileId: row.actor_profile_id,
    actorAuthUserId: row.actor_auth_user_id,
    actorEmail: row.actor_email,
    permissionKey: row.permission_key,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    reason: row.reason,
  };
}
