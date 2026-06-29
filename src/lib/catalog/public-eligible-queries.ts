import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

import {
  getPublicCenterBySlug as getUngatedPublicCenterBySlug,
  getPublicDoctorBySlug as getUngatedPublicDoctorBySlug,
} from "./public-queries";
import type {
  PublicCatalogEmptyReason,
  PublicCatalogQueryError,
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterDetail,
  PublicCenterDetailOptions,
  PublicCenterListOptions,
  PublicCenterSummary,
  PublicDoctorDetail,
  PublicDoctorDetailOptions,
  PublicDoctorListOptions,
  PublicDoctorSummary,
  PublicGeoAreaSummary,
  PublicSearchOptions,
  PublicServiceSummary,
} from "./public-types";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
type GeoAreaRow = Database["public"]["Tables"]["geo_areas"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];

type PublicCenterSummaryRow = Pick<
  CenterRow,
  | "id"
  | "slug"
  | "name_en"
  | "name_ar"
  | "center_type"
  | "description_en"
  | "description_ar"
  | "short_description_en"
  | "short_description_ar"
  | "default_country"
>;

type PublicDoctorSummaryRow = Pick<
  DoctorRow,
  | "id"
  | "slug"
  | "full_name_en"
  | "full_name_ar"
  | "title"
  | "gender"
  | "default_country"
>;

type PublicServiceSummaryRow = Pick<
  ServiceRow,
  | "id"
  | "slug"
  | "name_en"
  | "name_ar"
  | "category_id"
  | "description_en"
  | "description_ar"
>;

type PublicGeoAreaSummaryRow = Pick<
  GeoAreaRow,
  | "id"
  | "slug"
  | "name_en"
  | "name_ar"
  | "city_id"
  | "country_id"
>;

type CenterDetailRelationEligibility = {
  doctorIds: Set<string>;
  error: boolean;
  locationIds: Set<string>;
  serviceIds: Set<string>;
};

type DoctorDetailRelationEligibility = {
  centerIds: Set<string>;
  error: boolean;
  locationIds: Set<string>;
  practiceLocationIds: Set<string>;
  serviceIds: Set<string>;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_SEARCH_QUERY_LENGTH = 64;
const DETAIL_RELATION_LIMIT = 100;

const safeVerificationStatuses = [
  "unverified",
  "pending",
  "verified",
] as const satisfies readonly VerificationStatus[];

function verificationStatusFilterValues(): VerificationStatus[] {
  return [...safeVerificationStatuses];
}

function clampLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) return DEFAULT_LIMIT;
  if (limit < 1) return 1;
  return Math.min(limit, MAX_LIMIT);
}

function normalizeSearchQuery(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH);
}

function createSuccessResult<T>(
  data: T,
  emptyReason: PublicCatalogEmptyReason | null = null,
): PublicCatalogQueryResult<T> {
  return { ok: true, data, emptyReason, error: null };
}

function createErrorResult<T>(fallbackData: T): PublicCatalogQueryResult<T> {
  const error: PublicCatalogQueryError = {
    code: "PUBLIC_CATALOG_QUERY_FAILED",
    message: "Public catalog query failed.",
  };

  return {
    ok: false,
    data: fallbackData,
    emptyReason: "query_error",
    error,
  };
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0)));
}

function mapCenterSummary(row: PublicCenterSummaryRow): PublicCenterSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    centerType: row.center_type,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar,
    shortDescriptionEn: row.short_description_en,
    shortDescriptionAr: row.short_description_ar,
    defaultCountry: row.default_country,
  };
}

function mapDoctorSummary(row: PublicDoctorSummaryRow): PublicDoctorSummary {
  return {
    id: row.id,
    slug: row.slug,
    fullNameEn: row.full_name_en,
    fullNameAr: row.full_name_ar,
    titleEn: row.title,
    titleAr: row.title,
    gender: row.gender,
    defaultCountry: row.default_country,
  };
}

function mapServiceSummary(row: PublicServiceSummaryRow): PublicServiceSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    categoryId: row.category_id,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar,
  };
}

function mapGeoAreaSummary(row: PublicGeoAreaSummaryRow): PublicGeoAreaSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    cityId: row.city_id,
    countryId: row.country_id,
  };
}

