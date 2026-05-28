import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import type {
  PublicCatalogQueryError,
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterDetail,
  PublicCenterDetailDoctorSummary,
  PublicCenterDetailLocationSummary,
  PublicCenterDetailOptions,
  PublicCenterDetailServiceSummary,
  PublicCenterListOptions,
  PublicCenterSummary,
  PublicDiscoveryCategory,
  PublicDoctorDetail,
  PublicDoctorDetailOptions,
  PublicDoctorDetailServiceSummary,
  PublicDoctorDetailSpecialtySummary,
  PublicDoctorListOptions,
  PublicDoctorPracticeLocationSummary,
  PublicDoctorSummary,
  PublicGeoAreaListOptions,
  PublicGeoAreaSummary,
  PublicSearchOptions,
  PublicServiceListOptions,
  PublicServiceSummary
} from './public-types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_SEARCH_QUERY_LENGTH = 64;

type CenterRow = Database['public']['Tables']['centers']['Row'];
type CenterLocationRow = Database['public']['Tables']['center_locations']['Row'];
type CenterServiceRow = Database['public']['Tables']['center_services']['Row'];
type DoctorPracticeLocationRow = Database['public']['Tables']['doctor_practice_locations']['Row'];
type DoctorServiceRow = Database['public']['Tables']['doctor_services']['Row'];
type DoctorRow = Database['public']['Tables']['doctors']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type SpecialtyRow = Database['public']['Tables']['specialties']['Row'];
type GeoAreaRow = Database['public']['Tables']['geo_areas']['Row'];
type GeoCityRow = Database['public']['Tables']['geo_cities']['Row'];
type GeoCountryRow = Database['public']['Tables']['geo_countries']['Row'];

function clampLimit(limit: number | undefined): number {
  if (typeof limit !== 'number' || Number.isNaN(limit)) return DEFAULT_LIMIT;
  if (limit < 1) return 1;
  return Math.min(limit, MAX_LIMIT);
}


function normalizeSearchQuery(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH);
}

function createSuccessResult<T>(data: T, emptyReason: PublicCatalogQueryResult<T>['emptyReason'] = null): PublicCatalogQueryResult<T> {
  return { ok: true, data, emptyReason, error: null };
}

function createErrorResult<T>(fallbackData: T): PublicCatalogQueryResult<T> {
  const error: PublicCatalogQueryError = {
    code: 'PUBLIC_CATALOG_QUERY_FAILED',
    message: 'Public catalog query failed.'
  };

  return {
    ok: false,
    data: fallbackData,
    emptyReason: 'query_error',
    error
  };
}

function createDiscoveryCategories(): PublicDiscoveryCategory[] {
  return [
    { slug: 'doctors', label: 'Doctors' },
    { slug: 'centers', label: 'Centers' },
    { slug: 'pharmacies', label: 'Pharmacies' },
    { slug: 'labs', label: 'Labs' },
    { slug: 'services', label: 'Services' }
  ];
}

type PublicCenterBaseRow = Pick<CenterRow, 'id' | 'slug' | 'name_en' | 'name_ar' | 'center_type' | 'description_en' | 'description_ar' | 'short_description_en' | 'short_description_ar' | 'default_country'>;

function mapCenterRow(row: PublicCenterBaseRow): PublicCenterSummary {
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
    defaultCountry: row.default_country
  };
}

type PublicCenterDetailRow = PublicCenterBaseRow & Pick<CenterRow, 'verification_status'>;

function mapCenterDetailRow(
  row: PublicCenterDetailRow,
  location: PublicCenterDetailLocationSummary | null,
  services: PublicCenterDetailServiceSummary[],
  doctors: PublicCenterDetailDoctorSummary[]
): PublicCenterDetail {
  return {
    ...mapCenterRow(row),
    verificationStatus: row.verification_status,
    location,
    services,
    doctors
  };
}

type PublicCenterServiceRow = Pick<
  CenterServiceRow,
  'id' | 'slug' | 'display_name_en' | 'display_name_ar' | 'description_en' | 'description_ar' | 'requires_medical_disclaimer' | 'service_id'
