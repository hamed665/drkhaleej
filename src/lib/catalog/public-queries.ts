import { createSupabaseServerClient } from '@/lib/supabase/server';

import type {
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterSummary,
  PublicDiscoveryCategory,
  PublicDoctorSummary,
  PublicGeoAreaSummary,
  PublicServiceSummary
} from './public-types';

type RawRow = Record<string, unknown>;

type QueryOutput = {
  data: RawRow[] | null;
  error: { message?: string } | null;
};

function createEmptyResult<T>(data: T, emptyReason: PublicCatalogQueryResult<T>['emptyReason']): PublicCatalogQueryResult<T> {
  return {
    ok: true,
    data,
    emptyReason,
    error: null
  };
}

function createSuccessResult<T>(data: T): PublicCatalogQueryResult<T> {
  return {
    ok: true,
    data,
    emptyReason: null,
    error: null
  };
}

function createErrorResult<T>(fallbackData: T): PublicCatalogQueryResult<T> {
  return {
    ok: false,
    data: fallbackData,
    emptyReason: 'query_error',
    error: {
      code: 'PUBLIC_CATALOG_QUERY_FAILED',
      message: 'Public catalog query failed.'
    }
  };
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function mapCenter(row: RawRow): PublicCenterSummary | null {
  const id = readString(row.id);
  const slug = readString(row.slug);
  const nameEn = readString(row.name_en);
  const centerType = readString(row.center_type);
  const defaultCountry = readString(row.default_country);

  if (!id || !slug || !nameEn || !centerType || !defaultCountry) {
    return null;
  }

  return {
    id,
    slug,
    nameEn,
    nameAr: readNullableString(row.name_ar),
    centerType,
    descriptionEn: readNullableString(row.short_description_en),
    descriptionAr: readNullableString(row.short_description_ar),
    defaultCountry
  };
}

function mapDoctor(row: RawRow): PublicDoctorSummary | null {
  const id = readString(row.id);
  const slug = readString(row.slug);
  const fullNameEn = readString(row.full_name_en);
  const defaultCountry = readString(row.default_country);

  if (!id || !slug || !fullNameEn || !defaultCountry) {
    return null;
  }

  return {
    id,
    slug,
    fullNameEn,
    fullNameAr: readNullableString(row.full_name_ar),
    titleEn: readNullableString(row.title_en),
    titleAr: readNullableString(row.title_ar),
    gender: readNullableString(row.gender),
    defaultCountry
  };
}

function mapService(row: RawRow): PublicServiceSummary | null {
  const id = readString(row.id);
  const slug = readString(row.slug);
  const nameEn = readString(row.name_en);
  const nameAr = readString(row.name_ar);

  if (!id || !slug || !nameEn || !nameAr) {
    return null;
  }

  return {
    id,
    slug,
    nameEn,
    nameAr,
    categoryId: readNullableString(row.category_id),
    descriptionEn: readNullableString(row.description_en),
    descriptionAr: readNullableString(row.description_ar)
  };
}

function mapGeoArea(row: RawRow): PublicGeoAreaSummary | null {
  const id = readString(row.id);
  const slug = readString(row.slug);
  const nameEn = readString(row.name_en);
  const nameAr = readString(row.name_ar);
  const cityId = readString(row.city_id);
  const countryId = readString(row.country_id);

  if (!id || !slug || !nameEn || !nameAr || !cityId || !countryId) {
    return null;
  }

  return {
    id,
    slug,
    nameEn,
    nameAr,
    cityId,
    countryId
  };
}

async function runSelect(table: string, columns: string, limit: number): Promise<QueryOutput> {
  const supabase = createSupabaseServerClient();
  const queryBuilder = supabase.from(table as never).select(columns).limit(limit);
  const result = (await queryBuilder) as unknown;

  if (typeof result !== 'object' || result === null || !('data' in result) || !('error' in result)) {
    return { data: null, error: { message: 'Unknown query response.' } };
  }

  const data = (result as { data: unknown }).data;
  const error = (result as { error: unknown }).error;

  const safeData = Array.isArray(data) ? (data as RawRow[]) : null;
  const safeError =
    typeof error === 'object' && error !== null
      ? ({ message: (error as { message?: unknown }).message as string | undefined } as { message?: string })
      : null;

  return { data: safeData, error: safeError };
}

export async function listPublicDiscoveryCategories(): Promise<PublicCatalogQueryResult<PublicDiscoveryCategory[]>> {
  return createSuccessResult([
    { slug: 'doctors', label: 'Doctors' },
    { slug: 'centers', label: 'Centers' },
    { slug: 'pharmacies', label: 'Pharmacies' },
    { slug: 'labs', label: 'Labs' },
    { slug: 'services', label: 'Services' }
  ]);
}

export async function listPublicCenters(limit = 20): Promise<PublicCatalogQueryResult<PublicCenterSummary[]>> {
  const output = await runSelect(
    'centers',
    'id,slug,name_en,name_ar,center_type,short_description_en,short_description_ar,default_country',
    limit
  );

  if (output.error) {
    return createErrorResult([]);
  }

  const rows = output.data ?? [];
  const mapped = rows.map(mapCenter).filter((row): row is PublicCenterSummary => row !== null);

  return mapped.length === 0 ? createEmptyResult([], 'no_rows') : createSuccessResult(mapped);
}

export async function listPublicDoctors(limit = 20): Promise<PublicCatalogQueryResult<PublicDoctorSummary[]>> {
  const output = await runSelect('doctors', 'id,slug,full_name_en,full_name_ar,title_en,title_ar,gender,default_country', limit);

  if (output.error) {
    return createErrorResult([]);
  }

  const rows = output.data ?? [];
  const mapped = rows.map(mapDoctor).filter((row): row is PublicDoctorSummary => row !== null);

  return mapped.length === 0 ? createEmptyResult([], 'no_rows') : createSuccessResult(mapped);
}

export async function listPublicServices(limit = 20): Promise<PublicCatalogQueryResult<PublicServiceSummary[]>> {
  const output = await runSelect('services', 'id,slug,name_en,name_ar,category_id,description_en,description_ar', limit);

  if (output.error) {
    return createErrorResult([]);
  }

  const rows = output.data ?? [];
  const mapped = rows.map(mapService).filter((row): row is PublicServiceSummary => row !== null);

  return mapped.length === 0 ? createEmptyResult([], 'no_rows') : createSuccessResult(mapped);
}

export async function listPublicGeoAreas(limit = 20): Promise<PublicCatalogQueryResult<PublicGeoAreaSummary[]>> {
  const output = await runSelect('geo_areas', 'id,slug,name_en,name_ar,city_id,country_id', limit);

  if (output.error) {
    return createErrorResult([]);
  }

  const rows = output.data ?? [];
  const mapped = rows.map(mapGeoArea).filter((row): row is PublicGeoAreaSummary => row !== null);

  return mapped.length === 0 ? createEmptyResult([], 'no_rows') : createSuccessResult(mapped);
}

export async function searchPublicCatalog(query: string, perGroupLimit = 10): Promise<PublicCatalogQueryResult<PublicCatalogSearchResult>> {
  const normalizedQuery = query.trim();

  const empty: PublicCatalogSearchResult = {
    centers: [],
    doctors: [],
    services: [],
    areas: []
  };

  if (normalizedQuery.length < 2) {
    return createEmptyResult(empty, 'search_query_too_short');
  }

  const [centersResult, doctorsResult, servicesResult, areasResult] = await Promise.all([
    listPublicCenters(perGroupLimit),
    listPublicDoctors(perGroupLimit),
    listPublicServices(perGroupLimit),
    listPublicGeoAreas(perGroupLimit)
  ]);

  const contains = (value: string | null): boolean =>
    typeof value === 'string' && value.toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase());

  const result: PublicCatalogSearchResult = {
    centers: centersResult.data.filter((item) => contains(item.nameEn) || contains(item.nameAr) || contains(item.slug)),
    doctors: doctorsResult.data.filter((item) => contains(item.fullNameEn) || contains(item.fullNameAr) || contains(item.slug)),
    services: servicesResult.data.filter((item) => contains(item.nameEn) || contains(item.nameAr) || contains(item.slug)),
    areas: areasResult.data.filter((item) => contains(item.nameEn) || contains(item.nameAr) || contains(item.slug))
  };

  const hadError = !centersResult.ok || !doctorsResult.ok || !servicesResult.ok || !areasResult.ok;
  if (hadError) {
    return createErrorResult(result);
  }

  const isEmpty =
    result.centers.length === 0 && result.doctors.length === 0 && result.services.length === 0 && result.areas.length === 0;

  return isEmpty ? createEmptyResult(result, 'no_rows') : createSuccessResult(result);
}