async function getEligibleDoctorIdSet(doctorIds: string[]): Promise<{ ids: Set<string>; error: boolean }> {
  if (doctorIds.length === 0) return { ids: new Set(), error: false };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id")
    .in("id", doctorIds)
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .limit(DETAIL_RELATION_LIMIT);

  if (error) return { ids: new Set(), error: true };
  return { ids: new Set((data ?? []).map((row) => row.id)), error: false };
}

async function getEligibleCenterIdSet(centerIds: string[]): Promise<{ ids: Set<string>; error: boolean }> {
  if (centerIds.length === 0) return { ids: new Set(), error: false };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id")
    .in("id", centerIds)
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .limit(DETAIL_RELATION_LIMIT);

  if (error) return { ids: new Set(), error: true };
  return { ids: new Set((data ?? []).map((row) => row.id)), error: false };
}

async function getActiveServiceIdSet(serviceIds: string[]): Promise<{ ids: Set<string>; error: boolean }> {
  if (serviceIds.length === 0) return { ids: new Set(), error: false };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id")
    .in("id", serviceIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .limit(DETAIL_RELATION_LIMIT);

  if (error) return { ids: new Set(), error: true };
  return { ids: new Set((data ?? []).map((row) => row.id)), error: false };
}

async function getCenterDetailRelationEligibility(centerId: string): Promise<CenterDetailRelationEligibility> {
  const supabase = createSupabaseServerClient();
  const [locationsResult, servicesResult, practiceLocationsResult] = await Promise.all([
    supabase
      .from("center_locations")
      .select("id")
      .eq("center_id", centerId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT),
    supabase
      .from("center_services")
      .select("id,service_id")
      .eq("center_id", centerId)
      .eq("is_available", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT),
    supabase
      .from("doctor_practice_locations")
      .select("doctor_id")
      .eq("center_id", centerId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT),
  ]);

  if (locationsResult.error || servicesResult.error || practiceLocationsResult.error) {
    return { doctorIds: new Set(), error: true, locationIds: new Set(), serviceIds: new Set() };
  }

  const referencedServiceIds = uniqueStrings((servicesResult.data ?? []).map((row) => row.service_id));
  const activeServiceIds = await getActiveServiceIdSet(referencedServiceIds);
  if (activeServiceIds.error) {
    return { doctorIds: new Set(), error: true, locationIds: new Set(), serviceIds: new Set() };
  }

  const eligibleDoctorIds = await getEligibleDoctorIdSet(uniqueStrings((practiceLocationsResult.data ?? []).map((row) => row.doctor_id)));
  if (eligibleDoctorIds.error) {
    return { doctorIds: new Set(), error: true, locationIds: new Set(), serviceIds: new Set() };
  }

  const serviceIds = new Set(
    (servicesResult.data ?? [])
      .filter((row) => row.service_id === null || activeServiceIds.ids.has(row.service_id))
      .map((row) => row.id),
  );

  return {
    doctorIds: eligibleDoctorIds.ids,
    error: false,
    locationIds: new Set((locationsResult.data ?? []).map((row) => row.id)),
    serviceIds,
  };
}

async function getDoctorDetailRelationEligibility(doctorId: string): Promise<DoctorDetailRelationEligibility> {
  const supabase = createSupabaseServerClient();
  const [servicesResult, practiceLocationsResult] = await Promise.all([
    supabase
      .from("doctor_services")
      .select("id,service_id")
      .eq("doctor_id", doctorId)
      .eq("is_available", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT),
    supabase
      .from("doctor_practice_locations")
      .select("id,center_id,center_location_id")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT),
  ]);

  if (servicesResult.error || practiceLocationsResult.error) {
    return { centerIds: new Set(), error: true, locationIds: new Set(), practiceLocationIds: new Set(), serviceIds: new Set() };
  }

  const referencedServiceIds = uniqueStrings((servicesResult.data ?? []).map((row) => row.service_id));
  const activeServiceIds = await getActiveServiceIdSet(referencedServiceIds);
  if (activeServiceIds.error) {
    return { centerIds: new Set(), error: true, locationIds: new Set(), practiceLocationIds: new Set(), serviceIds: new Set() };
  }

  const centerIds = uniqueStrings((practiceLocationsResult.data ?? []).map((row) => row.center_id));
  const eligibleCenterIds = await getEligibleCenterIdSet(centerIds);
  if (eligibleCenterIds.error) {
    return { centerIds: new Set(), error: true, locationIds: new Set(), practiceLocationIds: new Set(), serviceIds: new Set() };
  }

  const eligiblePracticeRows = (practiceLocationsResult.data ?? []).filter((row) => eligibleCenterIds.ids.has(row.center_id));
  const eligibleLocationCenterIds = uniqueStrings(eligiblePracticeRows.map((row) => row.center_id));

  let locationIds = new Set<string>();
  if (eligibleLocationCenterIds.length > 0) {
    const { data: locationRows, error: locationError } = await supabase
      .from("center_locations")
      .select("id")
      .in("center_id", eligibleLocationCenterIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(DETAIL_RELATION_LIMIT);

    if (locationError) {
      return { centerIds: new Set(), error: true, locationIds: new Set(), practiceLocationIds: new Set(), serviceIds: new Set() };
    }

    locationIds = new Set((locationRows ?? []).map((row) => row.id));
  }

  const serviceIds = new Set(
    (servicesResult.data ?? [])
      .filter((row) => row.service_id === null || activeServiceIds.ids.has(row.service_id))
      .map((row) => row.id),
  );

  return {
    centerIds: eligibleCenterIds.ids,
    error: false,
    locationIds,
    practiceLocationIds: new Set(eligiblePracticeRows.map((row) => row.id)),
    serviceIds,
  };
}

function filterCenterDetailRelations(
  detail: PublicCenterDetail,
  relationEligibility: CenterDetailRelationEligibility,
): PublicCenterDetail {
  const locations = detail.locations.filter((location) => relationEligibility.locationIds.has(location.id));
  const location = detail.location && relationEligibility.locationIds.has(detail.location.id)
    ? detail.location
    : locations[0] ?? null;

  return {
    ...detail,
    doctors: detail.doctors.filter((doctor) => relationEligibility.doctorIds.has(doctor.id)),
    location,
    locations,
    services: detail.services.filter((service) => relationEligibility.serviceIds.has(service.id)),
  };
}

function filterDoctorDetailRelations(
  detail: PublicDoctorDetail,
  relationEligibility: DoctorDetailRelationEligibility,
): PublicDoctorDetail {
  return {
    ...detail,
    practiceLocations: detail.practiceLocations.flatMap((practiceLocation) => {
      if (!relationEligibility.practiceLocationIds.has(practiceLocation.id)) return [];
      if (!relationEligibility.centerIds.has(practiceLocation.center.id)) return [];

      const location = practiceLocation.location && relationEligibility.locationIds.has(practiceLocation.location.id)
        ? practiceLocation.location
        : null;

      return [
        {
          ...practiceLocation,
          contactActions: practiceLocation.location !== null && location === null ? [] : practiceLocation.contactActions,
          location,
        },
      ];
    }),
    services: detail.services.filter((service) => relationEligibility.serviceIds.has(service.id)),
  };
}

async function isPublicCenterSlugEligible(options: PublicCenterDetailOptions): Promise<{
  eligible: boolean;
  error: boolean;
}> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("centers")
    .select("id")
    .eq("slug", options.slug)
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .limit(1);

  if (options.country) query = query.eq("default_country", options.country);

  const { data, error } = await query.maybeSingle();
  if (error) return { eligible: false, error: true };

  return { eligible: data !== null, error: false };
}

