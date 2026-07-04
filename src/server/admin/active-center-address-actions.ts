"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type LocationRow = Database["public"]["Tables"]["center_locations"]["Row"];
type LocationUpdate = Database["public"]["Tables"]["center_locations"]["Update"];

type CenterRouteRow = Pick<CenterRow, "id" | "slug" | "default_country">;
type PrimaryLocationRow = Pick<LocationRow, "id" | "address_line1_en" | "address_line1_ar" | "map_url">;
type UpdatedRow = { id: string };

function text(formData: FormData, key: string, maxLength: number): string | null | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").trim();
  if (normalized.length === 0) return null;
  if (normalized.length > maxLength) return undefined;
  return normalized;
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

export async function updateActiveCenterPrimaryLocationDetails(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("active_centers.public_state.update");
  const centerId = text(formData, "centerId", 64);
  if (centerId === null || centerId === undefined || !isUuid(centerId)) return;

  const addressLine1En = text(formData, "addressLine1En", 300);
  const addressLine1Ar = text(formData, "addressLine1Ar", 300);
  const mapUrl = text(formData, "mapUrl", 2048);
  if (addressLine1En === undefined || addressLine1Ar === undefined || mapUrl === undefined) return;

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id,slug,default_country")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) return;
  const route = center as CenterRouteRow;

  const { data: location, error: locationError } = await supabase
    .from("center_locations")
    .select("id,address_line1_en,address_line1_ar,map_url")
    .eq("center_id", centerId)
    .eq("is_active", true)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (locationError !== null || location === null) return;
  const current = location as PrimaryLocationRow;
  const updatePayload: LocationUpdate = {
    address_line1_en: addressLine1En,
    address_line1_ar: addressLine1Ar,
    map_url: mapUrl,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("center_locations")
    .update(updatePayload)
    .eq("id", current.id)
    .eq("center_id", centerId)
    .eq("is_active", true)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || (updated as UpdatedRow | null) === null) return;

  const enPath = pathFor("en", route.default_country, route.slug);
  const arPath = pathFor("ar", route.default_country, route.slug);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "active_centers.public_state.update",
    action: "active_center.primary_location_updated",
    entityType: "center",
    entityId: centerId,
    targetTable: "center_locations",
    summary: "Active center primary location details updated.",
    oldValues: {
      has_address_line1_en: hasText(current.address_line1_en),
      has_address_line1_ar: hasText(current.address_line1_ar),
      has_map_url: hasText(current.map_url),
    },
    newValues: {
      has_address_line1_en: hasText(addressLine1En),
      has_address_line1_ar: hasText(addressLine1Ar),
      has_map_url: hasText(mapUrl),
    },
    metadata: {
      public_paths: [enPath, arPath],
      location_id: current.id,
    },
  });

  revalidatePath(enPath);
  revalidatePath(arPath);
  revalidatePath("/admin/active-centers");
  revalidatePath(`/admin/active-centers/${centerId}/locations`);
}
