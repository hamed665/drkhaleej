export type PublicCatalogLocale = 'en' | 'ar';

export type PublicCatalogCountry = 'om';

export type PublicCatalogSlug = 'doctors' | 'centers' | 'pharmacies' | 'labs' | 'services' | 'search';

export type PublicCatalogEmptyReason =
  | 'no_rows'
  | 'unsupported_entity'
  | 'query_not_implemented'
  | 'query_error'
  | 'search_query_too_short';

export type PublicCatalogQueryError = {
  code: 'PUBLIC_CATALOG_QUERY_FAILED';
  message: 'Public catalog query failed.';
};

export type PublicCatalogQueryResult<T> = {
  ok: boolean;
  data: T;
  emptyReason: PublicCatalogEmptyReason | null;
  error: PublicCatalogQueryError | null;
};

export type PublicDiscoveryCategory = {
  slug: Exclude<PublicCatalogSlug, 'search'>;
  label: string;
};

export type PublicCenterSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
  centerType: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  defaultCountry: string;
};

export type PublicDoctorSummary = {
  id: string;
  slug: string;
  fullNameEn: string;
  fullNameAr: string | null;
  titleEn: string | null;
  titleAr: string | null;
  gender: string | null;
  defaultCountry: string;
};

export type PublicServiceSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  categoryId: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
};

export type PublicGeoAreaSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  cityId: string;
  countryId: string;
};

export type PublicCatalogSearchResult = {
  centers: PublicCenterSummary[];
  doctors: PublicDoctorSummary[];
  services: PublicServiceSummary[];
  areas: PublicGeoAreaSummary[];
};
