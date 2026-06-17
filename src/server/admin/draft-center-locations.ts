import "server-only";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminDraftCenterDetail } from "@/server/admin/draft-centers";

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  is(column: string, value: boolean | null): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResponse<T>>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  select(columns: string): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

type CenterLocationRow = {
  address_line1_ar: string | null;
  address_line1_en: string | null;
  address_line2_ar: string | null;
  address_line2_en: string | null;
  area_id: string | null;
  city_id: string;
  country_id: string;
  email: string | null;
  id: string;
  is_active: boolean;
  is_primary: boolean;
  landmark_ar: string | null;
  landmark_en: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  map_url: string | null;
  name_ar: string | null;
  name_en: string | null;
  postal_code: string | null;
  primary_phone: string | null;
  region_id: string;
  secondary_phone: string | null;
  slug: string;
  whatsapp_phone: string | null;
};

type GeoCountryRow = {
  id: string;
  name_ar: string;
  name_en: string;
  phone_country_code: string | null;
  slug: string;
  sort_order: number;
};

type GeoRegionRow = {
  country_id: string;
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  sort_order: number;
};

type GeoCityRow = {
  country_id: string;
  id: string;
  name_ar: string;
  name_en: string;
  region_id: string | null;
  slug: string;
  sort_order: number;
};

type GeoAreaRow = {
  city_id: string;
  country_id: string;
  id: string;
  name_ar: string;
  name_en: string;
  region_id: string | null;
  slug: string;
  sort_order: number;
};

export type AdminDraftCenterLocation = {
  addressLine1Ar: string | null;
  addressLine1En: string | null;
  addressLine2Ar: string | null;
  addressLine2En: string | null;
  areaId: string | null;
  cityId: string;
  countryId: string;
  email: string | null;
  googleDirectionsUrl: string | null;
  id: string;
  isActive: boolean;
  isPrimary: boolean;
  landmarkAr: string | null;
  landmarkEn: string | null;
  latitude: string | null;
  longitude: string | null;
  mapUrl: string | null;
  nameAr: string | null;
  nameEn: string | null;
  postalCode: string | null;
  primaryPhone: string | null;
  regionId: string;
  secondaryPhone: string | null;
  slug: string;
  whatsappPhone: string | null;
  whatsappUrl: string | null;
};

export type AdminGeoOption = {
  countryId?: string;
  id: string;
  labelAr: string;
  labelEn: string;
  parentId?: string | null;
  phoneCountryCode?: string | null;
  slug: string;
};

export type AdminDraftCenterLocationOptions = {
  areas: AdminGeoOption[];
  cities: AdminGeoOption[];
  countries: AdminGeoOption[];
  regions: AdminGeoOption[];
};

export type AdminDraftCenterLocationResult =
  | {
      ok: true;
      location: AdminDraftCenterLocation | null;
      options: AdminDraftCenterLocationOptions;
    }
  | { ok: false; reason: "unavailable"; location: null; options: AdminDraftCenterLocationOptions };

const emptyOptions: AdminDraftCenterLocationOptions = {
  areas: [],
  cities: [],
  countries: [],
  regions: [],
};