async function isPublicDoctorSlugEligible(options: PublicDoctorDetailOptions): Promise<{
  eligible: boolean;
  error: boolean;
}> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("doctors")
    .select("id")
    .eq("slug", options.slug)
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .limit(1);

  if (options.country) query = query.eq("default_country", options.country);

  const { data, error } = await query.maybeSingle();
  if (error) return { eligible: false, error: true };

  return { eligible: data !== null, error: false };
}

export async function listPublicCenters(
  options: PublicCenterListOptions = {},
): Promise<PublicCatalogQueryResult<PublicCenterSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from("centers")
    .select(
      "id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country",
    )
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true })
    .limit(limit);

  if (options.country) query = query.eq("default_country", options.country);
  if (options.centerType) query = query.eq("center_type", options.centerType);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], "no_rows");

  return createSuccessResult(data.map(mapCenterSummary));
}

export async function getPublicCenterBySlug(
  options: PublicCenterDetailOptions,
): Promise<PublicCatalogQueryResult<PublicCenterDetail | null>> {
  const eligibility = await isPublicCenterSlugEligible(options);

  if (eligibility.error) return createErrorResult(null);
  if (!eligibility.eligible) return createSuccessResult(null, "no_rows");

  const detailResult = await getUngatedPublicCenterBySlug(options);
  if (!detailResult.ok || !detailResult.data) return detailResult;

  const relationEligibility = await getCenterDetailRelationEligibility(detailResult.data.id);
  if (relationEligibility.error) return createErrorResult(null);

  return createSuccessResult(filterCenterDetailRelations(detailResult.data, relationEligibility));
}

