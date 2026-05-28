import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import type {
  PublicCatalogQueryError,
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterListOptions,
  PublicCenterSummary,
  PublicDiscoveryCategory,
  PublicDoctorListOptions,
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
type DoctorRow = Database['public']['Tables']['doctors']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type GeoAreaRow = Database['public']['Tables']['geo_areas']['Row'];

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

function mapCenterRow(row: Pick<CenterRow, 'id' | 'slug' | 'name_en' | 'name_ar' | 'center_type' | 'description_en' | 'description_ar' | 'short_description_en' | 'short_description_ar' | 'default_country'>): PublicCenterSummary {
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