function locationClient(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function stringValue(value: number | string | null): string | null {
  if (value === null) return null;
  return String(value);
}

function mapUrlFromCoordinates(latitude: string | null, longitude: string | null): string | null {
  if (latitude === null || longitude === null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function normalizeWhatsAppForUrl(phone: string | null): string | null {
  if (phone === null) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 8) return `968${digits}`;
  if (digits.length >= 9) return digits;
  return null;
}

function buildWhatsAppUrl(phone: string | null): string | null {
  const normalized = normalizeWhatsAppForUrl(phone);
  return normalized === null ? null : `https://wa.me/${normalized}`;
}

function mapLocation(row: CenterLocationRow): AdminDraftCenterLocation {
  const latitude = stringValue(row.latitude);
  const longitude = stringValue(row.longitude);

  return {
    addressLine1Ar: row.address_line1_ar,
    addressLine1En: row.address_line1_en,
    addressLine2Ar: row.address_line2_ar,
    addressLine2En: row.address_line2_en,
    areaId: row.area_id,
    cityId: row.city_id,
    countryId: row.country_id,
    email: row.email,
    googleDirectionsUrl: row.map_url ?? mapUrlFromCoordinates(latitude, longitude),
    id: row.id,
    isActive: row.is_active,
    isPrimary: row.is_primary,
    landmarkAr: row.landmark_ar,
    landmarkEn: row.landmark_en,
    latitude,
    longitude,
    mapUrl: row.map_url,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    postalCode: row.postal_code,
    primaryPhone: row.primary_phone,
    regionId: row.region_id,
    secondaryPhone: row.secondary_phone,
    slug: row.slug,
    whatsappPhone: row.whatsapp_phone,
    whatsappUrl: buildWhatsAppUrl(row.whatsapp_phone),
  };
}

function mapCountry(row: GeoCountryRow): AdminGeoOption {
  return {
    id: row.id,
    labelAr: row.name_ar,
    labelEn: row.name_en,
    phoneCountryCode: row.phone_country_code,
    slug: row.slug,
  };
}

function mapRegion(row: GeoRegionRow): AdminGeoOption {
  return {
    countryId: row.country_id,
    id: row.id,
    labelAr: row.name_ar,
    labelEn: row.name_en,
    parentId: row.country_id,
    slug: row.slug,
  };
}

function mapCity(row: GeoCityRow): AdminGeoOption {
  return {
    countryId: row.country_id,
    id: row.id,
    labelAr: row.name_ar,
    labelEn: row.name_en,
    parentId: row.region_id,
    slug: row.slug,
  };
}

function mapArea(row: GeoAreaRow): AdminGeoOption {
  return {
    countryId: row.country_id,
    id: row.id,
    labelAr: row.name_ar,
    labelEn: row.name_en,
    parentId: row.city_id,
    slug: row.slug,
  };
}

export async function getAdminDraftCenterLocation(
  centerId: string,
  center: AdminDraftCenterDetail,
): Promise<AdminDraftCenterLocationResult> {
  await requirePlatformAdmin();

  const supabase = locationClient();

  const [{ data: countries, error: countriesError }, { data: regions, error: regionsError }, { data: cities, error: citiesError }, { data: areas, error: areasError }] =
    await Promise.all([
      supabase
        .from<GeoCountryRow[]>("geo_countries")
        .select("id, slug, name_en, name_ar, phone_country_code, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(100),
      supabase
        .from<GeoRegionRow[]>("geo_regions")
        .select("id, country_id, slug, name_en, name_ar, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(200),
      supabase
        .from<GeoCityRow[]>("geo_cities")
        .select("id, country_id, region_id, slug, name_en, name_ar, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(500),
      supabase
        .from<GeoAreaRow[]>("geo_areas")
        .select("id, country_id, region_id, city_id, slug, name_en, name_ar, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(1000),
    ]);

  if (
    countriesError !== null ||
    regionsError !== null ||
    citiesError !== null ||
    areasError !== null ||
    countries === null ||
    regions === null ||
    cities === null ||
    areas === null
  ) {
    return { ok: false, reason: "unavailable", location: null, options: emptyOptions };
  }

  const { data: location, error: locationError } = await supabase
    .from<CenterLocationRow>("center_locations")
    .select("id, center_id, country_id, region_id, city_id, area_id, slug, name_en, name_ar, address_line1_en, address_line1_ar, address_line2_en, address_line2_ar, landmark_en, landmark_ar, postal_code, primary_phone, secondary_phone, whatsapp_phone, email, map_url, latitude, longitude, is_primary, is_active")
    .eq("center_id", center.id)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (locationError !== null) {
    return { ok: false, reason: "unavailable", location: null, options: emptyOptions };
  }

  return {
    ok: true,
    location: location === null ? null : mapLocation(location),
    options: {
      areas: areas.map(mapArea),
      cities: cities.map(mapCity),
      countries: countries.map(mapCountry),
      regions: regions.map(mapRegion),
    },
  };
}