export async function listPublicDoctors(
  options: PublicDoctorListOptions = {},
): Promise<PublicCatalogQueryResult<PublicDoctorSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from("doctors")
    .select("id,slug,full_name_en,full_name_ar,title,gender,default_country")
    .eq("is_active", true)
    .eq("status", "active")
    .in("verification_status", verificationStatusFilterValues())
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("full_name_en", { ascending: true })
    .limit(limit);

  if (options.country) query = query.eq("default_country", options.country);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], "no_rows");

  return createSuccessResult(data.map(mapDoctorSummary));
}

export async function getPublicDoctorBySlug(
  options: PublicDoctorDetailOptions,
): Promise<PublicCatalogQueryResult<PublicDoctorDetail | null>> {
  const eligibility = await isPublicDoctorSlugEligible(options);

  if (eligibility.error) return createErrorResult(null);
  if (!eligibility.eligible) return createSuccessResult(null, "no_rows");

  const detailResult = await getUngatedPublicDoctorBySlug(options);
  if (!detailResult.ok || !detailResult.data) return detailResult;

  const relationEligibility = await getDoctorDetailRelationEligibility(detailResult.data.id);
  if (relationEligibility.error) return createErrorResult(null);

  return createSuccessResult(filterDoctorDetailRelations(detailResult.data, relationEligibility));
}

export async function searchPublicCatalog(
  query: string,
  options: PublicSearchOptions = {},
): Promise<PublicCatalogQueryResult<PublicCatalogSearchResult>> {
  const normalizedQuery = normalizeSearchQuery(query);
  const emptySearch: PublicCatalogSearchResult = { centers: [], doctors: [], services: [], areas: [] };

  if (normalizedQuery.length < 2) {
    return createSuccessResult(emptySearch, "search_query_too_short");
  }

  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);
  const searchValue = `%${normalizedQuery}%`;

  const [centersResult, doctorsResult, servicesResult, areasResult] = await Promise.all([
    supabase
      .from("centers")
      .select(
        "id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country",
      )
      .eq("is_active", true)
      .eq("status", "active")
      .in("verification_status", verificationStatusFilterValues())
      .is("deleted_at", null)
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true })
      .limit(limit),
    supabase
      .from("doctors")
      .select("id,slug,full_name_en,full_name_ar,title,gender,default_country")
      .eq("is_active", true)
      .eq("status", "active")
      .in("verification_status", verificationStatusFilterValues())
      .is("deleted_at", null)
      .or(`full_name_en.ilike.${searchValue},full_name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order("sort_order", { ascending: true })
      .order("full_name_en", { ascending: true })
      .limit(limit),
    supabase
      .from("services")
      .select("id,slug,name_en,name_ar,category_id,description_en,description_ar")
      .eq("is_active", true)
      .is("deleted_at", null)
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true })
      .limit(limit),
    supabase
      .from("geo_areas")
      .select("id,slug,name_en,name_ar,city_id,country_id")
      .eq("is_active", true)
      .is("deleted_at", null)
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true })
      .limit(limit),
  ]);

  if (centersResult.error || doctorsResult.error || servicesResult.error || areasResult.error) {
    return createErrorResult(emptySearch);
  }

  return createSuccessResult({
    centers: (centersResult.data ?? []).map(mapCenterSummary),
    doctors: (doctorsResult.data ?? []).map(mapDoctorSummary),
    services: (servicesResult.data ?? []).map(mapServiceSummary),
    areas: (areasResult.data ?? []).map(mapGeoAreaSummary),
  });
}
