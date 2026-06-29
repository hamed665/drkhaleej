"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type LocationRow = Database["public"]["Tables"]["center_locations"]["Row"];
type LocationUpdate = Database["public"]["Tables"]["center_locations"]["Update"];
type CenterStatus = Database["public"]["Enums"]["provider_status"];

type ContactRow = Pick<
  LocationRow,
  | "contact_review_status"
  | "email"
  | "id"
  | "is_active"
  | "primary_phone"
  | "public_email_visible"
  | "public_primary_phone_visible"
  | "public_whatsapp_phone_visible"
  | "whatsapp_phone"
>;

export type DraftLocationContactVisibilityState = {
  ok: boolean;
  message: string | null;
};

const draftStatuses = ["draft", "pending_review"] as const satisfies readonly CenterStatus[];

const failure: DraftLocationContactVisibilityState = {
  ok: false,
  message: "Contact visibility could not be updated.",
};

function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function formBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export async function updateDraftLocationContactVisibility(
  _previousState: DraftLocationContactVisibilityState,
  formData: FormData,
): Promise<DraftLocationContactVisibilityState> {
  const admin = await requireAdminPermission("draft_centers.update");
  const centerId = formString(formData, "centerId");
  const locationId = formString(formData, "locationId");

  if (centerId === null || !isUuid(centerId)) return failure;
  if (locationId === null || !isUuid(locationId)) return failure;

  const nextPrimary = formBoolean(formData, "publicPrimaryPhoneVisible");
  const nextWhatsapp = formBoolean(formData, "publicWhatsappPhoneVisible");
  const nextEmail = formBoolean(formData, "publicEmailVisible");
  const nextStatus = nextPrimary || nextWhatsapp || nextEmail ? "approved" : "pending";

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id,status")
    .eq("id", centerId)
    .in("status", [...draftStatuses])
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) return failure;

  const { data: location, error: locationError } = await supabase
    .from("center_locations")
    .select("id,is_active,primary_phone,whatsapp_phone,email,contact_review_status,public_primary_phone_visible,public_whatsapp_phone_visible,public_email_visible")
    .eq("id", locationId)
    .eq("center_id", centerId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (locationError !== null || location === null) return failure;

  const current = location as ContactRow;
  if (!current.is_active) return failure;
  if (nextPrimary && !hasText(current.primary_phone)) return failure;
  if (nextWhatsapp && !hasText(current.whatsapp_phone)) return failure;
  if (nextEmail && !hasText(current.email)) return failure;

  const updatePayload: LocationUpdate = {
    contact_review_status: nextStatus,
    contact_reviewed_at: new Date().toISOString(),
    public_email_visible: nextEmail,
    public_primary_phone_visible: nextPrimary,
    public_whatsapp_phone_visible: nextWhatsapp,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("center_locations")
    .update(updatePayload)
    .eq("id", locationId)
    .eq("center_id", centerId)
    .eq("is_active", true)
    .is("deleted_at", null);

  if (updateError !== null) return failure;

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.update",
    action: "draft_center.contact_visibility_updated",
    entityType: "center",
    entityId: centerId,
    targetTable: "center_locations",
    summary: "Draft location contact visibility updated.",
    oldValues: {
      contact_review_status: current.contact_review_status,
      location_id: locationId,
      public_email_visible: current.public_email_visible,
      public_primary_phone_visible: current.public_primary_phone_visible,
      public_whatsapp_phone_visible: current.public_whatsapp_phone_visible,
    },
    newValues: {
      contact_review_status: nextStatus,
      location_id: locationId,
      public_email_visible: nextEmail,
      public_primary_phone_visible: nextPrimary,
      public_whatsapp_phone_visible: nextWhatsapp,
    },
  });

  revalidatePath(`/admin/draft-centers/${centerId}`);

  return {
    ok: true,
    message: nextStatus === "approved" ? "Contact visibility was updated." : "Contact visibility was revoked.",
  };
}
