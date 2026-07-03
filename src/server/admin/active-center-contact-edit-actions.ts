"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];
type CenterLocationRow = Database["public"]["Tables"]["center_locations"]["Row"];
type CenterLocationUpdate = Database["public"]["Tables"]["center_locations"]["Update"];

type CenterEditRow = Pick<
  CenterRow,
  "id" | "slug" | "status" | "default_country" | "is_active" | "deleted_at" | "primary_phone" | "secondary_phone" | "whatsapp_phone" | "email" | "website_url"
>;

type LocationEditRow = Pick<CenterLocationRow, "id" | "map_url">;

type UpdatedRow = { id: string };

function formText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const text = value.normalize("NFKC").trim();
  if (text.length === 0) return null;
  return text.slice(0, maxLength);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function pathFor(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

async function getPrimaryActiveLocation(centerId: string): Promise<LocationEditRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("center_locations")
    .select("id,map_url")
    .eq("center_id", centerId)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error !== null || data === null) return null;
  return data as LocationEditRow;
}

export async function updateActiveCenterPublicContactDetails(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("active_centers.public_state.update");
  const centerId = formText(formData, "centerId", 64);
  if (centerId === null || !isUuid(centerId)) return;

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error } = await supabase
    .from("centers")
    .select("id,slug,status,default_country,is_active,deleted_at,primary_phone,secondary_phone,whatsapp_phone,email,website_url")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null || center === null) return;

  const current = center as CenterEditRow;
  const primaryPhone = formText(formData, "primaryPhone", 64);
  const secondaryPhone = formText(formData, "secondaryPhone", 64);
  const whatsappPhone = formText(formData, "whatsappPhone", 64);
  const email = formText(formData, "email", 254);
  const websiteUrl = formText(formData, "websiteUrl", 2048);
  const mapUrl = formText(formData, "mapUrl", 2048);

  const centerUpdate: CenterUpdate = {
    primary_phone: primaryPhone,
    secondary_phone: secondaryPhone,
    whatsapp_phone: whatsappPhone,
    email,
    website_url: websiteUrl,
    contact_review_status: "approved",
    public_primary_phone_visible: hasText(primaryPhone),
    public_secondary_phone_visible: hasText(secondaryPhone),
    public_whatsapp_phone_visible: hasText(whatsappPhone),
    public_email_visible: hasText(email),
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("centers")
    .update(centerUpdate)
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || (updated as UpdatedRow | null) === null) return;

  const location = await getPrimaryActiveLocation(centerId);
  if (location !== null) {
    const locationUpdate: CenterLocationUpdate = {
      map_url: mapUrl,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("center_locations").update(locationUpdate).eq("id", location.id).select("id").maybeSingle();
  }

  const enPath = pathFor("en", current.default_country, current.slug);
  const arPath = pathFor("ar", current.default_country, current.slug);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "active_centers.public_state.update",
    action: "active_center.public_contact_actions_prepared",
    entityType: "center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Active center public contact details updated.",
    oldValues: {
      has_primary_phone: hasText(current.primary_phone),
      has_secondary_phone: hasText(current.secondary_phone),
      has_whatsapp_phone: hasText(current.whatsapp_phone),
      has_email: hasText(current.email),
      has_website_url: hasText(current.website_url),
      has_map_url: location !== null && hasText(location.map_url),
    },
    newValues: {
      has_primary_phone: hasText(primaryPhone),
      has_secondary_phone: hasText(secondaryPhone),
      has_whatsapp_phone: hasText(whatsappPhone),
      has_email: hasText(email),
      has_website_url: hasText(websiteUrl),
      has_map_url: hasText(mapUrl),
    },
    metadata: {
      public_paths: [enPath, arPath],
      primary_location_id: location?.id ?? null,
    },
  });

  revalidatePath(enPath);
  revalidatePath(arPath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/active-centers");
  revalidatePath(`/admin/active-centers/${centerId}/gates`);
}