>;

function mapCenterServiceRow(
  row: PublicCenterServiceRow,
  service: Pick<ServiceRow, 'name_en' | 'name_ar' | 'description_en' | 'description_ar'> | null
): PublicCenterDetailServiceSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.display_name_en ?? service?.name_en ?? 'Healthcare service',
    nameAr: row.display_name_ar ?? service?.name_ar ?? null,
    descriptionEn: row.description_en ?? service?.description_en ?? null,
    descriptionAr: row.description_ar ?? service?.description_ar ?? null,
    requiresMedicalDisclaimer: row.requires_medical_disclaimer
  };
}

function mapCenterLocationSummary(
  location: Pick<CenterLocationRow, 'id'>,
  area: Pick<GeoAreaRow, 'name_en' | 'name_ar'> | null,
  city: Pick<GeoCityRow, 'name_en' | 'name_ar'> | null,
  country: Pick<GeoCountryRow, 'name_en' | 'name_ar'> | null
): PublicCenterDetailLocationSummary {
  return {
    id: location.id,
    areaNameEn: area?.name_en ?? null,
    areaNameAr: area?.name_ar ?? null,
    cityNameEn: city?.name_en ?? null,
    cityNameAr: city?.name_ar ?? null,
    countryNameEn: country?.name_en ?? null,
    countryNameAr: country?.name_ar ?? null
  };
}

function mapDoctorRow(row: Pick<DoctorRow, 'id' | 'slug' | 'full_name_en' | 'full_name_ar' | 'title' | 'gender' | 'default_country'>): PublicDoctorSummary {
  return {
    id: row.id,
    slug: row.slug,
    fullNameEn: row.full_name_en,
    fullNameAr: row.full_name_ar,
    titleEn: row.title,
    titleAr: row.title,
    gender: row.gender,
    defaultCountry: row.default_country
  };
}


type PublicDoctorDetailRow = Pick<
  DoctorRow,
  | 'id'
  | 'slug'
  | 'full_name_en'
  | 'full_name_ar'
  | 'display_name_en'
  | 'display_name_ar'
  | 'title'
  | 'gender'
  | 'bio_en'
  | 'bio_ar'
  | 'profile_image_url'
  | 'years_experience'
  | 'primary_specialty_id'
  | 'default_country'
  | 'verification_status'
>;

type PublicSpecialtyRow = Pick<SpecialtyRow, 'id' | 'name_en' | 'name_ar' | 'description_en' | 'description_ar'>;

type PublicDoctorServiceRow = Pick<
  DoctorServiceRow,
  | 'id'
  | 'slug'
  | 'display_name_en'
  | 'display_name_ar'
  | 'description_en'
  | 'description_ar'
  | 'requires_medical_disclaimer'
  | 'service_id'
  | 'specialty_id'
>;

type PublicDoctorPracticeLocationRow = Pick<
  DoctorPracticeLocationRow,
  'id' | 'center_id' | 'center_location_id' | 'primary_specialty_id'
>;

type PublicPracticeCenterRow = PublicCenterBaseRow & Pick<CenterRow, 'verification_status'>;

type PublicCenterLocationLookupRow = Pick<CenterLocationRow, 'id' | 'center_id' | 'area_id' | 'city_id' | 'country_id'>;

function mapSpecialtyRow(row: PublicSpecialtyRow): PublicDoctorDetailSpecialtySummary {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar
  };
}

function mapDoctorServiceRow(
  row: PublicDoctorServiceRow,
  service: Pick<ServiceRow, 'name_en' | 'name_ar' | 'description_en' | 'description_ar'> | null,
  specialty: PublicDoctorDetailSpecialtySummary | null
): PublicDoctorDetailServiceSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.display_name_en ?? service?.name_en ?? specialty?.nameEn ?? 'Healthcare service',
    nameAr: row.display_name_ar ?? service?.name_ar ?? specialty?.nameAr ?? null,
    descriptionEn: row.description_en ?? service?.description_en ?? specialty?.descriptionEn ?? null,
    descriptionAr: row.description_ar ?? service?.description_ar ?? specialty?.descriptionAr ?? null,
    requiresMedicalDisclaimer: row.requires_medical_disclaimer
  };
}

