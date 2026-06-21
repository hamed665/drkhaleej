"use server";

import { revalidatePath } from "next/cache";

import { requireAdminPermission } from "@/server/admin/permissions";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];

type ReviewableCenterRow = {
  email: string | null;
  id: string;
  name_en: string;
  primary_phone: string | null;
  slug: string;
  status: Database["public"]["Enums"]["provider_status"];
  whatsapp_phone: string | null;
};

export type DraftCenterWorkflowState = {
  ok: boolean;
  message: string | null;
};

function workflowFailure(message: string): DraftCenterWorkflowState {
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

function hasContact(center: ReviewableCenterRow): boolean {
  return (
    (center.primary_phone !== null && center.primary_phone.trim().length > 0) ||
    (center.whatsapp_phone !== null && center.whatsapp_phone.trim().length > 0) ||
    (center.email !== null && center.email.trim().length > 0)
  );
}

function hasMinimumReviewFields(center: ReviewableCenterRow): boolean {
  return center.name_en.trim().length > 0 && center.slug.trim().length > 0 && hasContact(center);
}

function revalidateCenterWorkflow(centerId: string): void {
  revalidatePath("/admin/draft-centers");
  revalidatePath(`/admin/draft-centers/${centerId}`);
  revalidatePath("/admin/center-subscriptions");
}

async function loadCenterForWorkflow(centerId: string): Promise<{
  center: ReviewableCenterRow | null;
  unavailable: boolean;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id, slug, name_en, status, primary_phone, whatsapp_phone, email")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) return { center: null, unavailable: true };
  return { center: data, unavailable: false };
}

export async function markDraftCenterReadyForReview(
  _previousState: DraftCenterWorkflowState,
  formData: FormData,
): Promise<DraftCenterWorkflowState> {
  const admin = await requireAdminPermission("draft_centers.workflow.update");

  const centerId = readFormString(formData, "centerId");
  if (centerId === null || !isUuid(centerId)) {
    return workflowFailure("Draft center could not be identified.");
  }

  const { center, unavailable } = await loadCenterForWorkflow(centerId);
  if (unavailable) return workflowFailure("Draft center could not be loaded.");
  if (center === null) return workflowFailure("Draft center was not found.");

  if (center.status !== "draft") {
    return workflowFailure("Only draft centers can be marked ready for review.");
  }

  if (!hasMinimumReviewFields(center)) {
    return workflowFailure(
      "Add an English name, slug, and at least one contact field before marking ready for review.",
    );
  }

  const updatePayload: CenterUpdate = {
    is_active: false,
    status: "pending_review",
    updated_at: new Date().toISOString(),
  };

  const supabase = createSupabaseServiceRoleClient();
  const { data: updatedCenter, error: updateError } = await supabase
    .from("centers")
    .update(updatePayload)
    .eq("id", centerId)
    .eq("status", "draft")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedCenter === null) {
    return workflowFailure("Draft center could not be marked ready for review.");
  }

  revalidateCenterWorkflow(centerId);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.workflow.update",
    action: "draft_center.workflow_updated",
    entityType: "draft_center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Draft center marked ready for review.",
    oldValues: { status: "draft" },
    newValues: { status: "pending_review" },
  });

  return {
    ok: true,
    message: "Draft center was marked ready for review. It is still not public or active.",
  };
}

export async function returnCenterToDraft(
  _previousState: DraftCenterWorkflowState,
  formData: FormData,
): Promise<DraftCenterWorkflowState> {
  const admin = await requireAdminPermission("draft_centers.workflow.update");

  const centerId = readFormString(formData, "centerId");
  if (centerId === null || !isUuid(centerId)) {
    return workflowFailure("Center could not be identified.");
  }

  const supabase = createSupabaseServiceRoleClient();
  const updatePayload: CenterUpdate = {
    is_active: false,
    status: "draft",
    updated_at: new Date().toISOString(),
  };

  const { data: updatedCenter, error: updateError } = await supabase
    .from("centers")
    .update(updatePayload)
    .eq("id", centerId)
    .eq("status", "pending_review")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedCenter === null) {
    return workflowFailure("Center could not be returned to draft.");
  }

  revalidateCenterWorkflow(centerId);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.workflow.update",
    action: "draft_center.workflow_updated",
    entityType: "draft_center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Draft center returned to draft.",
    oldValues: { status: "pending_review" },
    newValues: { status: "draft" },
  });

  return {
    ok: true,
    message: "Center was returned to draft. It is still not public or active.",
  };
}
