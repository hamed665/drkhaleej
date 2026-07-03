"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];

type CenterContactMutationRow = Pick<
  CenterRow,
  | "id"
  | "slug"
  | "status"
  | "default_country"
  | "is_active"
  | "deleted_at"
  | "primary_phone"
  | "secondary_phone"
  | "whatsapp_phone"
  | "email"
  | "website_url"
  | "public_primary_phone_visible"
  | "public_secondary_phone_visible"
  | "public_whatsapp_phone_visible"
  | "public_email_visible"
  | "contact_review_status"
>;

type UpdatedCenterRow = Pick<CenterRow, "id">;

function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function publicCenterPath(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

export async function prepareActiveCenterPublicContacts(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("active_centers.public_state.update");
  const centerId = formString(formData, "centerId");
  if (centerId === null || !isUuid(centerId)) return;

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id,slug,status,default_country,is_active,deleted_at,primary_phone,secondary_phone,whatsapp_phone,email,website_url,public_primary_phone_visible,public_secondary_phone_visible,public_whatsapp_phone_visible,public_email_visible,contact_review_status")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) return;

  const current = center as CenterContactMutationRow;
  const updatePayload: CenterUpdate = {
    contact_review_status: "approved",
    public_primary_phone_visible: hasText(current.primary_phone) ? true : current.public_primary_phone_visible,
    public_secondary_phone_visible: hasText(current.secondary_phone) ? true : current.public_secondary_phone_visible,
    public_whatsapp_phone_visible: hasText(current.whatsapp_phone) ? true : current.public_whatsapp_phone_visible,
    public_email_visible: hasText(current.email) ? true : current.public_email_visible,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("centers")
    .update(updatePayload)
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || (updated as UpdatedCenterRow | null) === null) return;

  const enPath = publicCenterPath("en", current.default_country, current.slug);
  const arPath = publicCenterPath("ar", current.default_country, current.slug);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "active_centers.public_state.update",
    action: "active_center.public_contact_actions_prepared",
    entityType: "center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Active center public contact actions prepared.",
    oldValues: {
      contact_review_status: current.contact_review_status,
      public_primary_phone_visible: current.public_primary_phone_visible,
      public_secondary_phone_visible: current.public_secondary_phone_visible,
      public_whatsapp_phone_visible: current.public_whatsapp_phone_visible,
      public_email_visible: current.public_email_visible,
    },
    newValues: {
      contact_review_status: "approved",
      public_primary_phone_visible: updatePayload.public_primary_phone_visible ?? null,
      public_secondary_phone_visible: updatePayload.public_secondary_phone_visible ?? null,
      public_whatsapp_phone_visible: updatePayload.public_whatsapp_phone_visible ?? null,
      public_email_visible: updatePayload.public_email_visible ?? null,
    },
    metadata: {
      has_primary_phone: hasText(current.primary_phone),
      has_secondary_phone: hasText(current.secondary_phone),
      has_whatsapp_phone: hasText(current.whatsapp_phone),
      has_email: hasText(current.email),
      has_website_url: hasText(current.website_url),
      public_paths: [enPath, arPath],
    },
  });

  revalidatePath(enPath);
  revalidatePath(arPath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/active-centers");
  revalidatePath(`/admin/active-centers/${centerId}`);
  revalidatePath(`/admin/active-centers/${centerId}/gates`);
}