function mapDoctorDetailRow(
  row: PublicDoctorDetailRow,
  primarySpecialty: PublicDoctorDetailSpecialtySummary | null,
  services: PublicDoctorDetailServiceSummary[],
  practiceLocations: PublicDoctorPracticeLocationSummary[]
): PublicDoctorDetail {
  return {
    ...mapDoctorRow(row),
    displayNameEn: row.display_name_en,
    displayNameAr: row.display_name_ar,
    bioEn: row.bio_en,
    bioAr: row.bio_ar,
    profileImageUrl: row.profile_image_url,
    yearsExperience: row.years_experience,
    verificationStatus: row.verification_status,
    primarySpecialty,
    services,
    practiceLocations
  };
}

async function getPublicSpecialtiesByIds(
  specialtyIds: string[]
): Promise<{ specialtiesById: Map<string, PublicDoctorDetailSpecialtySummary>; error: boolean }> {
  const specialtiesById = new Map<string, PublicDoctorDetailSpecialtySummary>();
  const uniqueIds = Array.from(new Set(specialtyIds.filter(Boolean)));
  if (uniqueIds.length === 0) return { specialtiesById, error: false };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('specialties')
    .select('id,name_en,name_ar,description_en,description_ar')
    .in('id', uniqueIds);

  if (error) return { specialtiesById, error: true };

  for (const specialty of data ?? []) {
    specialtiesById.set(specialty.id, mapSpecialtyRow(specialty));
  }

  return { specialtiesById, error: false };
}

async function listPublicDoctorServices(
  doctorId: string,
  limit: number
): Promise<{ services: PublicDoctorDetailServiceSummary[]; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('doctor_services')
    .select('id,slug,display_name_en,display_name_ar,description_en,description_ar,requires_medical_disclaimer,service_id,specialty_id')
    .eq('doctor_id', doctorId)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) return { services: [], error: true };

  const rows = data ?? [];
  const serviceIds = Array.from(new Set(rows.map((row) => row.service_id).filter((id): id is string => Boolean(id))));
  const specialtyIds = Array.from(new Set(rows.map((row) => row.specialty_id).filter((id): id is string => Boolean(id))));
  const servicesById = new Map<string, Pick<ServiceRow, 'name_en' | 'name_ar' | 'description_en' | 'description_ar'>>();

  if (serviceIds.length > 0) {
    const { data: serviceRows, error: serviceRowsError } = await supabase
      .from('services')
      .select('id,name_en,name_ar,description_en,description_ar')
      .in('id', serviceIds);

    if (serviceRowsError) return { services: [], error: true };

    for (const service of serviceRows ?? []) {
      servicesById.set(service.id, service);
    }
  }

  const specialtiesResult = await getPublicSpecialtiesByIds(specialtyIds);
  if (specialtiesResult.error) return { services: [], error: true };

  return {
    services: rows.map((row) =>
      mapDoctorServiceRow(
        row,
        row.service_id ? servicesById.get(row.service_id) ?? null : null,
        row.specialty_id ? specialtiesResult.specialtiesById.get(row.specialty_id) ?? null : null
      )
    ),
    error: false
  };
}

