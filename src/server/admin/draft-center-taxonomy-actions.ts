"use server";

import { revalidatePath } from "next/cache";

import { requireAdminPermission } from "@/server/admin/permissions";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterStatus = Database["public"]["Enums"]["provider_status"];

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  insert(values: Record<string, unknown>): QueryBuilder<T>;
  is(column: string, value: boolean | null): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResponse<T>>;
  select(columns: string): QueryBuilder<T>;
  update(values: Record<string, unknown>): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

type CenterWorkflowRow = {
  id: string;
  status: CenterStatus;
};

type CenterCategoryRow = {
  id: string;
  is_active: boolean;
  public_profile_enabled: boolean;
  vertical_id: string;
};

type CenterCategoryAssignmentRow = {
  id: string;
};

export type DraftCenterTaxonomyState = {
  ok: boolean;
  message: string | null;
};

const allowedWorkflowStatuses = ["draft", "pending_review"] as const satisfies readonly CenterStatus[];

function taxonomyClient(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function failure(message: string): DraftCenterTaxonomyState {
  return { ok: false, message };
}

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isAllowedWorkflowStatus(status: CenterStatus): boolean {
  return allowedWorkflowStatuses.some((allowedStatus) => allowedStatus === status);
}

function revalidateCenterTaxonomy(centerId: string): void {
  revalidatePath("/admin/draft-centers");
  revalidatePath(`/admin/draft-centers/${centerId}`);
}

export async function saveDraftCenterPrimaryCategory(
  _previousState: DraftCenterTaxonomyState,
  formData: FormData,
): Promise<DraftCenterTaxonomyState> {
  const admin = await requireAdminPermission("draft_centers.taxonomy.update");

  const centerId = readFormString(formData, "centerId");
  const categoryId = readFormString(formData, "categoryId");

  if (centerId === null || !isUuid(centerId)) {
    return failure("Center could not be identified.");
  }

  if (categoryId === null || !isUuid(categoryId)) {
    return failure("Select a valid category.");
  }

  const supabase = taxonomyClient();

  const { data: center, error: centerError } = await supabase
    .from<CenterWorkflowRow>("centers")
    .select("id, status")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null) {
    return failure("Center could not be loaded.");
  }

  if (center === null || !isAllowedWorkflowStatus(center.status)) {
    return failure("Only draft or pending-review centers can be categorized here.");
  }

  const { data: category, error: categoryError } = await supabase
    .from<CenterCategoryRow>("center_categories")
    .select("id, vertical_id, is_active, public_profile_enabled")
    .eq("id", categoryId)
    .eq("is_active", true)
    .eq("public_profile_enabled", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (categoryError !== null) {
    return failure("Category could not be loaded.");
  }

  if (category === null) {
    return failure("Category is not available for draft center assignment.");
  }

  const now = new Date().toISOString();

  const { error: clearError } = await supabase
    .from<unknown>("center_category_assignments")
    .update({
      is_primary: false,
      updated_at: now,
    })
    .eq("center_id", centerId)
    .is("deleted_at", null);

  if (clearError !== null) {
    return failure("Existing category assignment could not be updated.");
  }

  const { data: existingAssignment, error: existingAssignmentError } = await supabase
    .from<CenterCategoryAssignmentRow>("center_category_assignments")
    .select("id")
    .eq("center_id", centerId)
    .eq("category_id", categoryId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingAssignmentError !== null) {
    return failure("Existing category assignment could not be checked.");
  }

  const assignmentPayload = {
    category_id: category.id,
    center_id: centerId,
    is_primary: true,
    is_public: false,
    metadata: {
      assigned_from: "CENTER-TAX-A",
      assignment_scope: "admin_draft_center_taxonomy",
    },
    review_status: "draft",
    sort_order: 0,
    updated_at: now,
    vertical_id: category.vertical_id,
  } satisfies Record<string, unknown>;

  if (existingAssignment !== null) {
    const { data: updatedAssignment, error: updateError } = await supabase
      .from<CenterCategoryAssignmentRow>("center_category_assignments")
      .update(assignmentPayload)
      .eq("id", existingAssignment.id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (updateError !== null || updatedAssignment === null) {
      return failure("Category assignment could not be saved.");
    }
  } else {
    const { data: insertedAssignment, error: insertError } = await supabase
      .from<CenterCategoryAssignmentRow>("center_category_assignments")
      .insert({
        ...assignmentPayload,
        created_at: now,
      })
      .select("id")
      .maybeSingle();

    if (insertError !== null || insertedAssignment === null) {
      return failure("Category assignment could not be created.");
    }
  }

  revalidateCenterTaxonomy(centerId);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.taxonomy.update",
    action: "draft_center.taxonomy_updated",
    entityType: "draft_center",
    entityId: centerId,
    targetTable: "center_category_assignments",
    summary: "Draft center primary category updated.",
    newValues: { category_id: categoryId },
  });

  return {
    ok: true,
    message: "Primary category saved for admin review. The center is still not public or active.",
  };
}
