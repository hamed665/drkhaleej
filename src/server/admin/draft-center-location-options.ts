import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminPermission } from "@/server/admin/permissions";

export type DraftLocationCountryOption = {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
};

export type DraftLocationRegionOption = {
  id: string;
  nameEn: string;
  nameAr: string;
  countryId: string;
};

export type DraftLocationCityOption = {
  id: string;
  nameEn: string;
  nameAr: string;
  countryId: string;
  regionId: string | null;
};

export type DraftLocationAreaOption = {
  id: string;
  nameEn: string;
  nameAr: string;
  countryId: string;
  regionId: string | null;
  cityId: string;
};

export type DraftLocationOptions = {
  countries: DraftLocationCountryOption[];
  regions: DraftLocationRegionOption[];
  cities: DraftLocationCityOption[];
  areas: DraftLocationAreaOption[];
};

export type DraftLocationOptionsResult =
  | { ok: true; options: DraftLocationOptions }
  | { ok: false; reason: "unavailable" };

export async function getDraftLocationOptions(): Promise<DraftLocationOptionsResult> {
  await requireAdminPermission("draft_centers.read");

  const supabase = createSupabaseServiceRoleClient();
  const [countriesResult, regionsResult, citiesResult, areasResult] = await Promise.all([
    supabase
      .from("geo_countries")
      .select("id,name_en,name_ar,code")
      .eq("code", "om")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(5),
    supabase
      .from("geo_regions")
      .select("id,name_en,name_ar,country_id")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(100),
    supabase
      .from("geo_cities")
      .select("id,name_en,name_ar,country_id,region_id")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(250),
    supabase
      .from("geo_areas")
      .select("id,name_en,name_ar,country_id,region_id,city_id")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(500),
  ]);

  if (countriesResult.error || regionsResult.error || citiesResult.error || areasResult.error) {
    return { ok: false, reason: "unavailable" };
  }

  return {
    ok: true,
    options: {
      countries: (countriesResult.data ?? []).map((row) => ({
        id: row.id,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        code: row.code,
      })),
      regions: (regionsResult.data ?? []).map((row) => ({
        id: row.id,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        countryId: row.country_id,
      })),
      cities: (citiesResult.data ?? []).map((row) => ({
        id: row.id,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        countryId: row.country_id,
        regionId: row.region_id,
      })),
      areas: (areasResult.data ?? []).map((row) => ({
        id: row.id,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        countryId: row.country_id,
        regionId: row.region_id,
        cityId: row.city_id,
      })),
    },
  };
}