async function getPublicLocationSummariesByLocation(
  locations: PublicCenterLocationLookupRow[]
): Promise<{ locationsById: Map<string, PublicCenterDetailLocationSummary>; error: boolean }> {
  const locationsById = new Map<string, PublicCenterDetailLocationSummary>();
  if (locations.length === 0) return { locationsById, error: false };

  const supabase = createSupabaseServerClient();
  const areaIds = Array.from(new Set(locations.map((location) => location.area_id).filter((id): id is string => Boolean(id))));
  const cityIds = Array.from(new Set(locations.map((location) => location.city_id)));
  const countryIds = Array.from(new Set(locations.map((location) => location.country_id)));

  const areasById = new Map<string, Pick<GeoAreaRow, 'name_en' | 'name_ar'>>();
  const citiesById = new Map<string, Pick<GeoCityRow, 'name_en' | 'name_ar'>>();
  const countriesById = new Map<string, Pick<GeoCountryRow, 'name_en' | 'name_ar'>>();

  if (areaIds.length > 0) {
    const { data, error } = await supabase.from('geo_areas').select('id,name_en,name_ar').in('id', areaIds);
    if (error) return { locationsById, error: true };
    for (const area of data ?? []) areasById.set(area.id, area);
  }

  const { data: cities, error: citiesError } = await supabase.from('geo_cities').select('id,name_en,name_ar').in('id', cityIds);
  if (citiesError) return { locationsById, error: true };
  for (const city of cities ?? []) citiesById.set(city.id, city);

  const { data: countries, error: countriesError } = await supabase.from('geo_countries').select('id,name_en,name_ar').in('id', countryIds);
  if (countriesError) return { locationsById, error: true };
  for (const country of countries ?? []) countriesById.set(country.id, country);

  for (const location of locations) {
    locationsById.set(
      location.id,
      mapCenterLocationSummary(
        location,
        location.area_id ? areasById.get(location.area_id) ?? null : null,
        citiesById.get(location.city_id) ?? null,
        countriesById.get(location.country_id) ?? null
      )
    );
  }

  return { locationsById, error: false };
}

async function listPublicDoctorPracticeLocations(
  doctorId: string,
  limit: number
): Promise<{ practiceLocations: PublicDoctorPracticeLocationSummary[]; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('doctor_practice_locations')
    .select(
      'id,center_id,center_location_id,primary_specialty_id'
    )
    .eq('doctor_id', doctorId)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) return { practiceLocations: [], error: true };

  const rows = data ?? [];
  if (rows.length === 0) return { practiceLocations: [], error: false };

  const centerIds = Array.from(new Set(rows.map((row) => row.center_id)));
  const specialtyIds = Array.from(new Set(rows.map((row) => row.primary_specialty_id).filter((id): id is string => Boolean(id))));

  const { data: centers, error: centersError } = await supabase
    .from('centers')
    .select(
      'id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country,verification_status'
    )
    .in('id', centerIds);

  if (centersError) return { practiceLocations: [], error: true };

  const centersById = new Map<string, PublicPracticeCenterRow>();
  for (const center of centers ?? []) centersById.set(center.id, center);

  const { data: centerLocations, error: centerLocationsError } = await supabase
    .from('center_locations')
    .select('id,center_id,area_id,city_id,country_id')
    .in('center_id', centerIds)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true });

  if (centerLocationsError) return { practiceLocations: [], error: true };

  const locationRows = centerLocations ?? [];
  const explicitLocationsById = new Map(locationRows.map((location) => [location.id, location]));
  const firstLocationsByCenterId = new Map<string, PublicCenterLocationLookupRow>();

  for (const location of locationRows) {
    if (!firstLocationsByCenterId.has(location.center_id)) firstLocationsByCenterId.set(location.center_id, location);
  }

  const selectedLocations = rows
    .map((row) => (row.center_location_id ? explicitLocationsById.get(row.center_location_id) ?? null : firstLocationsByCenterId.get(row.center_id) ?? null))
    .filter((location): location is PublicCenterLocationLookupRow => Boolean(location));

  const locationResult = await getPublicLocationSummariesByLocation(selectedLocations);
  if (locationResult.error) return { practiceLocations: [], error: true };

  const specialtiesResult = await getPublicSpecialtiesByIds(specialtyIds);
  if (specialtiesResult.error) return { practiceLocations: [], error: true };

  return {
    practiceLocations: rows.flatMap((row) => {
      const center = centersById.get(row.center_id);
      if (!center) return [];

      const selectedLocation = row.center_location_id
        ? explicitLocationsById.get(row.center_location_id) ?? null
        : firstLocationsByCenterId.get(row.center_id) ?? null;

      return [
        {
          id: row.id,
          center: {
            id: center.id,
            slug: center.slug,
            nameEn: center.name_en,
            nameAr: center.name_ar,
            centerType: center.center_type,
            shortDescriptionEn: center.short_description_en,
            shortDescriptionAr: center.short_description_ar,
            defaultCountry: center.default_country,
            verificationStatus: center.verification_status
          },
          primarySpecialty: row.primary_specialty_id ? specialtiesResult.specialtiesById.get(row.primary_specialty_id) ?? null : null,
          location: selectedLocation ? locationResult.locationsById.get(selectedLocation.id) ?? null : null
        }
      ];
    }),
    error: false
  };
}

