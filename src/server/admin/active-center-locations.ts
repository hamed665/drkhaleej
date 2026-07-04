import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

export type AdminActiveLocation = {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
  addressEn: string | null;
  addressAr: string | null;
  areaId: string | null;
  cityId: string;
  countryId: string;
  regionId: string;
  isPrimary: boolean;
  mapUrl: string | null;
  sortOrder: number;
  updatedAt: string;
};

export type AdminActiveLocationCenter = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  country: string;
  publicPathEn: string;
  publicPathAr: string;
};

export type AdminActiveLocationsResult =
  | { ok: true; center: AdminActiveLocationCenter; locations: AdminActiveLocation[] }
  | { ok: false; reason: "not_found" | "unavailable" };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function pathFor(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

export async function getAdminActiveCenterLocations(centerId: string): Promise<AdminActiveLocationsResult> {
  await requireAdminPermission("active_centers.public_state.update");
  if (!isUuid(centerId)) return { ok: false, reason: "not_found" };

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id,name_en,name_ar,slug,default_country")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null) return { ok: false, reason: "unavailable" };
  if (center === null) return { ok: false, reason: "not_found" };

  const country = center.default_country.toLowerCase();
  const { data: locations, error: locationsError } = await supabase
    .from("center_locations")
    .select("id,name_en,name_ar,address_line1_en,address_line1_ar,area_id,city_id,country_id,region_id,is_primary,map_url,sort_order,updated_at")
    .eq("center_id", centerId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(20);

  if (locationsError !== null || locations === null) return { ok: false, reason: "unavailable" };

  return {
    ok: true,
    center: {
      id: center.id,
      nameEn: center.name_en,
      nameAr: center.name_ar,
      slug: center.slug,
      country,
      publicPathEn: pathFor("en", country, center.slug),
      publicPathAr: pathFor("ar", country, center.slug),
    },
    locations: locations.map((location) => ({
      id: location.id,
      nameEn: location.name_en,
      nameAr: location.name_ar,
      addressEn: location.address_line1_en,
      addressAr: location.address_line1_ar,
      areaId: location.area_id,
      cityId: location.city_id,
      countryId: location.country_id,
      regionId: location.region_id,
      isPrimary: location.is_primary,
      mapUrl: location.map_url,
      sortOrder: location.sort_order,
      updatedAt: location.updated_at,
    })),
  };
}
