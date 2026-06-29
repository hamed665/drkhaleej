import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterLocationRow = Database["public"]["Tables"]["center_locations"]["Row"];

type LocationListRow = Pick<
  CenterLocationRow,
  | "id"
  | "name_en"
  | "name_ar"
  | "address_line1_en"
  | "address_line1_ar"
  | "area_id"
  | "city_id"
  | "country_id"
  | "region_id"
  | "is_active"
  | "is_primary"
  | "map_url"
  | "primary_phone"
  | "whatsapp_phone"
  | "email"
  | "contact_review_status"
  | "public_primary_phone_visible"
  | "public_whatsapp_phone_visible"
  | "public_email_visible"
  | "sort_order"
  | "updated_at"
>;

export type AdminDraftCenterLocation = {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
  addressLine1En: string | null;
  addressLine1Ar: string | null;
  areaId: string | null;
  cityId: string;
  countryId: string;
  regionId: string;
  isActive: boolean;
  isPrimary: boolean;
  mapUrl: string | null;
  primaryPhone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  contactReviewStatus: string;
  publicPrimaryPhoneVisible: boolean;
  publicWhatsappPhoneVisible: boolean;
  publicEmailVisible: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AdminDraftCenterLocationsResult =
  | { ok: true; locations: AdminDraftCenterLocation[] }
  | { ok: false; reason: "unavailable" };

function mapLocation(row: LocationListRow): AdminDraftCenterLocation {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    addressLine1En: row.address_line1_en,
    addressLine1Ar: row.address_line1_ar,
    areaId: row.area_id,
    cityId: row.city_id,
    countryId: row.country_id,
    regionId: row.region_id,
    isActive: row.is_active,
    isPrimary: row.is_primary,
    mapUrl: row.map_url,
    primaryPhone: row.primary_phone,
    whatsappPhone: row.whatsapp_phone,
    email: row.email,
    contactReviewStatus: row.contact_review_status,
    publicPrimaryPhoneVisible: row.public_primary_phone_visible,
    publicWhatsappPhoneVisible: row.public_whatsapp_phone_visible,
    publicEmailVisible: row.public_email_visible,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

export async function listAdminDraftCenterLocations(
  centerId: string,
): Promise<AdminDraftCenterLocationsResult> {
  await requireAdminPermission("draft_centers.read");

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("center_locations")
    .select(
      "id,name_en,name_ar,address_line1_en,address_line1_ar,area_id,city_id,country_id,region_id,is_active,is_primary,map_url,primary_phone,whatsapp_phone,email,contact_review_status,public_primary_phone_visible,public_whatsapp_phone_visible,public_email_visible,sort_order,updated_at",
    )
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(20);

  if (error !== null || data === null) {
    return { ok: false, reason: "unavailable" };
  }

  return { ok: true, locations: data.map(mapLocation) };
}