function mapServiceRow(row: Pick<ServiceRow, 'id' | 'slug' | 'name_en' | 'name_ar' | 'category_id' | 'description_en' | 'description_ar'>): PublicServiceSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    categoryId: row.category_id,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar
  };
}

function mapGeoAreaRow(row: Pick<GeoAreaRow, 'id' | 'slug' | 'name_en' | 'name_ar' | 'city_id' | 'country_id'>): PublicGeoAreaSummary {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    cityId: row.city_id,
    countryId: row.country_id
  };
}

export async function listPublicDiscoveryCategories(): Promise<PublicCatalogQueryResult<PublicDiscoveryCategory[]>> {
  return createSuccessResult(createDiscoveryCategories(), null);
}

export async function listPublicCenters(options: PublicCenterListOptions = {}): Promise<PublicCatalogQueryResult<PublicCenterSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from('centers')
    .select(
      'id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country'
    )
    .order('sort_order', { ascending: true })
    .order('name_en', { ascending: true })
    .limit(limit);

  if (options.country) query = query.eq('default_country', options.country);
  if (options.centerType) query = query.eq('center_type', options.centerType);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], 'no_rows');

  return createSuccessResult(data.map(mapCenterRow));
}


async function getPublicCenterLocation(
  centerId: string
): Promise<{ location: PublicCenterDetailLocationSummary | null; error: boolean }> {
  const supabase = createSupabaseServerClient();

  const { data: location, error: locationError } = await supabase
    .from('center_locations')
    .select('id,area_id,city_id,country_id')
    .eq('center_id', centerId)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (locationError) return { location: null, error: true };
  if (!location) return { location: null, error: false };

  const [areaResult, cityResult, countryResult] = await Promise.all([
    location.area_id
      ? supabase.from('geo_areas').select('name_en,name_ar').eq('id', location.area_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('geo_cities').select('name_en,name_ar').eq('id', location.city_id).maybeSingle(),
    supabase.from('geo_countries').select('name_en,name_ar').eq('id', location.country_id).maybeSingle()
  ]);

  if (areaResult.error || cityResult.error || countryResult.error) {
    return { location: null, error: true };
  }

  return {
    location: mapCenterLocationSummary(location, areaResult.data, cityResult.data, countryResult.data),
    error: false
  };
}

async function listPublicCenterServices(
  centerId: string,
  limit: number
): Promise<{ services: PublicCenterDetailServiceSummary[]; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('center_services')
    .select('id,slug,display_name_en,display_name_ar,description_en,description_ar,requires_medical_disclaimer,service_id')
    .eq('center_id', centerId)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) return { services: [], error: true };

  const rows = data ?? [];
  const serviceIds = Array.from(new Set(rows.map((row) => row.service_id).filter((id): id is string => Boolean(id))));

  const servicesById = new Map<string, Pick<ServiceRow, 'name_en' | 'name_ar' | 'description_en' | 'description_ar'>>();

  if (serviceIds.length > 0) {
    const { data: serviceRows, error: serviceRowsError } = await supabase
      .from('services')
      .select('id,name_en,name_ar,description_en,description_ar')
      .in('id', serviceIds);

    if (serviceRowsError) return { services: [], error: true };

    for (const service of serviceRows ?? []) {
      servicesById.set(service.id, service);
    }
  }

  return {
    services: rows.map((row) => mapCenterServiceRow(row, row.service_id ? servicesById.get(row.service_id) ?? null : null)),
    error: false
  };
}

async function listPublicCenterDoctors(
  centerId: string,
  limit: number
): Promise<{ doctors: PublicCenterDetailDoctorSummary[]; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data: practiceLocations, error: practiceLocationsError } = await supabase
    .from('doctor_practice_locations')
    .select('doctor_id')
    .eq('center_id', centerId)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (practiceLocationsError) return { doctors: [], error: true };

  const doctorIds = Array.from(new Set((practiceLocations ?? []).map((row) => row.doctor_id)));
  if (doctorIds.length === 0) return { doctors: [], error: false };

  const { data: doctors, error: doctorsError } = await supabase
    .from('doctors')
    .select('id,slug,full_name_en,full_name_ar,title,gender,default_country')
    .in('id', doctorIds)
    .order('sort_order', { ascending: true })
    .order('full_name_en', { ascending: true })
    .limit(limit);

  if (doctorsError) return { doctors: [], error: true };
  return { doctors: (doctors ?? []).map(mapDoctorRow), error: false };
}

export async function getPublicCenterBySlug(
  options: PublicCenterDetailOptions
): Promise<PublicCatalogQueryResult<PublicCenterDetail | null>> {
  const supabase = createSupabaseServerClient();
  const servicesLimit = clampLimit(options.servicesLimit ?? 6);
  const doctorsLimit = clampLimit(options.doctorsLimit ?? 6);

  let query = supabase
    .from('centers')
    .select(
      'id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country,verification_status'
    )
    .eq('slug', options.slug)
    .limit(1);

  if (options.country) query = query.eq('default_country', options.country);

  const { data: center, error } = await query.maybeSingle();
  if (error) return createErrorResult(null);
  if (!center) return createSuccessResult(null, 'no_rows');

  const [locationResult, servicesResult, doctorsResult] = await Promise.all([
    getPublicCenterLocation(center.id),
    listPublicCenterServices(center.id, servicesLimit),
    listPublicCenterDoctors(center.id, doctorsLimit)
  ]);

  if (locationResult.error || servicesResult.error || doctorsResult.error) {
    return createErrorResult(null);
  }

  return createSuccessResult(
    mapCenterDetailRow(center, locationResult.location, servicesResult.services, doctorsResult.doctors)
  );
}

export async function listPublicDoctors(options: PublicDoctorListOptions = {}): Promise<PublicCatalogQueryResult<PublicDoctorSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from('doctors')
    .select('id,slug,full_name_en,full_name_ar,title,gender,default_country')
    .order('sort_order', { ascending: true })
    .order('full_name_en', { ascending: true })
    .limit(limit);

  if (options.country) query = query.eq('default_country', options.country);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], 'no_rows');

  return createSuccessResult(data.map(mapDoctorRow));
}


export async function getPublicDoctorBySlug(
  options: PublicDoctorDetailOptions
): Promise<PublicCatalogQueryResult<PublicDoctorDetail | null>> {
  const supabase = createSupabaseServerClient();
  const servicesLimit = clampLimit(options.servicesLimit ?? 6);
  const practiceLocationsLimit = clampLimit(options.practiceLocationsLimit ?? 6);

  let query = supabase
    .from('doctors')
    .select(
      'id,slug,full_name_en,full_name_ar,display_name_en,display_name_ar,title,gender,bio_en,bio_ar,profile_image_url,years_experience,primary_specialty_id,default_country,verification_status'
    )
    .eq('slug', options.slug)
    .limit(1);

  if (options.country) query = query.eq('default_country', options.country);

  const { data: doctor, error } = await query.maybeSingle();
  if (error) return createErrorResult(null);
  if (!doctor) return createSuccessResult(null, 'no_rows');

  const [primarySpecialtyResult, servicesResult, practiceLocationsResult] = await Promise.all([
    getPublicSpecialtiesByIds(doctor.primary_specialty_id ? [doctor.primary_specialty_id] : []),
    listPublicDoctorServices(doctor.id, servicesLimit),
    listPublicDoctorPracticeLocations(doctor.id, practiceLocationsLimit)
  ]);

  if (primarySpecialtyResult.error || servicesResult.error || practiceLocationsResult.error) {
    return createErrorResult(null);
  }

  return createSuccessResult(
    mapDoctorDetailRow(
      doctor,
      doctor.primary_specialty_id ? primarySpecialtyResult.specialtiesById.get(doctor.primary_specialty_id) ?? null : null,
      servicesResult.services,
      practiceLocationsResult.practiceLocations
    )
  );
}

export async function listPublicServices(options: PublicServiceListOptions = {}): Promise<PublicCatalogQueryResult<PublicServiceSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from('services')
    .select('id,slug,name_en,name_ar,category_id,description_en,description_ar')
    .order('sort_order', { ascending: true })
    .order('name_en', { ascending: true })
    .limit(limit);

  if (options.categoryId) query = query.eq('category_id', options.categoryId);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], 'no_rows');

  return createSuccessResult(data.map(mapServiceRow));
}

export async function listPublicGeoAreas(options: PublicGeoAreaListOptions = {}): Promise<PublicCatalogQueryResult<PublicGeoAreaSummary[]>> {
  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);

  let query = supabase
    .from('geo_areas')
    .select('id,slug,name_en,name_ar,city_id,country_id')
    .order('sort_order', { ascending: true })
    .order('name_en', { ascending: true })
    .limit(limit);

  if (options.countryId) query = query.eq('country_id', options.countryId);
  if (options.cityId) query = query.eq('city_id', options.cityId);

  const { data, error } = await query;
  if (error) return createErrorResult([]);
  if (!data || data.length === 0) return createSuccessResult([], 'no_rows');

  return createSuccessResult(data.map(mapGeoAreaRow));
}

export async function searchPublicCatalog(
  query: string,
  options: PublicSearchOptions = {}
): Promise<PublicCatalogQueryResult<PublicCatalogSearchResult>> {
  const normalizedQuery = normalizeSearchQuery(query);
  const emptySearch: PublicCatalogSearchResult = { centers: [], doctors: [], services: [], areas: [] };

  if (normalizedQuery.length < 2) {
    return createSuccessResult(emptySearch, 'search_query_too_short');
  }

  const supabase = createSupabaseServerClient();
  const limit = clampLimit(options.limit);
  const searchValue = `%${normalizedQuery}%`;

  const [centersResult, doctorsResult, servicesResult, areasResult] = await Promise.all([
    supabase
      .from('centers')
      .select(
        'id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country'
      )
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order('sort_order', { ascending: true })
      .order('name_en', { ascending: true })
      .limit(limit),
    supabase
      .from('doctors')
      .select('id,slug,full_name_en,full_name_ar,title,gender,default_country')
      .or(`full_name_en.ilike.${searchValue},full_name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order('sort_order', { ascending: true })
      .order('full_name_en', { ascending: true })
      .limit(limit),
    supabase
      .from('services')
      .select('id,slug,name_en,name_ar,category_id,description_en,description_ar')
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order('sort_order', { ascending: true })
      .order('name_en', { ascending: true })
      .limit(limit),
    supabase
      .from('geo_areas')
      .select('id,slug,name_en,name_ar,city_id,country_id')
      .or(`name_en.ilike.${searchValue},name_ar.ilike.${searchValue},slug.ilike.${searchValue}`)
      .order('sort_order', { ascending: true })
      .order('name_en', { ascending: true })
      .limit(limit)
  ]);

  if (centersResult.error || doctorsResult.error || servicesResult.error || areasResult.error) {
    return createErrorResult(emptySearch);
  }

  return createSuccessResult({
    centers: (centersResult.data ?? []).map(mapCenterRow),
    doctors: (doctorsResult.data ?? []).map(mapDoctorRow),
    services: (servicesResult.data ?? []).map(mapServiceRow),
    areas: (areasResult.data ?? []).map(mapGeoAreaRow)
  });
}
